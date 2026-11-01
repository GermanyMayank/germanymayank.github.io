/* Ground-level solar farm. Scroll changes camera Z; rows remain in world space. */
window.createSolarWalk = function(canvas) {
  'use strict';
  const ctx=canvas.getContext('2d'); if(!ctx)return null;
  let w=1,h=1,focal=1,horizon=1,camZ=0,camX=0,eye=2.55,shapes=[];
  const rows=[];
  // Generate geometry once; clip and project only nearby rows while moving.
  for(let row=0;row<55;row++){
    const faces=[],z=8+row*7;
    const add=(p,color,line)=>faces.push({p,color,line});
    for(const side of [-1,1])for(let col=0;col<4;col++){
      const x=side===1?4.2+col*6.7:-10.1-col*6.7,span=5.9;
      add([[x-.2,.025,z+.7],[x+span+.3,.025,z+.7],[x+span+1,.025,z+4.8],[x+.5,.025,z+4.8]],'#72885a55');
      for(const foot of [x+.65,x+span-.65])add([[foot,0,z+1.5],[foot+.10,0,z+1.5],[foot+.10,1.65,z+1.5],[foot,1.65,z+1.5]],'#71816d');
      add([[x,1.12,z],[x+span,1.12,z],[x+span,2.08,z+3.45],[x,2.08,z+3.45]],row%2?'#214955':'#28535f','#91b0ad');
      add([[x,1.04,z],[x+span,1.04,z],[x+span,1.12,z],[x,1.12,z]],'#9baea0');
      for(let cell=1;cell<7;cell++){
        const xx=x+span*cell/7;
        add([[xx,1.126,z],[xx+.018,1.126,z],[xx+.018,2.086,z+3.45],[xx,2.086,z+3.45]],'#94b5b080');
      }
      for(let cell=1;cell<4;cell++){
        const zz=z+3.45*cell/4,yy=1.12+.96*cell/4;
        add([[x,yy+.008,zz],[x+span,yy+.008,zz],[x+span,yy+.015,zz+.022],[x,yy+.015,zz+.022]],'#94b5b080');
      }
    }
    rows.push({z,faces});
  }
  function resize(width,height,dpr){
    w=width;h=height;const ratio=Math.min(dpr||1,1.5);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    focal=Math.max(w*.64,h*.72);horizon=h*(w<760?.43:.40);
  }
  function clip(poly){
    const near=.55,out=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],ain=a[2]>=near,bin=b[2]>=near;
      if(ain)out.push(a);
      if(ain!==bin){const t=(near-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}
    }return out;
  }
  function project(p){return [w/2+p[0]*focal/p[2],horizon+(eye-p[1])*focal/p[2]];}
  function face(points,color,line){
    const local=points.map(p=>[p[0]-camX,p[1],p[2]-camZ]),q=clip(local);
    if(q.length<3)return;
    const screen=q.map(project);
    if(screen.every(p=>p[0]<-2)||screen.every(p=>p[0]>w+2)||screen.every(p=>p[1]>h+2))return;
    shapes.push({q:screen,color,line,z:local.reduce((s,p)=>s+p[2],0)/local.length});
  }
  function line(points,color){
    let [a,b]=points.map(p=>[p[0]-camX,p[1],p[2]-camZ]);if(a[2]<.55&&b[2]<.55)return;
    if(a[2]<.55||b[2]<.55){const t=(.55-a[2])/(b[2]-a[2]),c=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.55];if(a[2]<.55)a=c;else b=c;}
    ctx.strokeStyle=color;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(...project(a));ctx.lineTo(...project(b));ctx.stroke();
  }
  function draw(progress){
    const p=Math.max(0,Math.min(1,progress));camZ=p*245;camX=Math.sin(p*Math.PI*5)*.06;
    // No head bob: a stable viewpoint keeps text comfortable to read.
    ctx.clearRect(0,0,w,h);
    const sky=ctx.createLinearGradient(0,0,0,horizon+60);sky.addColorStop(0,'#bfd5d6');sky.addColorStop(1,'#edf1da');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(w*.76,horizon*.45,2,w*.76,horizon*.45,w*.28);glow.addColorStop(0,'#fff4cf88');glow.addColorStop(1,'#fff4cf00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#a7b993';ctx.beginPath();ctx.moveTo(0,horizon+5);
    for(let x=0;x<=w+40;x+=40)ctx.lineTo(x,horizon-5-Math.sin(x*.009)*8-Math.cos(x*.023)*3);
    ctx.lineTo(w,horizon+40);ctx.lineTo(0,horizon+40);ctx.fill();ctx.fillStyle='#aebd8c';ctx.fillRect(0,horizon+10,w,h);
    shapes=[];
    face([[-300,0,camZ+.56],[300,0,camZ+.56],[300,0,900],[-300,0,900]],'#aebd8c');
    face([[-2.6,.012,camZ+.56],[2.6,.012,camZ+.56],[2.6,.012,900],[-2.6,.012,900]],'#d7ceb0');
    face([[-2.6,.02,camZ+.56],[-2.44,.02,camZ+.56],[-2.44,.02,900],[-2.6,.02,900]],'#e7dfc4');
    face([[2.44,.02,camZ+.56],[2.6,.02,camZ+.56],[2.6,.02,900],[2.44,.02,900]],'#e7dfc4');
    for(const row of rows){if(row.z+4<camZ+.55||row.z>camZ+150)continue;for(const f of row.faces)face(f.p,f.color,f.line);}
    shapes.sort((a,b)=>b.z-a.z);
    for(const s of shapes){ctx.beginPath();s.q.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.closePath();ctx.fillStyle=s.color;ctx.fill();if(s.line){ctx.strokeStyle=s.line;ctx.lineWidth=.8;ctx.stroke();}}
    for(let z=Math.floor(camZ/4)*4;z<camZ+95;z+=4){
      for(const x of [-1.2,1.2])line([[x,.025,z],[x,.025,z+2]],'#b5ad8d55');
      for(let j=0;j<4;j++){const depth=z+1.3-camZ;if(depth<=.7)continue;const x=Math.sin(z*9+j*11)*2.2,[px,py]=project([x-camX,.027,depth]),r=Math.min(2,1.8/depth);ctx.fillStyle='#9f987a70';ctx.fillRect(px,py,r*2,r);}
    }
    const haze=ctx.createLinearGradient(0,horizon-10,0,horizon+120);haze.addColorStop(0,'#e5ebd785');haze.addColorStop(1,'#e5ebd700');ctx.fillStyle=haze;ctx.fillRect(0,horizon-10,w,130);
  }
  return {resize,draw};
};
