import{clamp,smoothStep,progressAt,mediaTime}from'./tour-math.js';
import{SeekController}from'./seek-controller.js';

export function initTour(config){
  const video=document.querySelector('#tour-video'),scene=document.querySelector('.scene'),poster=document.querySelector('.scene-poster');
  const toggle=document.querySelector('#motion-toggle'),fill=document.querySelector('#tour-progress-fill');
  const chapterNumber=document.querySelector('#chapter-number'),chapterName=document.querySelector('#chapter-name');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let preference='';try{preference=localStorage.getItem('portfolio-motion')||''}catch{}
  let reading=reduced.matches||preference==='reading',points=[],current=0,target=0,frame=0,last=0,loaded=false,ready=false,active='';
  const seeker=new SeekController(video);
  toggle.hidden=false;
  const navLinks=[...document.querySelectorAll('.desktop-nav a,.mobile-nav a')];
  function measure(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const header=document.querySelector('.site-header').getBoundingClientRect().height;
    points=config.chapters.map((chapter,i)=>({...chapter,top:i===0?0:clamp(document.getElementById(chapter.id).getBoundingClientRect().top+scrollY-header-25,0,max)}));
    for(let i=1;i<points.length;i++)points[i].top=Math.max(points[i-1].top+1,points[i].top);
    onScroll();
  }
  function updateChapter(){
    const p=[...points].reverse().find(p=>scrollY>=p.top-8)||points[0];
    if(!p||active===p.id)return;active=p.id;
    chapterNumber.textContent=String(config.chapters.findIndex(c=>c.id===p.id)+1).padStart(2,'0');
    chapterName.textContent=p.label;
    for(const link of navLinks){if(link.hash==='#'+p.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  }
  function paint(now){
    frame=0;if(document.hidden)return;
    const delta=last?now-last:16.67;last=now;
    current=reading?target:smoothStep(current,target,delta,config.smoothing);
    fill.style.transform=`scaleX(${current})`;
    if(!reading&&!ready)poster.style.transform=`scale(${1.025+current*.035}) translateY(${-current}%)`;
    if(!reading&&ready)seeker.request(mediaTime(current,config.start,config.end,video.duration));
    if(Math.abs(current-target)>.0001)frame=requestAnimationFrame(paint);else last=0;
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint)}
  function onScroll(){target=progressAt(scrollY,points);updateChapter();schedule()}
  function loadVideo(){
    if(loaded||reading||document.hidden)return;loaded=true;
    video.preload='auto';video.src=config.source;video.load();
  }
  function syncMode(){
    document.body.classList.toggle('reading-mode',reading);
    toggle.setAttribute('aria-pressed',String(reading));
    toggle.textContent=reading?'Enable tour':'Reading mode';
    toggle.setAttribute('aria-label',reading?'Enable scroll-controlled solar farm tour':'Use reading mode with a still background');
    if(!reading){loadVideo();seeker.request(mediaTime(target,config.start,config.end,video.duration||config.end))}
    schedule();
  }
  toggle.addEventListener('click',()=>{
    reading=!reading;preference=reading?'reading':'tour';try{localStorage.setItem('portfolio-motion',preference)}catch{}syncMode();
  });
  reduced.addEventListener('change',()=>{reading=reduced.matches||preference==='reading';syncMode()});
  video.addEventListener('loadeddata',()=>{
    if(video.duration<=config.start){video.removeAttribute('src');video.load();return}
    ready=true;scene.classList.add('has-video');onScroll();
  });
  video.addEventListener('error',()=>{ready=false;scene.classList.remove('has-video')});
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',measure,{passive:true});
  addEventListener('pageshow',measure);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}
    else{measure();loadVideo();schedule()}
  });
  if('ResizeObserver'in window)new ResizeObserver(measure).observe(document.querySelector('main'));
  measure();syncMode();
  return{measure};
}
