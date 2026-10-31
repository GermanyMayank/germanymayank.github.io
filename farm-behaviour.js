/* Shared, deterministic actor rules. No AI service or account is needed. */
window.FarmBehaviour = (() => {
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  function createReaction(){return {count:0,last:-100,until:0,level:0};}
  function react(state,time){
    state.count=time-state.last>9?1:Math.min(3,state.count+1);
    state.last=time;state.until=time+3.8;state.level=state.count;
    return state.level;
  }
  function active(state,time){return time<state.until;}
  // Travel, dwell for unloading, travel back, dwell at the loading point.
  function shuttle(time,duration=32){
    const t=((time%duration)+duration)%duration/duration;
    if(t<.35)return {value:t/.35,direction:1,moving:true,loading:0};
    if(t<.5)return {value:1,direction:1,moving:false,loading:Math.sin((t-.35)/.15*Math.PI)};
    if(t<.85)return {value:1-(t-.5)/.35,direction:-1,moving:true,loading:0};
    return {value:0,direction:-1,moving:false,loading:Math.sin((t-.85)/.15*Math.PI)};
  }
  function approach(distance){return distance>2&&distance<21;}
  function heading(time,duration=32){
    const t=((time%duration)+duration)%duration/duration;
    const smooth=v=>v*v*(3-2*v);
    if(t<.35)return Math.PI;
    if(t<.5)return Math.PI+Math.PI*smooth((t-.35)/.15);
    if(t<.85)return Math.PI*2;
    return Math.PI*2+Math.PI*smooth((t-.85)/.15);
  }
  return {clamp,lerp,createReaction,react,active,shuttle,heading,approach};
})();
