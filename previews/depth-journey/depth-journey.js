/* Native scroll remains the input; only the reading plane moves in depth. */
window.DepthJourney=(()=>{
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function pose(phase,side=1){
  const enter=clamp(phase/.18,0,1),leave=clamp((phase-.76)/.24,0,1);
  return {scale:1-(1-enter)*.28+leave*.16,opacity:clamp(.28+enter*.72-leave,0,1),x:side*((1-enter)*18+leave*85)};
 }
 function locate(y,stops,span){let index=0;while(index<stops.length-1&&y>=stops[index+1])index++;const end=stops[index+1]??stops[index]+span;return {index,phase:clamp((y-stops[index])/Math.max(1,end-stops[index]),0,1)};}
 function create(){
  const sections=[...document.querySelectorAll('main>section')],panels=sections.map(s=>s.firstElementChild),toggle=document.querySelector('#reading-toggle');
  let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,manualPlain=false,enabled=false,stops=[],span=1000,current=0,initial=true,resizing=false;
  function topOf(el){return el.getBoundingClientRect().top+scrollY;}
  function measure(){stops=sections.map(topOf);}
  function expose(index){sections.forEach((section,i)=>{const visible=!enabled||i===index;section.classList.toggle('journey-current',visible);panels[i].inert=!visible;if(visible)panels[i].removeAttribute('aria-hidden');else panels[i].setAttribute('aria-hidden','true');});}
  function read(){
   if(!stops.length)measure();const found=locate(scrollY+(enabled?0:110),stops,span);current=found.index;expose(current);
   document.body.classList.toggle('journey-right',sections[current].classList.contains('right'));
   if(enabled){const p=pose(current===0?Math.max(.18,found.phase):found.phase,sections[current].classList.contains('right')?1:-1),panel=panels[current];panel.style.setProperty('--scene-scale',p.scale);panel.style.setProperty('--scene-opacity',p.opacity);panel.style.setProperty('--scene-x',p.x+'px');}
   return {enabled,active:current,progress:clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1)};
  }
  function resize(preserve=true){
   if(resizing)return;resizing=true;const was=enabled,old=current,oldPhase=locate(scrollY,stops,span).phase;
   span=Math.max(800,innerHeight*1.65);document.body.style.setProperty('--journey-span',span+'px');
   enabled=!paused&&!manualPlain&&innerHeight>=520;document.body.classList.toggle('depth-enabled',enabled);
   if(enabled){const heights=panels.map(p=>p.getBoundingClientRect().height);if(heights.some(h=>h>innerHeight-170)){enabled=false;document.body.classList.remove('depth-enabled');}else panels.forEach((p,i)=>p.style.setProperty('--scene-top',Math.max(92,(innerHeight-heights[i])*.46)+'px'));}
   measure();expose(current);toggle.setAttribute('aria-pressed',String(!enabled));toggle.textContent=enabled?'Reading view':paused?'Reading view':'Return to journey';toggle.disabled=paused;
   if(!initial&&preserve&&(was||enabled))scrollTo({top:Math.max(0,stops[old]+(enabled?span*(was?oldPhase:.22):-105)),behavior:'instant'});
   initial=false;resizing=false;read();
  }
  function go(hash,updateHistory=false){const id=decodeURIComponent(hash.slice(1)),el=document.getElementById(id);if(!el)return;const i=sections.indexOf(el);if(i<0&&id!=='top')return;const destination=i<0?0:i;measure();if(updateHistory)history.pushState(null,'',hash);scrollTo({top:Math.max(0,stops[destination]+(enabled&&destination>0?span*.22:0)-(enabled?0:95)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(!link||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const hash=link.getAttribute('href');if(hash==='#')return;const el=document.getElementById(decodeURIComponent(hash.slice(1)));if(!el)return;if(sections.includes(el)||el.id==='top'){e.preventDefault();go(hash,true);}});
  addEventListener('hashchange',()=>go(location.hash));addEventListener('popstate',()=>{if(location.hash)go(location.hash);});
  toggle.addEventListener('click',()=>{manualPlain=enabled;resize();document.dispatchEvent(new Event('journey-mode'));});
  resize(false);if(location.hash)requestAnimationFrame(()=>go(location.hash));
  return {read,resize:()=>resize(),setPaused(value){if(value!==paused){paused=value;resize();}},enabled:()=>enabled};
 }
 return {pose,locate,create};
})();
