(() => {
  'use strict';
  const scene=window.createSolarWalk(document.querySelector('#solar-scene'));
  if(!scene)document.body.classList.add('no-canvas');
  const sections=[...document.querySelectorAll('section')];
  const nav=document.querySelector('.wayfinder'),label=document.querySelector('#chapter-label'),distance=document.querySelector('#distance'),bar=document.querySelector('.tour-progress'),button=document.querySelector('#motion-toggle');
  const dots=sections.map((s,i)=>{const a=document.createElement('a');a.href='#'+s.id;a.setAttribute('aria-label',s.dataset.stop||s.id);nav.append(a);return a;});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,target=0,position=0,frame=0,active=-1;
  // Anchor-based camera coordinates do not jump when the project gallery expands.
  function read(){
    const y=scrollY+innerHeight*.22,stops=sections.map(s=>s.getBoundingClientRect().top+scrollY);
    let i=0;while(i<stops.length-1&&y>=stops[i+1])i++;
    const next=stops[i+1]??document.documentElement.scrollHeight-innerHeight*.65;
    const fraction=Math.max(0,Math.min(1,(y-stops[i])/Math.max(1,next-stops[i])));
    target=Math.max(0,Math.min(1,(i+fraction)/stops.length));
    if(i!==active){active=i;dots.forEach((d,j)=>d.setAttribute('aria-current',String(j===i)));label.textContent=sections[i].dataset.stop||sections[i].id;}
    bar.style.transform='scaleX('+target+')';request();
  }
  function render(){
    frame=0;if(document.hidden)return;
    if(!paused){position+=(target-position)*.075;if(Math.abs(target-position)<.00002)position=target;}
    if(scene)scene.draw(position);distance.textContent=String(Math.round(position*245));
    if(!paused&&Math.abs(target-position)>.00002)request();
  }
  function request(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
  function resize(){if(scene)scene.resize(innerWidth,innerHeight,devicePixelRatio);read();request();}
  function update(){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
  button.addEventListener('click',()=>{paused=!paused;update();request();});
  reduced.addEventListener('change',e=>{paused=e.matches;update();request();});
  addEventListener('scroll',read,{passive:true});addEventListener('resize',resize);
  document.addEventListener('visibilitychange',request);
  document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',read));
  if('ResizeObserver' in window)new ResizeObserver(read).observe(document.querySelector('main'));
  update();resize();
})();
