/* One brief greeting per worker per visit; deliberate conversations take priority. */
window.CrewPresence=(()=>{
 function create(){
  const greeted=new Set();let nextGreeting=0;
  return {choose(candidates,now,{paused=false,occupied=false}={}){
   if(paused||occupied||now<nextGreeting)return null;
   const candidate=candidates.filter(a=>a.human&&a.visible&&a.ahead>=4&&a.ahead<=19&&!greeted.has(a.id)).sort((a,b)=>a.ahead-b.ahead)[0];
   if(!candidate)return null;greeted.add(candidate.id);nextGreeting=now+18;return candidate.id;
  }};
 }
 return {create};
})();
