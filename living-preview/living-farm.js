/* Original low-poly models and animation. Three.js is supplied by the loader. */
window.createLivingFarm = function(T) {
  'use strict';
  const B=window.FarmBehaviour;
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'default'});
  renderer.domElement.id='living-farm';renderer.domElement.setAttribute('aria-hidden','true');
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const scene=new T.Scene();scene.background=new T.Color('#d5e1d7');scene.fog=new T.Fog('#d5e1d7',58,175);
  const camera=new T.PerspectiveCamera(56,1,.15,220);
  scene.add(new T.HemisphereLight('#fff8e7','#64774b',2.5));
  const sun=new T.DirectionalLight('#fff1ce',3.1);sun.position.set(-25,45,25);scene.add(sun);
  const materials=new Map();
  function mat(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.83,metalness:.05}));return materials.get(color);}
  const geo={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,10,7),cylinder:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,10)};
  function mesh(parent,type,color,x,y,z,sx,sy,sz){const m=new T.Mesh(geo[type],typeof color==='string'?mat(color):color);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
  function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function box(parent,color,x,y,z,w,h,d){return mesh(parent,'box',color,x,y,z,w,h,d);}
  function ball(parent,color,x,y,z,r){return mesh(parent,'sphere',color,x,y,z,r,r,r);}
  function canvasTexture(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'));const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;}
  const shadowTex=canvasTexture(64,64,c=>{const g=c.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(30,45,20,.29)');g.addColorStop(1,'rgba(30,45,20,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
  const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false});
  function shadow(parent,x,z,w,d){const m=new T.Mesh(new T.PlaneGeometry(w,d),shadowMat);m.rotation.x=-Math.PI/2;m.position.set(x,.025,z);parent.add(m);return m;}
  // Stable batches keep hundreds of panels to a handful of draw calls.
  const dummy=new T.Object3D();
  function batch(type,color,transforms){
    const m=new T.InstancedMesh(geo[type],typeof color==='string'?mat(color):color,transforms.length);
    transforms.forEach((a,i)=>{dummy.position.set(a[0],a[1],a[2]);dummy.scale.set(a[3],a[4],a[5]);dummy.rotation.set(a[6]||0,a[7]||0,a[8]||0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});
    m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();scene.add(m);return m;
  }
  box(scene,'#a5b783',0,-.15,-180,240,.25,700);
  box(scene,'#d4c6a6',0,-.005,-180,5.4,.04,700);
  for(const x of [-2.7,2.7])box(scene,'#e4ddc2',x,.015,-180,.16,.06,700);
  const gravel=[],grass=[],panel=[],posts=[];
  const texture=canvasTexture(256,128,c=>{c.fillStyle='#244d64';c.fillRect(0,0,256,128);for(let x=0;x<8;x++)for(let y=0;y<3;y++){c.fillStyle=(x+y)%2?'#21495f':'#29536b';c.fillRect(x*32+1,y*42.6+1,30,40.6);c.strokeStyle='#83adbd';c.lineWidth=.65;c.strokeRect(x*32+1,y*42.6+1,30,40.6);}});
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const panelMat=new T.MeshStandardMaterial({map:texture,color:'#ffffff',roughness:.4,metalness:.24});
  for(let r=0;r<54;r++)for(const side of [-1,1])for(let col=0;col<4;col++){
    const d=8+r*7,x=side*(7.25+col*6.65);
    if((side===1&&d>17&&d<49)||(side===-1&&d>109&&d<137)||(side===1&&d>224&&d<252))continue;
    panel.push([x,1.7,-d,5.85,.09,3.45,.27]);
    for(const px of [x-2,x+2])posts.push([px,.74,-d,.09,1.48,.1]);
  }
  const panelBatch=batch('box',panelMat,panel);batch('box','#89948b',posts);
  for(let i=0;i<370;i++){const seed=Math.sin(i*71.37)*1342.83,fract=seed-Math.floor(seed);gravel.push([(fract-.5)*4.8,.025,-i*.92,.045,.018,.035,0,i]);}
  batch('box','#afa17e',gravel);
  for(let i=0;i<120;i++){const side=i%2?1:-1;grass.push([side*(31+(i%7)*1.3),.23,-i*3.1,.8,.45,.7]);}
  batch('sphere','#879b67',grass);
  const actors=[],socks=[],birds=[];
  const actorLayer=document.querySelector('#actor-layer');
  const speech=document.querySelector('#farm-speech');
  let width=1,height=1,camDistance=0,time=0,lastSpeech=null,quality=1.5;
  function say(actor,text,duration=4){
    lastSpeech={actor,text,until:time+duration};speech.textContent=text;speech.hidden=false;
    document.querySelector('#farm-live').textContent=actor.name+': '+text;
  }
  function register(name,g,d,phrases,greeting){
    const a={id:'actor-'+actors.length,name,g,d,phrases,greeting,reaction:B.createReaction(),clock:0,lastTime:0,greeted:false,update(){}};
    const button=document.createElement('button');button.type='button';button.className='actor-hotspot';button.hidden=true;button.setAttribute('aria-label','Interact with '+name);button.title='Say hello to '+name;button.innerHTML='<span class="actor-cross">+</span><span class="actor-name"></span>';button.querySelector('.actor-name').textContent=name;
    button.addEventListener('click',()=>interact(a));actorLayer.append(button);a.button=button;
    g.traverse(o=>{if(o.isMesh)o.userData.actor=a;});actors.push(a);return a;
  }
  function interact(a){
    const level=B.react(a.reaction,time);say(a,a.phrases[level-1]);
    window.dispatchEvent(new Event('farm-interaction'));
  }
  function human(parent,x,z,vest='#e88837',skin='#c79874'){
    const g=group(parent,x,0,z),body=group(g,0,0,0);
    box(body,vest,0,1.08,0,.47,.58,.3);box(body,'#e5e9bc',0,1.03,.158,.46,.055,.015);
    for(const xx of [-.14,.14])box(body,'#e5e9bc',xx,1.15,.16,.055,.43,.015);
    const head=group(body,0,1.57,0);ball(head,skin,0,0,0,.205);
    mesh(head,'sphere','#f4d25f',0,.145,0,.23,.13,.23);mesh(head,'cylinder','#f4d25f',0,.11,.025,.265,.035,.265);
    for(const xx of [-.075,.075])ball(head,'#243e36',xx,.015,.181,.022);
    const brows=[box(head,'#4d3d2b',-.073,.074,.18,.065,.018,.025),box(head,'#4d3d2b',.073,.074,.18,.065,.018,.025)];
    const arms=[group(body,-.3,1.29,0),group(body,.3,1.29,0)];
    arms.forEach(a=>{box(a,vest,0,-.19,0,.17,.38,.19);ball(a,skin,0,-.43,0,.09);});
    const legs=[group(body,-.14,.78,0),group(body,.14,.78,0)];
    legs.forEach(l=>{box(l,'#324d54',0,-.30,0,.20,.61,.22);box(l,'#26352f',0,-.63,.055,.23,.16,.36);});
    shadow(g,0,0,1.3,1.1);
    function pose(t,{walk=false,wave=false,angry=false,tablet=false}={}){
      const swing=walk?Math.sin(t*6.2)*.52:0;
      legs[0].rotation.x=swing;legs[1].rotation.x=-swing;
      arms[0].rotation.set(-swing*.7,0,0);arms[1].rotation.set(swing*.7,0,0);
      if(wave){arms[1].rotation.x=-.25;arms[1].rotation.z=2.4+Math.sin(t*8)*.3;}
      if(tablet){arms[0].rotation.x=-.9;arms[1].rotation.x=-.9;}
      if(angry){arms[0].rotation.z=-.55;arms[1].rotation.z=.55;head.rotation.y=Math.sin(t*13)*.15;}
      else head.rotation.y=Math.sin(t*.6)*.06;
      brows[0].rotation.z=angry?-.35:0;brows[1].rotation.z=angry?.35:0;
      body.position.y=walk?Math.abs(Math.sin(t*6.2))*.035:Math.sin(t*1.8)*.008;
    }
    return {g,body,head,arms,legs,pose};
  }
  function worker(name,x,d,mode,phrases,greeting){
    const h=human(scene,x,-d,mode==='supervisor'?'#d5bd52':'#e88837');
    const a=register(name,h.g,d,phrases,greeting);a.human=h;
    if(mode==='tablet'||mode==='supervisor')box(h.body,'#344f56',0,1.10,.4,.32,.24,.045);
    const baseX=x;
    a.update=(t,reacting)=>{
      const angry=reacting&&a.reaction.level>=2;
      const greet=camDistance>d-21&&camDistance<d+2;
      h.pose(reacting?time:t,{walk:mode==='walk'&&!reacting,wave:(mode==='welcome'&&greet&&!angry)||(reacting&&!angry),angry,tablet:!reacting&&(mode==='tablet'||mode==='supervisor')});
      if(mode==='walk'){h.g.position.z=-d+Math.sin(t*.28)*2.8;h.g.rotation.y=Math.cos(t*.28)>0?0:Math.PI;}
      else h.g.rotation.y=x>0?-.35:.35;
      if(mode==='clean'&&!reacting)h.arms[1].rotation.x=-1.0+Math.sin(t*1.8)*.35;
      h.g.position.x=baseX;
    };return a;
  }
  worker('Aarav · site host',3.45,8,'welcome',["Hi! Welcome aboard. Scroll to explore!","Yes, hello again! I do have a day job.","Alright, alright! The solar farm needs me too."],"Hi! Welcome aboard. Take a look around!");
  worker('Mia · site engineer',-3.55,51,'tablet',["Checking the next work package.","One second — these numbers matter.","You have officially become a project risk!"],"Good engineering starts with a clear plan.");
  worker('Sam · technician',3.65,88,'clean',["Making every panel count!","These panels will not inspect themselves.","Here, you take the clipboard. I need a break."],"Welcome to the operating arrays!");
  worker('Noah · maintenance',-3.7,153,'walk',["Morning! Just doing my rounds.","Another inspection?","I am adding your clicks to the maintenance log."],"Every detail has a place in the system.");
  worker('Lea · supervisor',3.5,202,'supervisor',["Looking for the engineer behind all this?","The schedule says fewer interruptions.","That is it. Mandatory coffee break!"],"The next stop is Mayank’s project experience.");
  worker('Alex · site guide',-3.45,243,'welcome',["Liked the tour? Let’s connect!","The résumé button is up there!","Hire the engineer. The crew insists."],"Liked the tour? Hire the engineer!");
  // Wheels share one low-detail geometry. All drivers are original jointed models.
  function vehicleWheels(g,x,zs,r=.32){const wheels=[];for(const xx of [-x,x])for(const zz of zs){const m=mesh(g,'cylinder','#283b36',xx,r,zz,r,.18,r);m.rotation.z=Math.PI/2;wheels.push(m);}return wheels;}
  const fork=group(scene,6,0,-29);box(fork,'#d2a33c',0,.56,0,1.3,.7,1.8);box(fork,'#3c5144',0,1.05,.1,.68,.4,.7);
  for(const xx of [-.55,.55])for(const zz of [-.6,.6])box(fork,'#3d5149',xx,1.55,zz,.08,1.6,.08);
  box(fork,'#e5b84b',0,2.34,0,1.4,.12,1.6);const forkWheels=vehicleWheels(fork,.7,[-.59,.58]);
  const mast=group(fork,0,0,1.15);for(const x of [-.42,.42])box(mast,'#4d5e55',x,1.2,0,.1,2.4,.12);
  const forks=group(mast,0,.45,0);for(const x of [-.4,.4])box(forks,'#718078',x,0,.55,.13,.09,1.1);
  const pallet=group(forks,0,.19,.48);box(pallet,'#b49768',0,0,0,1.15,.16,.95);for(let j=0;j<3;j++)box(pallet,'#315b6c',0,.15+j*.08,0,1.05,.065,.84);
  const driver=human(fork,0,.15);driver.g.scale.setScalar(.55);driver.g.position.y=.78;driver.pose(0,{tablet:true});shadow(fork,0,0,2.6,3.8);
  const forklift=register('Forklift crew',fork,29,["Precious cargo coming through!","You rang? Again?","Alright, you are on pallet duty now."],"Delivery time! Watch the side lane.");
  forklift.update=(t,r)=>{const s=B.shuttle(t,30);fork.position.z=-B.lerp(24,41,s.value);fork.position.x=5.8;fork.rotation.y=s.direction>0?Math.PI:0;forks.position.y=.45+s.loading*.65;forkWheels.forEach(w=>w.rotation.x=s.value*28);driver.pose(r?time:t,{wave:r,tablet:!r,angry:r&&forklift.reaction.level>1});};
  const truck=group(scene,10,0,-35);box(truck,'#486a5c',0,.67,0,2,.45,5);box(truck,'#e4e7d6',0,1.4,1.65,2,1.4,1.6);box(truck,'#557c85',0,1.55,2.47,1.65,.65,.02);
  box(truck,'#ad986f',0,1.0,-.8,1.9,.2,3.2);for(let j=0;j<3;j++)box(truck,'#315268',0,1.18+j*.14,-.8,1.65,.11,2.7);
  for(const x of [-.7,.7])box(truck,'#ffedb6',x,1.0,2.49,.23,.14,.03);
  const truckWheels=vehicleWheels(truck,1.04,[-1.5,1.55],.4);shadow(truck,0,0,3.6,6.7);
  const trucker=human(truck,.48,1.7);trucker.g.scale.setScalar(.6);trucker.g.position.y=.72;
  const delivery=register('Delivery truck',truck,37,["Special delivery for a brighter future.","No, this is not a taxi!","You can explain the delay to my dispatcher."],"Panels, cables, possibilities.");
  delivery.update=(t,r)=>{const s=B.shuttle(t+8,48);truck.position.z=-B.lerp(32,46,s.value);truck.rotation.y=s.direction>0?Math.PI:0;truckWheels.forEach(w=>w.rotation.x=s.value*22);trucker.pose(r?time:t,{wave:r,angry:r&&delivery.reaction.level>1});};
  // Mobile crane on outriggers, lifting a cabinet inside the construction bay.
  const crane=group(scene,15,0,-25);box(crane,'#d4ae42',0,.75,0,2.8,.8,4.2);vehicleWheels(crane,1.4,[-1.4,1.4],.4);
  for(const x of [-1,1])for(const z of [-1.3,1.3]){box(crane,'#768478',x*1.9,.35,z,2.2,.18,.2);box(crane,'#586650',x*2.8,.16,z,.4,.3,.4);}
  const turret=group(crane,0,1.25,0);box(turret,'#e4bd52',0,.35,0,1.8,.7,1.6);box(turret,'#5b8083',-.65,.65,.1,.65,.7,.8);
  const boom=group(turret,0,.6,0);box(boom,'#e0b548',0,3.6,0,.38,7.2,.45);box(boom,'#7c8270',0,7.4,0,.24,1.2,.28);boom.rotation.z=-.65;
  const cable=mesh(turret,'cylinder','#495e51',4.4,2.5,0,.025,3.5,.025);
  const load=group(turret,4.4,.8,0);box(load,'#d6dfcc',0,0,0,.85,1.3,.65);box(load,'#456c69',0,.1,.33,.6,.4,.02);shadow(crane,0,0,7,7);
  const craneDriver=human(turret,-.65,.3);craneDriver.g.scale.setScalar(.5);craneDriver.g.position.y=.35;
  const operator=register('Crane operator',crane,25,["Steady hands. Big ambitions.","You are interrupting my precision!","I am putting your clicks on the lift plan."],"A little heavy lifting behind the scenes.");
  operator.update=(t,r)=>{turret.rotation.y=Math.sin(t*.17)*.3;const lift=1.8+Math.sin(t*.55)*.9;load.position.y=lift;cable.position.y=(6.95+lift+.65)/2;cable.scale.y=6.95-lift-.65;craneDriver.pose(r?time:t,{wave:r,angry:r&&operator.reaction.level>1});};
  // Site details and destinations.
  function sign(x,d,title,subtitle){
    const g=group(scene,x,0,-d);box(g,'#718368',0,1.15,0,.09,2.3,.09);
    const tex=canvasTexture(512,224,c=>{c.fillStyle='#244d3c';c.fillRect(0,0,512,224);c.fillStyle='#f0cf83';c.fillRect(24,27,46,5);c.font='bold 32px sans-serif';c.fillStyle='#f8f6df';c.fillText(title,24,95);c.font='19px sans-serif';c.fillStyle='#c2d1b2';c.fillText(subtitle,24,151);});
    const panel=new T.Mesh(new T.PlaneGeometry(2.6,1.14),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));panel.position.y=2.15;g.add(panel);return g;
  }
  sign(-3.9,13,'MAYANK VEKARIYA','SYSTEMS / ENERGY / EXECUTION');sign(3.9,48,'01 / DELIVERY','GOOD WORK STARTS WITH A PLAN');sign(-3.9,105,'02 / OPERATIONS','EVERY PART HAS A PURPOSE');sign(3.9,185,'03 / IDEAS INTO ACTION','EXPLORE THE PROJECTS');sign(3.9,248,'LET’S CONNECT','THE NEXT CHAPTER STARTS HERE');
  function cabin(x,d,name){const g=group(scene,x,0,-d);box(g,'#e2e2cc',0,1.6,0,5.5,3.2,4);box(g,'#567963',0,3.26,0,5.8,.2,4.3);box(g,'#65858a',-1,1.85,2.02,1.8,1.1,.04);box(g,'#789377',1.5,1.1,2.03,.9,2.2,.05);shadow(g,0,0,7,6);sign(x,d-3,name,'TECHNICAL SITE / AUTHORISED ACCESS');return g;}
  cabin(-10,121,'CONTROL CABIN');cabin(9,237,'SITE OFFICE');
  for(let d=111;d<131;d+=5){box(scene,'#c3cbbb',-5,1,-d,1.2,2,.7);box(scene,'#4d7574',-5,1.4,-d+.36,.8,.3,.02);}
  for(let i=0;i<8;i++){const g=group(scene,4.1+i*.9,0,-19);box(g,'#394e41',0,.05,0,.4,.1,.4);mesh(g,'cone','#e28c43',0,.35,0,.16,.6,.16);mesh(g,'cylinder','#f4e8b7',0,.38,0,.105,.1,.105);}
  for(let i=0;i<6;i++){const g=group(scene,8+(i%3)*1.7,0,-20-Math.floor(i/3)*3);box(g,'#a78b5e',0,.15,0,1.3,.2,1);for(let j=0;j<4;j++)box(g,'#315768',0,.3+j*.09,0,1.2,.07,.9);}
  const reel=group(scene,5.6,.65,-45);const drum=mesh(reel,'cylinder','#a68b5c',0,0,0,.6,.8,.6);drum.rotation.z=Math.PI/2;const cableDrum=mesh(reel,'cylinder','#425348',0,0,0,.43,.82,.43);cableDrum.rotation.z=Math.PI/2;
  for(const d of [57,141,214]){const g=group(scene,-3.4,0,-d);box(g,'#75866b',0,2,0,.065,4,.065);const sock=group(g,0,3.8,0);for(let j=0;j<5;j++)box(sock,j%2?'#f4e4ba':'#dd8a4c',.2+j*.27,0,0,.27,.25-j*.025,.25-j*.025);socks.push(sock);}
  for(let i=0;i<5;i++){const g=group(scene,0,8,-70);const wings=[box(g,'#738674',-.2,0,0,.5,.035,.16),box(g,'#738674',.2,0,0,.5,.035,.16)];birds.push({g,wings,phase:i*1.7});}
  // Exact hit testing respects occlusion by panels and equipment.
  const ray=new T.Raycaster(),point=new T.Vector2(),anchor=new T.Vector3(),headAnchor=new T.Vector3();
  let pointerStart=null;
  function fromEvent(e){point.set(e.clientX/width*2-1,-e.clientY/height*2+1);ray.setFromCamera(point,camera);}
  const block='a,button,summary,details,.container,header,footer,.farm-speech,.tour-hud,.site-activity';
  function down(e){if(e.target.closest(block))return;pointerStart={x:e.clientX,y:e.clientY};}
  function up(e){if(!pointerStart)return;const start=pointerStart;pointerStart=null;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8||e.target.closest(block))return;fromEvent(e);const hit=ray.intersectObjects(scene.children,true)[0];if(hit?.object.userData.actor)interact(hit.object.userData.actor);}
  document.addEventListener('pointerdown',down);document.addEventListener('pointerup',up);
  const contextLost=e=>{e.preventDefault();window.dispatchEvent(new Event('farm-renderer-lost'));};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  function resize(w,h,dpr){width=w;height=h;renderer.setPixelRatio(Math.min(dpr||1,quality,w<760?1.25:1.5));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function draw(progress,elapsed,paused){
    time=elapsed;camDistance=progress*245;
    camera.position.set(Math.sin(progress*9)*.08,2.65,-camDistance);camera.lookAt(0,1.1,-camDistance-42);camera.updateMatrixWorld();
    const warmActors=[];
    for(const a of actors){
      const ahead=-a.g.position.z-camDistance,near=ahead>-12&&ahead<100;
      a.g.visible=near;if(!near){a.button.hidden=true;a.lastTime=time;continue;}
      const delta=Math.min(.1,Math.max(0,time-a.lastTime));a.lastTime=time;
      const reacting=B.active(a.reaction,time);if(!reacting)a.clock+=delta;
      a.update(a.clock,reacting);
      if(!a.greeted&&B.approach(ahead)&&!paused&&(!lastSpeech||lastSpeech.until<time)){a.greeted=true;say(a,a.greeting,4.5);}
      warmActors.push(a);
    }
    socks.forEach((s,i)=>{s.rotation.y=Math.sin(time*.7+i)*.16;s.rotation.z=Math.sin(time*1.2+i)*.07;});
    birds.forEach(({g,wings,phase})=>{g.position.set(Math.sin(time*.06+phase)*25,8+Math.sin(time*.15+phase),-camDistance-85);wings[0].rotation.z=Math.sin(time*3+phase)*.35;wings[1].rotation.z=-Math.sin(time*3+phase)*.35;});
    scene.updateMatrixWorld();
    for(const a of warmActors){
      headAnchor.set(0,a.human?2.05:3.1,0);a.g.localToWorld(headAnchor);anchor.copy(headAnchor).project(camera);
      const x=(anchor.x*.5+.5)*width,y=(-anchor.y*.5+.5)*height;
      let visible=anchor.z>-1&&anchor.z<1&&x>30&&x<width-30&&y>90&&y<height-100&&-a.g.position.z-camDistance>1;
      if(visible){point.set(anchor.x,anchor.y);ray.setFromCamera(point,camera);const hit=ray.intersectObjects([panelBatch],false)[0];if(hit&&hit.distance<camera.position.distanceTo(headAnchor)-.4)visible=false;}
      if(visible){const over=document.elementFromPoint(x,y);if(over?.closest('.container,header,footer,.site-activity,.tour-hud'))visible=false;}
      a.button.hidden=!visible;
      if(visible){a.button.style.transform=`translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;a.screen={x,y};}
    }
    if(lastSpeech&&lastSpeech.until>=time){const {x,y}=lastSpeech.actor.screen&&!lastSpeech.actor.button.hidden?lastSpeech.actor.screen:{x:width*.5,y:height*.78};speech.hidden=false;speech.style.left=Math.max(120,Math.min(width-120,x))+'px';speech.style.top=Math.max(100,y-32)+'px';speech.dataset.mood=lastSpeech.actor.reaction.level>=2?'grumpy':'friendly';}else speech.hidden=true;
    renderer.render(scene,camera);
  }
  document.body.prepend(renderer.domElement);
  return {resize,draw,actors,setQuality(r){quality=r;resize(width,height,devicePixelRatio);},dispose(){document.removeEventListener('pointerdown',down);document.removeEventListener('pointerup',up);actors.forEach(a=>a.button.remove());renderer.dispose();renderer.domElement.remove();speech.hidden=true;}};
};
