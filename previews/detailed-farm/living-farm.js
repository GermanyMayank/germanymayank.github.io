/* Original articulated crew and instanced solar modules. Three.js is supplied by the loader. */
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
  const gravel=[],grass=[],panel=[],posts=[],frames=[],rails=[];
  // Five framed modules per table, with split-cell detail and thin busbars.
  const texture=canvasTexture(1024,512,c=>{
    c.fillStyle='#101e2a';c.fillRect(0,0,1024,512);
    for(let m=0;m<5;m++)for(let row=0;row<24;row++)for(let col=0;col<6;col++){
      const x=m*204.8+5+col*32.3,y=6+row*20.75+(row>=12?3:0),w=30.5,h=18.8;
      c.fillStyle=['#142f43','#17364b','#1a3a50'][(m+col+row)%3];
      c.beginPath();c.moveTo(x+2,y);c.lineTo(x+w-2,y);c.lineTo(x+w,y+2);c.lineTo(x+w,y+h-2);c.lineTo(x+w-2,y+h);c.lineTo(x+2,y+h);c.lineTo(x,y+h-2);c.lineTo(x,y+2);c.closePath();c.fill();
      c.strokeStyle='#8babb77a';c.lineWidth=.45;for(let b=1;b<4;b++){c.beginPath();c.moveTo(x+w*b/4,y+1);c.lineTo(x+w*b/4,y+h-1);c.stroke();}
    }
    const shine=c.createLinearGradient(0,0,1024,512);shine.addColorStop(0,'#cce7f01a');shine.addColorStop(.45,'#effaff08');shine.addColorStop(1,'#04142120');c.fillStyle=shine;c.fillRect(0,0,1024,512);
  });
  texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const panelMat=new T.MeshStandardMaterial({map:texture,color:'#ffffff',roughness:.24,metalness:.12});
  const frameMat=new T.MeshStandardMaterial({color:'#acb5b5',roughness:.34,metalness:.78});
  const tilt=.27;
  for(let r=0;r<54;r++)for(const side of [-1,1])for(let col=0;col<4;col++){
    const d=8+r*7,x=side*(7.25+col*6.65);
    if((side===1&&d>17&&d<49)||(side===-1&&d>137&&d<162)||(side===1&&d>205&&d<234))continue;
    panel.push([x,1.7,-d,5.85,.065,2.35,tilt]);
    for(const z of [-1.19,1.19])frames.push([x,1.73-z*Math.sin(tilt),-d+z*Math.cos(tilt),5.91,.065,.045,tilt]);
    for(let j=0;j<=5;j++){const lx=-2.95+j*1.18;frames.push([x+lx,1.745,-d,.045,.065,2.4,tilt]);}
    for(const z of [-.78,.78])rails.push([x,1.57-z*Math.sin(tilt),-d+z*Math.cos(tilt),5.95,.10,.09,tilt]);
    for(const px of [x-2,x+2])posts.push([px,.74,-d,.09,1.48,.1]);
  }
  const panelBatch=batch('box',panelMat,panel);batch('box',frameMat,frames);batch('box','#78858a',rails);batch('box','#89948b',posts);
  for(let i=0;i<370;i++){const seed=Math.sin(i*71.37)*1342.83,fract=seed-Math.floor(seed);gravel.push([(fract-.5)*4.8,.025,-i*.92,.045,.018,.035,0,i]);}
  batch('box','#afa17e',gravel);
  for(let i=0;i<120;i++){const side=i%2?1:-1;grass.push([side*(31+(i%7)*1.3),.23,-i*3.1,.8,.45,.7]);}
  batch('sphere','#879b67',grass);
  const actors=[],socks=[],birds=[];
  const actorLayer=document.querySelector('#actor-layer');
  const speech=document.querySelector('#farm-speech');
  const dialogue=window.CrewStory?.build();
  let width=1,height=1,camDistance=0,time=0,lastSpeech=null,quality=1.5,hello=null;
  const presence=window.CrewPresence.create(),greetingEl=document.querySelector('#crew-greeting');
  function say(actor,text,duration=11){
    lastSpeech={actor,text,until:time+duration};
    if(dialogue)dialogue.open(actor,text);else{speech.textContent=text;speech.hidden=false;document.querySelector('#farm-live').textContent=actor.name+': '+text;}
  }
  function register(name,g,d,phrases,greeting){
    const a={id:'actor-'+actors.length,name,g,d,phrases,greeting,reaction:B.createReaction(),clock:0,lastTime:0,greeted:false,update(){}};
    const button=document.createElement('button');button.type='button';button.className='actor-hotspot';button.hidden=true;button.setAttribute('aria-label','Interact with '+name);button.textContent='Say hello to '+name;
    button.addEventListener('click',()=>interact(a));actorLayer.append(button);a.button=button;
    g.userData.actor=a;
    g.traverse(o=>{if(o.isMesh)o.userData.actor=a;});actors.push(a);return a;
  }
  function interact(a){
    hello=null;greetingEl.hidden=true;a.waveUntil=0;
    const level=B.react(a.reaction,time);
    const line=a.reaction.count===5?'Fine. You are on the team. Safety briefing starts now.':a.phrases[level-1];
    say(a,line);if(a.human)a.g.rotation.y=Math.atan2(camera.position.x-a.g.position.x,camera.position.z-a.g.position.z);
    window.dispatchEvent(new Event('farm-interaction'));
  }
  function human(parent,x,z,vest='#e88837',skin){
    const seed=actors.length,skinTone=skin||['#c18b65','#e0b18a','#8e5d43','#b87b57','#d5a07d','#76503a'][seed%6];
    const helmet=seed%4===1?'#edf0df':seed%4===2?'#e8a64a':'#e4c557',trousers=seed%3===0?'#35474d':'#304553';
    const g=group(parent,x,0,z),body=group(g,0,0,0);
    mesh(body,'sphere',vest,0,1.13,0,.255,.335,.155);
    mesh(body,'sphere',trousers,0,.84,0,.235,.12,.145);
    box(body,'#d8dfb4',0,1.04,.15,.45,.035,.012);
    for(const xx of [-.12,.12])box(body,'#d8dfb4',xx,1.21,.146,.033,.38,.012);
    box(body,'#697461',0,1.22,.16,.018,.45,.016);
    for(const xx of [-.16,.16])box(body,'#b17735',xx,1.0,.157,.10,.09,.025);
    mesh(body,'cylinder',skinTone,0,1.48,0,.068,.12,.068);
    const head=group(body,0,1.65,0);mesh(head,'sphere',skinTone,0,0,0,.145,.18,.14);
    for(const xx of [-.145,.145])ball(head,skinTone,xx,0,0,.035);
    mesh(head,'sphere',skinTone,0,-.005,.138,.025,.036,.035);
    mesh(head,'sphere',helmet,0,.13,-.008,.17,.115,.17);mesh(head,'cylinder',helmet,0,.10,.025,.195,.025,.195);
    box(head,'#eee5c5',0,.17,.153,.028,.09,.016);
    for(const xx of [-.052,.052])ball(head,'#283b37',xx,.025,.126,.010);
    box(head,'#8c6651',0,-.084,.123,.055,.009,.008);
    const brows=[box(head,'#574232',-.052,.061,.13,.041,.009,.012),box(head,'#574232',.052,.061,.13,.041,.009,.012)];
    if(seed%4===1){ball(head,'#4b3730',0,-.08,-.13,.085);ball(head,'#4b3730',0,-.17,-.13,.06);}
    const arms=[group(body,-.285,1.36,0),group(body,.285,1.36,0)],elbows=[];
    arms.forEach(a=>{ball(a,vest,0,-.015,0,.095);mesh(a,'cylinder',vest,0,-.17,0,.075,.30,.075);const elbow=group(a,0,-.32,0);ball(elbow,vest,0,0,0,.074);mesh(elbow,'cylinder','#465b63',0,-.14,0,.059,.28,.059);mesh(elbow,'sphere','#d6cfb5',0,-.31,.015,.065,.09,.062);elbows.push(elbow);});
    const legs=[group(body,-.12,.82,0),group(body,.12,.82,0)],knees=[];
    legs.forEach(l=>{mesh(l,'cylinder',trousers,0,-.19,0,.098,.39,.105);const knee=group(l,0,-.39,0);ball(knee,trousers,0,0,0,.10);mesh(knee,'cylinder',trousers,0,-.17,0,.082,.34,.09);box(knee,'#3c4f50',0,-.12,.08,.13,.16,.03);mesh(knee,'sphere','#2b3632',0,-.36,.065,.11,.09,.19);box(knee,'#202c29',0,-.415,.05,.22,.055,.33);knees.push(knee);});
    shadow(g,0,0,1.1,.8);
    function pose(t,{walk=false,wave=false,angry=false,tablet=false,stomp=false}={}){
      const swing=walk?Math.sin(t*5.1)*.36:0;legs[0].rotation.x=swing;legs[1].rotation.x=-swing;
      knees[0].rotation.x=walk?Math.max(0,-Math.sin(t*5.1))*.45:0;knees[1].rotation.x=walk?Math.max(0,Math.sin(t*5.1))*.45:0;
      arms[0].rotation.set(-swing*.65,0,.05);arms[1].rotation.set(swing*.65,0,-.05);elbows.forEach(e=>e.rotation.x=-.14);
      if(wave){arms[1].rotation.x=-.35;arms[1].rotation.z=2.2+Math.sin(t*6)*.18;elbows[1].rotation.x=-.6;}
      if(tablet){arms[0].rotation.x=-.65;arms[1].rotation.x=-.65;elbows[0].rotation.x=-.65;elbows[1].rotation.x=-.65;}
      if(angry){arms[0].rotation.z=-.4;arms[1].rotation.z=.4;elbows.forEach(e=>e.rotation.x=-.5);head.rotation.y=Math.sin(t*8)*.1;}
      else head.rotation.y=Math.sin(t*.55)*.07;
      brows[0].rotation.z=angry?-.25:0;brows[1].rotation.z=angry?.25:0;
      body.position.y=walk?Math.abs(Math.sin(t*5.1))*.018:Math.sin(t*1.4)*.005;
      body.rotation.z=stomp?Math.sin(t*10)*.025:0;
      if(stomp)legs[0].rotation.x=Math.max(0,Math.sin(t*8))*.18;
    }
    return {g,body,head,arms,legs,elbows,knees,pose};
  }
  function worker(name,x,d,mode,phrases,greeting){
    const h=human(scene,x,-d,mode==='supervisor'||actors.length%3===1?'#c9ce58':'#df8b3e');
    const a=register(name,h.g,d,phrases,greeting);a.human=h;
    if(mode==='tablet'||mode==='supervisor')box(h.body,'#344f56',0,1.10,.4,.32,.24,.045);
    if(mode==='clean'){box(h.arms[1],'#93a19a',0,-.75,0,.035,1.1,.035);box(h.arms[1],'#c3d8d3',0,-1.3,0,.38,.07,.18);}
    if(mode==='welcome'){
      const tools=group(h.arms[0],0,-.59,0);box(tools,'#42665d',0,0,0,.40,.25,.23);box(tools,'#263e37',0,.16,0,.17,.07,.045);
      box(h.arms[1],'#385363',0,-.38,.13,.19,.28,.035);
    }
    if(mode==='inspect'||mode==='cable'){mesh(h.arms[1],'cylinder','#89979a',0,-.50,.08,.025,.3,.025);box(h.arms[0],'#405854',0,-.62,0,.28,.23,.18);}
    if(mode==='survey'){const tripod=group(h.g,.65,0,.1);for(let i=0;i<3;i++){const leg=group(tripod,0,.72,0);leg.rotation.y=i*Math.PI*2/3;const shaft=mesh(leg,'cylinder','#b8a35e',0,-.36,.15,.025,.83,.025);shaft.rotation.x=.4;}box(tripod,'#c2cfc0',0,1.18,0,.26,.22,.26);mesh(tripod,'cylinder','#3f6067',0,1.19,.16,.075,.16,.075).rotation.x=Math.PI/2;}
    const baseX=x;
    a.update=(t,reacting)=>{
      const angry=reacting&&a.reaction.level>=2,waving=!reacting&&a.waveUntil>time;
      h.pose(reacting||waving?time:t,{walk:mode==='walk'&&!reacting&&!waving,wave:(reacting&&!angry)||waving,angry,stomp:reacting&&a.reaction.level===3,tablet:!reacting&&(mode==='tablet'||mode==='supervisor')});
      if(waving)h.g.rotation.y=Math.atan2(camera.position.x-h.g.position.x,camera.position.z-h.g.position.z);
      if(!reacting&&!waving){
        if(mode==='walk'){h.g.position.z=-d+Math.sin(t*.28)*2.8;h.g.rotation.y=Math.cos(t*.28)>0?0:Math.PI;}
        else h.g.rotation.y=x>0?Math.PI/2:-Math.PI/2;
        if(mode==='inspect'||mode==='cable'||mode==='survey'){h.arms[1].rotation.x=-.65+Math.sin(t*1.7)*.14;h.elbows[1].rotation.x=-.6;h.head.rotation.x=.12;}
        if(mode==='tablet'||mode==='supervisor'){h.arms[1].rotation.x=-.95+Math.sin(t*2.6)*.13;}
        if(mode==='welcome'){h.arms[1].rotation.x=-.72+Math.sin(t*1.7)*.12;h.body.rotation.x=Math.sin(t*.65)*.035;}
      }else h.body.rotation.x=0;
      if(mode==='clean'&&!reacting&&!waving)h.arms[1].rotation.x=-1.0+Math.sin(t*1.8)*.35;
      h.g.position.x=mode==='welcome'&&d===8&&width<760?3.05:baseX;
      if(mode==='welcome'&&d===8)h.g.position.z=width<760?-12:-8;
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
  const beacon=ball(fork,new T.MeshBasicMaterial({color:'#ffc86a'}),.4,2.52,-.2,.11);
  const forklift=register('Forklift crew',fork,29,["Precious cargo coming through!","You rang? Again?","Alright, you are on pallet duty now."],"Delivery time! Watch the side lane.");
  forklift.update=(t,r)=>{const s=B.shuttle(t,30),phase=(t%30)/30;fork.position.z=-B.lerp(24,41,s.value);fork.position.x=5.8;fork.rotation.y=B.heading(t,30);forks.position.y=.45+s.loading*.65;pallet.visible=phase<.425||phase>.925;forkWheels.forEach(w=>w.rotation.x=s.value*28);beacon.scale.setScalar(.09+Math.sin(t*4)*.015);driver.pose(r?time:t,{wave:r,tablet:!r,angry:r&&forklift.reaction.level>1});};
  const truck=group(scene,10,0,-35);box(truck,'#486a5c',0,.67,0,2,.45,5);box(truck,'#e4e7d6',0,1.4,1.65,2,1.4,1.6);box(truck,'#557c85',0,1.55,2.47,1.65,.65,.02);
  box(truck,'#ad986f',0,1.0,-.8,1.9,.2,3.2);for(let j=0;j<3;j++)box(truck,'#315268',0,1.18+j*.14,-.8,1.65,.11,2.7);
  for(const x of [-.7,.7])box(truck,'#ffedb6',x,1.0,2.49,.23,.14,.03);
  const truckWheels=vehicleWheels(truck,1.04,[-1.5,1.55],.4);shadow(truck,0,0,3.6,6.7);
  const trucker=human(truck,.48,1.7);trucker.g.scale.setScalar(.6);trucker.g.position.y=.72;
  const delivery=register('Delivery truck',truck,37,["Special delivery for a brighter future.","No, this is not a taxi!","You can explain the delay to my dispatcher."],"Panels, cables, possibilities.");
  delivery.update=(t,r)=>{const s=B.shuttle(t+8,48);truck.position.z=-B.lerp(32,46,s.value);truck.rotation.y=B.heading(t+8,48);truckWheels.forEach(w=>w.rotation.x=s.value*22);trucker.pose(r?time:t,{wave:r,angry:r&&delivery.reaction.level>1});};
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
  // More people doing distinct jobs, spread along the route rather than clustered at the entrance.
  worker('Elena · surveyor',-3.6,26,'survey',["Checking the next installation point.","Just lining up the measurements.","The tripod is doing its best."],"Hi! Just checking the next row.");
  worker('Jules · installation technician',3.65,70,'inspect',["A final check on the mounting hardware.","One moment, precision takes patience.","You can hold the spanner next time."],"Hi! Welcome to the installation crew.");
  worker('Priya · electrical technician',-3.5,116,'cable',["Keeping the cable routes tidy.","Just tracing this connection.","Your clicks need a cable label."],"Hi! Taking a look at the connections.");
  worker('Ben · site logistics',3.55,132,'walk',["Checking the next delivery point.","There is a plan for every pallet.","You are coming on the next site walk."],"Hi! Good to see you on site.");
  worker('Zoe · quality inspector',3.6,178,'tablet',["A few checks before handover.","Let me finish this inspection note.","Your enthusiasm is now documented."],"Hi! Just finishing a quality check.");
  worker('Amir · maintenance technician',-3.5,226,'clean',["Keeping the panels ready for work.","This row still needs attention.","I saved a cleaning brush for you."],"Hi! Enjoy the rest of the walk.");
  // Site details and destinations.
  function sign(x,d,title,subtitle){
    const g=group(scene,x,0,-d);box(g,'#718368',0,1.15,0,.09,2.3,.09);
    const tex=canvasTexture(512,224,c=>{c.fillStyle='#244d3c';c.fillRect(0,0,512,224);c.fillStyle='#f0cf83';c.fillRect(24,27,46,5);c.font='bold 32px sans-serif';c.fillStyle='#f8f6df';c.fillText(title,24,95);c.font='19px sans-serif';c.fillStyle='#c2d1b2';c.fillText(subtitle,24,151);});
    const panel=new T.Mesh(new T.PlaneGeometry(2.6,1.14),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));panel.position.y=2.15;g.add(panel);return g;
  }
  function cabin(x,d,name){const g=group(scene,x,0,-d);box(g,'#e2e2cc',0,1.6,0,5.5,3.2,4);box(g,'#567963',0,3.26,0,5.8,.2,4.3);box(g,'#65858a',-1,1.85,2.02,1.8,1.1,.04);box(g,'#789377',1.5,1.1,2.03,.9,2.2,.05);shadow(g,0,0,7,6);sign(x,d-3,name,'TECHNICAL SITE / AUTHORISED ACCESS');return g;}
  cabin(-10,150,'CONTROL CABIN');cabin(9,221,'SITE OFFICE');
  for(let d=111;d<131;d+=5){box(scene,'#c3cbbb',-5,1,-d,1.2,2,.7);box(scene,'#4d7574',-5,1.4,-d+.36,.8,.3,.02);}
  for(let i=0;i<8;i++){const g=group(scene,4.1+i*.9,0,-19);box(g,'#394e41',0,.05,0,.4,.1,.4);mesh(g,'cone','#e28c43',0,.35,0,.16,.6,.16);mesh(g,'cylinder','#f4e8b7',0,.38,0,.105,.1,.105);}
  for(let i=0;i<6;i++){const g=group(scene,8+(i%3)*1.7,0,-20-Math.floor(i/3)*3);box(g,'#a78b5e',0,.15,0,1.3,.2,1);for(let j=0;j<4;j++)box(g,'#315768',0,.3+j*.09,0,1.2,.07,.9);}
  const reel=group(scene,5.6,.65,-45);const drum=mesh(reel,'cylinder','#a68b5c',0,0,0,.6,.8,.6);drum.rotation.z=Math.PI/2;const cableDrum=mesh(reel,'cylinder','#425348',0,0,0,.43,.82,.43);cableDrum.rotation.z=Math.PI/2;
  for(const d of [57,141,214]){const g=group(scene,-3.4,0,-d);box(g,'#75866b',0,2,0,.065,4,.065);const sock=group(g,0,3.8,0);for(let j=0;j<5;j++)box(sock,j%2?'#f4e4ba':'#dd8a4c',.2+j*.27,0,0,.27,.25-j*.025,.25-j*.025);socks.push(sock);}
  for(let i=0;i<5;i++){const g=group(scene,0,8,-70);const wings=[box(g,'#738674',-.2,0,0,.5,.035,.16),box(g,'#738674',.2,0,0,.5,.035,.16)];birds.push({g,wings,phase:i*1.7});}
  // Exact hit testing respects occlusion by panels and equipment.
  const ray=new T.Raycaster(),point=new T.Vector2(),anchor=new T.Vector3(),headAnchor=new T.Vector3();
  let pointerStart=null,lastHover=0;
  function fromEvent(e){point.set(e.clientX/width*2-1,-e.clientY/height*2+1);ray.setFromCamera(point,camera);}
  const block='a,button,summary,details,.container,header,footer,.farm-speech,.tour-hud,.site-activity';
  function down(e){if(e.target.closest(block))return;pointerStart={x:e.clientX,y:e.clientY};}
  function actorAt(e){
    fromEvent(e);
    for(const hit of ray.intersectObjects(scene.children,true)){
      if(hit.object.material?.transparent)continue;
      let node=hit.object,actor=null,station=null,visible=true;
      while(node){if(!node.visible)visible=false;if(node.userData.actor)actor=node.userData.actor;if(node.userData.station)station=node.userData.station;node=node.parent;}
      if(visible)return actor||station;
    }
    return null;
  }
  function up(e){
    if(!pointerStart)return;const start=pointerStart;pointerStart=null;
    if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8||e.target.closest(block))return;
    let a=actorAt(e);
    // A small invisible touch tolerance makes tiny characters comfortable to tap.
    if(!a&&(e.pointerType==='touch'||width<760)){
      for(const [dx,dy] of [[-12,0],[12,0],[0,-12],[0,12]]){
        a=actorAt({clientX:e.clientX+dx,clientY:e.clientY+dy});if(a)break;
      }
    }
    if(a?.stationId)document.querySelector('a[href="#'+a.stationId+'"]').click();else if(a)interact(a);
  }
  function hover(e){if(e.pointerType==='touch'||performance.now()-lastHover<45)return;lastHover=performance.now();document.body.classList.toggle('over-crew',!e.target.closest(block)&&!!actorAt(e));}
  function cancel(){pointerStart=null;}
  document.addEventListener('pointerdown',down);document.addEventListener('pointerup',up);
  document.addEventListener('pointermove',hover,{passive:true});document.addEventListener('pointercancel',cancel);
  const contextLost=e=>{e.preventDefault();window.dispatchEvent(new Event('farm-renderer-lost'));};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  function resize(w,h,dpr){width=w;height=h;renderer.setPixelRatio(Math.min(dpr||1,quality,w<760?1.25:1.5));renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<760?74:56;camera.updateProjectionMatrix();}
  function draw(progress,elapsed,paused){
    time=elapsed;camDistance=progress*245;
    camera.position.set(Math.sin(progress*Math.PI*2)*.45,2.65,-camDistance);camera.lookAt(Math.sin(progress*Math.PI*2)*.18,1.1,-camDistance-42);camera.updateMatrixWorld();
    const warmActors=[];
    for(const a of actors){
      const ahead=-a.g.position.z-camDistance,near=ahead>-12&&ahead<100;
      a.g.visible=near;if(!near){a.button.hidden=true;a.lastTime=time;continue;}
      const delta=Math.min(.1,Math.max(0,time-a.lastTime));a.lastTime=time;
      const reacting=B.active(a.reaction,time);if(!reacting&&!(a.waveUntil>time))a.clock+=delta;
      a.update(a.clock,reacting);
      warmActors.push(a);
    }
    socks.forEach((s,i)=>{s.rotation.y=Math.sin(time*.7+i)*.16;s.rotation.z=Math.sin(time*1.2+i)*.07;});
    birds.forEach(({g,wings,phase})=>{g.position.set(Math.sin(time*.06+phase)*25,8+Math.sin(time*.15+phase),-camDistance-85);wings[0].rotation.z=Math.sin(time*3+phase)*.35;wings[1].rotation.z=-Math.sin(time*3+phase)*.35;});
    scene.updateMatrixWorld();
    // Focus-only HTML buttons provide keyboard access, with no visible scene markers.
    const blockers=[...document.querySelectorAll('main .container:not(.hero-copy),.hero-copy a,.hero-copy h1,.hero-copy .lead,.hero-copy .tag,header,footer,.site-activity,.tour-hud')].filter(el=>getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect());
    warmActors.sort((a,b)=>Math.abs(a.g.position.z+camDistance)-Math.abs(b.g.position.z+camDistance));
    const greetingCandidates=[];
    for(const a of warmActors){
      headAnchor.set(0,a.human?2.05:3.1,0);a.g.localToWorld(headAnchor);anchor.copy(headAnchor).project(camera);
      const x=(anchor.x*.5+.5)*width;let y=(-anchor.y*.5+.5)*height;
      let visible=anchor.z>-1&&anchor.z<1&&x>30&&x<width-30&&y>90&&y<height-100&&-a.g.position.z-camDistance>1;
      if(visible){point.set(anchor.x,anchor.y);ray.setFromCamera(point,camera);const hit=ray.intersectObjects([panelBatch],false)[0];if(hit&&hit.distance<camera.position.distanceTo(headAnchor)-.4)visible=false;}
      if(visible&&(y<90||blockers.some(r=>x>r.left-16&&x<r.right+16&&y>r.top-16&&y<r.bottom+16)))visible=false;
      a.button.hidden=!visible;
      if(visible){a.button.style.transform=`translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;a.screen={x,y};}
      if(a.human&&visible){const place=window.CrewStory.place(x,y,188,76,width,height,blockers);greetingCandidates.push({id:a.id,human:true,visible:place.score<180,ahead:-a.g.position.z-camDistance});}
    }
    const occupied=!!(lastSpeech&&lastSpeech.until>=time&&!dialogue?.dismissed());
    const chosen=presence.choose(greetingCandidates,time,{paused,occupied});
    if(chosen){const actor=actors.find(a=>a.id===chosen);hello={actor,until:time+4};actor.waveUntil=time+2.7;const profile=window.CrewStory.get(actor.id);greetingEl.querySelector('strong').textContent=profile.name;greetingEl.querySelector('span').textContent=actor.greeting.startsWith('Hi')?actor.greeting:'Hi! Good to see you on site.';}
    if(hello){const a=hello.actor,ahead=-a.g.position.z-camDistance,show=!paused&&!occupied&&time<hello.until&&!a.button.hidden&&ahead>1&&ahead<24;if(show){const rect=greetingEl.getBoundingClientRect();const p=window.CrewStory.place(a.screen.x,a.screen.y,rect.width||188,rect.height||76,width,height,blockers);greetingEl.hidden=p.score>180;greetingEl.style.left=p.left+'px';greetingEl.style.top=p.top+'px';greetingEl.style.setProperty('--hello-tail',p.tail+'px');}else greetingEl.hidden=true;}else greetingEl.hidden=true;
    if(lastSpeech){
      if(dialogue?.holding())lastSpeech.until=time+2;
      const a=lastSpeech.actor,ahead=-a.g.position.z-camDistance;
      const show=lastSpeech.until>=time&&a.g.visible&&ahead>0&&ahead<45;
      headAnchor.set(0,a.human?2.05:3.1,0);a.g.localToWorld(headAnchor);anchor.copy(headAnchor).project(camera);
      const sx=(anchor.x*.5+.5)*width,sy=(-anchor.y*.5+.5)*height;
      if(dialogue)dialogue.render(a,sx,sy,width,height,show&&anchor.z>-1&&anchor.z<1);
      else speech.hidden=!show;
    }
    renderer.render(scene,camera);
  }
  document.body.prepend(renderer.domElement);
  return {resize,draw,actors,setQuality(r){quality=r;resize(width,height,devicePixelRatio);},dispose(){document.removeEventListener('pointerdown',down);document.removeEventListener('pointerup',up);document.removeEventListener('pointermove',hover);document.removeEventListener('pointercancel',cancel);document.body.classList.remove('over-crew');actors.forEach(a=>a.button.remove());renderer.dispose();renderer.domElement.remove();speech.hidden=true;greetingEl.hidden=true;}};
};
