export const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
export function smoothStep(current,target,deltaMs=16.67,strength=.14){
  const alpha=1-Math.pow(1-strength,clamp(deltaMs,0,64)/16.67);
  return Math.abs(target-current)<.00015?target:current+(target-current)*alpha;
}
export function progressAt(scrollY,points){
  if(!points.length)return 0;
  if(scrollY<=points[0].top)return points[0].progress;
  for(let i=1;i<points.length;i++){
    if(scrollY<=points[i].top){
      const a=points[i-1],b=points[i];
      const ratio=clamp((scrollY-a.top)/Math.max(1,b.top-a.top));
      return a.progress+(b.progress-a.progress)*ratio;
    }
  }
  return points.at(-1).progress;
}
export function mediaTime(progress,start,end,duration){
  const safeEnd=Math.min(end,Math.max(start,duration-.04));
  return start+clamp(progress)*Math.max(0,safeEnd-start);
}
