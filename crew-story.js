/* Fictional animated hosts. Claims point to existing portfolio sections. */
window.CrewStory = (() => {
  const profiles=[
    {name:'Aarav',role:'Site host',line:'I handle the tools. Mayank handles site coordination. The planning board has the story.',label:'See his experience',href:'#experience'},
    {name:'Mia',role:'Site engineer',line:'Schedules, reporting, technical documentation. Want to see Mayank’s part in all that?',label:'Open the planning board',href:'#experience'},
    {name:'Sam',role:'Technician',line:'Curious about his technical side? The engineering toolkit is a good place to start.',label:'Explore his skills',href:'#skills'},
    {name:'Noah',role:'Maintenance',line:'The interesting part is how the details connect. Have a look at his selected work.',label:'Explore the projects',href:'#projects'},
    {name:'Lea',role:'Site supervisor',line:'You want the evidence. I like that. His projects are in the control room.',label:'See selected projects',href:'#projects'},
    {name:'Alex',role:'Site guide',line:'I could keep talking. His résumé is a better use of your coffee break.',label:'Read the résumé',href:'Resume.pdf'},
    {name:'Ravi',role:'Forklift driver',line:'I move pallets. He coordinates projects. We both appreciate a clear plan.',label:'See his approach',href:'#focus'},
    {name:'Robin',role:'Delivery driver',line:'I brought the panels. The useful delivery is Mayank’s résumé.',label:'Open the résumé',href:'Resume.pdf'},
    {name:'Kai',role:'Crane operator',line:'Big lifts need careful coordination. Take a look at his approach to technical sites.',label:'Explore his approach',href:'#focus'}
  ];
  const stations={proof:['01','Commissioning log','Track record'],focus:['02','Site method','Approach'],experience:['03','Planning board','Experience'],projects:['04','Control room','Projects'],skills:['05','Equipment cabinet','Toolkit'],contact:['06','Site office','Connect']};
  function get(id){const index=Number(String(id).replace('actor-',''));return profiles[index]||profiles[0];}
  function place(x,y,bw,bh,w,h,blockers=[]){
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const choices=[[x,y-bh-26],[x,y+28],[x-bw/2-32,y-bh*.4],[x+bw/2+32,y-bh*.4]];
    const candidates=choices.map(([cx,top],i)=>{
      cx=clamp(cx,16+bw/2,w-16-bw/2);top=clamp(top,90,Math.max(90,h-bh-90));
      const l=cx-bw/2,r=l+bw,b=top+bh;
      const overlap=blockers.reduce((s,q)=>s+Math.max(0,Math.min(r,q.right)-Math.max(l,q.left))*Math.max(0,Math.min(b,q.bottom)-Math.max(top,q.top)),0);
      return {left:cx,top,tail:clamp(x-l,22,bw-22),tailY:clamp(y-top,20,bh-20),side:i===2?'right':i===3?'left':top>y?'above':'below',score:overlap+i*50};
    });
    return candidates.sort((a,b)=>a.score-b.score)[0];
  }
  function build(){
    const el=document.querySelector('#farm-speech');
    el.innerHTML='<div class="crew-heading"><span class="crew-avatar" aria-hidden="true"></span><div><strong id="crew-name"></strong><span id="crew-role"></span></div><button class="crew-close" type="button" aria-label="Close worker dialogue">×</button></div><p id="crew-line"></p><a id="crew-action"></a><span class="crew-caption">Your animated site crew</span>';
    let dismissed=false,current=null;
    const close=()=>{dismissed=true;el.hidden=true;current?.button?.focus({preventScroll:true});};
    el.querySelector('.crew-close').addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden)close();});
    return {
      open(actor,fallback){
        dismissed=false;current=actor;const p=get(actor.id),first=actor.reaction.count===1;
        el.querySelector('#crew-name').textContent=p.name;el.querySelector('#crew-role').textContent=p.role;
        el.querySelector('.crew-avatar').textContent=p.name.slice(0,1);
        const line=first?p.line:fallback;el.querySelector('#crew-line').textContent=line;
        const a=el.querySelector('#crew-action');a.textContent=p.label+' ↗';a.setAttribute('href',p.href);
        if(!p.href.startsWith('#')){a.target='_blank';a.rel='noopener';}else{a.removeAttribute('target');a.removeAttribute('rel');}
        el.dataset.mood=actor.reaction.level>=2?'grumpy':'friendly';el.hidden=false;
        document.querySelector('#farm-live').textContent=p.name+', '+p.role+': '+line;
      },
      render(actor,x,y,w,h,show){
        if(dismissed||!show){el.hidden=true;return;}
        el.hidden=false;const rect=el.getBoundingClientRect();
        const blockers=[...document.querySelectorAll('.site-board,.hero h1,.hero .lead,.hero .button-row,header,.tour-hud')].map(e=>e.getBoundingClientRect());
        const p=place(x,y,rect.width,rect.height,w,h,blockers);
        el.style.left=p.left+'px';el.style.top=p.top+'px';el.style.setProperty('--tail-x',p.tail+'px');el.style.setProperty('--tail-y',p.tailY+'px');el.dataset.tail=p.side;
      },
      holding(){return !el.hidden&&el.matches(':hover,:focus-within');},
      hide(){el.hidden=true;},
      dismissed(){return dismissed;}
    };
  }
  return {profiles,stations,get,place,build};
})();
