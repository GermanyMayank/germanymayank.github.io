(() => {
  'use strict';
  const fallback=window.createSolarWalk(document.querySelector('#solar-scene'));
  if(!fallback)document.body.classList.add('no-canvas');
  const sections=[...document.querySelectorAll('section')];
  const nav=document.querySelector('.wayfinder'),label=document.querySelector('#chapter-label'),distance=document.querySelector('#distance'),bar=document.querySelector('.tour-progress'),button=document.querySelector('#motion-toggle');
  const dots=sections.map(s=>{const a=document.createElement('a');a.href='#'+s.id;a.setAttribute('aria-label',s.dataset.stop||s.id);nav.append(a);return a;});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,target=0,position=0,frame=0,active=-1,world=null,elapsed=0,previous=0,lastPaint=0,slowFrames=0,qualityReduced=false,disposed=false;
  const status=document.querySelector('#farm-status');
  function read(){
    const y=scrollY,stops=sections.map(s=>s.getBoundingClientRect().top+scrollY);
    let i=0;while(i<stops.length-1&&y>=stops[i+1])i++;
    const next=stops[i+1]??document.documentElement.scrollHeight-innerHeight*.65;
    const fraction=Math.max(0,Math.min(1,(y-stops[i])/Math.max(1,next-stops[i])));
    target=Math.max(0,Math.min(1,(i+fraction)/stops.length));
    if(i!==active){active=i;dots.forEach((d,j)=>d.setAttribute('aria-current',String(j===i)));label.textContent=sections[i].dataset.stop||sections[i].id;}
    bar.style.transform='scaleX('+target+')';request();
  }
  function render(stamp){
    frame=0;if(document.hidden||disposed){previous=0;return;}
    const dt=previous?Math.min(.08,(stamp-previous)/1000):1/60;previous=stamp;
    if(!paused){elapsed+=dt;position+=(target-position)*(1-Math.exp(-5.2*dt));if(Math.abs(target-position)<.00002)position=target;}
    if(world){
      if(stamp-lastPaint>15||paused){
        const start=performance.now();world.draw(position,elapsed,paused);lastPaint=stamp;
        if(performance.now()-start>24)slowFrames++;else slowFrames=Math.max(0,slowFrames-1);
        if(slowFrames>35&&!qualityReduced){world.setQuality(1);qualityReduced=true;}
      }
    }else if(fallback)fallback.draw(position);
    distance.textContent=String(Math.round(position*245));
    if(!paused&&(world||Math.abs(target-position)>.00002))request();else previous=0;
  }
  function request(){if(!frame&&!document.hidden&&!disposed)frame=requestAnimationFrame(render);}
  function resize(){fallback?.resize(innerWidth,innerHeight,devicePixelRatio);world?.resize(innerWidth,innerHeight,devicePixelRatio);read();request();}
  function update(){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused);}
  button.addEventListener('click',()=>{paused=!paused;previous=0;update();request();});
  reduced.addEventListener('change',e=>{paused=e.matches;previous=0;update();request();});
  addEventListener('scroll',read,{passive:true});addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{previous=0;if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else request();});
  document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',read));
  if('ResizeObserver' in window)new ResizeObserver(read).observe(document.querySelector('main'));
  addEventListener('farm-interaction',request);
  addEventListener('farm-renderer-lost',()=>{world?.dispose();world=null;document.body.classList.remove('farm-ready');status.textContent='Walking tour · simple view';request();});
  function activityMenu(){
    const list=document.querySelector('#crew-list');
    world.actors.forEach(a=>{const b=document.createElement('button');b.type='button';b.textContent=a.name;b.addEventListener('click',()=>a.button.click());list.append(b);});
  }
  update();resize();
  import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js').then(T=>{
    if(disposed)return;
    world=window.createLivingFarm(T);activityMenu();resize();document.body.classList.add('farm-ready');
    status.textContent='Living solar farm · tap the crew';request();
  }).catch(()=>{world?.dispose();world=null;document.body.classList.remove('farm-ready');status.textContent='Walking tour · simple view';document.querySelector('#site-activity').hidden=true;document.querySelector('#actor-layer').hidden=true;request();});
  addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;if(frame)cancelAnimationFrame(frame);world?.dispose();}else{previous=0;if(frame)cancelAnimationFrame(frame);frame=0;}});
  addEventListener('pageshow',()=>{previous=0;request();});
})();
