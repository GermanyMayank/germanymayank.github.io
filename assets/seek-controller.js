/* Coalesce scroll requests. A slow decoder never builds a queue of old seeks. */
export class SeekController{
  constructor(video,{epsilon=1/90}={}){
    this.video=video;this.epsilon=epsilon;this.target=0;this.busy=false;this.failed=false;
    this.onSeeked=()=>{this.busy=false;clearTimeout(this.watchdog);this.flush()};
    this.onError=()=>{this.failed=true;this.busy=false;clearTimeout(this.watchdog)};
    this.onReady=()=>this.flush();
    video.addEventListener('seeked',this.onSeeked);
    video.addEventListener('loadedmetadata',this.onReady);
    video.addEventListener('error',this.onError);
  }
  request(time){if(Number.isFinite(time)){this.target=Math.max(0,time);this.flush()}}
  flush(){
    const v=this.video;
    if(this.failed||this.busy||v.seeking||v.readyState<1||!Number.isFinite(v.duration)||v.duration<=0)return;
    const time=Math.min(this.target,Math.max(0,v.duration-.04));
    if(Math.abs(v.currentTime-time)<this.epsilon)return;
    this.busy=true;
    try{
      v.currentTime=time;
      this.watchdog=setTimeout(()=>{this.busy=false;this.flush()},700);
    }catch{this.busy=false;this.failed=true}
  }
  dispose(){
    this.failed=true;clearTimeout(this.watchdog);
    this.video.removeEventListener('seeked',this.onSeeked);
    this.video.removeEventListener('loadedmetadata',this.onReady);
    this.video.removeEventListener('error',this.onError);
  }
}
