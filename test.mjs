import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const html=fs.readFileSync(new URL('index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);

test('Depth passages stay still and fully readable through the reading interval',()=>{
  const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('depth-journey.js',import.meta.url),'utf8'),scope);
  const J=scope.window.DepthJourney;
  for(let phase=.2;phase<=.75;phase+=.01){const p=J.pose(phase);assert.equal(p.scale,1);assert.equal(p.opacity,1);assert.equal(p.x,0);}
  assert(J.pose(0).scale<1);assert(J.pose(.95).scale>1);assert(J.pose(.95).opacity<.3);
  for(let phase=-2;phase<3;phase+=.01){const p=J.pose(phase);assert(p.opacity>=0&&p.opacity<=1);assert(Number.isFinite(p.scale));}
});

test('Depth navigation handles boundaries, long documents and the final passage',()=>{
  const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('depth-journey.js',import.meta.url),'utf8'),scope);
  const locate=scope.window.DepthJourney.locate,stops=[0,1000,2000];
  assert.equal(locate(-100,stops,1000).index,0);assert.equal(locate(-100,stops,1000).phase,0);
  assert.equal(locate(1000,stops,1000).index,1);assert.equal(locate(1000,stops,1000).phase,0);
  assert.equal(locate(2500,stops,1000).index,2);assert.equal(locate(2500,stops,1000).phase,.5);
  assert.equal(locate(9000,stops,1000).phase,1);
});

test('Portfolio HTML is balanced and all internal chapter links resolve',()=>{
  const stack=[],voids=new Set(['meta','link','img','br','hr','input','source','area','base','embed','wbr']);
  for(const [,closing,raw] of html.matchAll(/<(\/?)([a-z][\w-]*)\b[^>]*>/gi)){
    const tag=raw.toLowerCase();if(voids.has(tag))continue;
    if(closing)assert.equal(stack.pop(),tag);else stack.push(tag);
  }
  assert.equal(stack.length,0);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),'Missing #'+id);
  assert(html.includes('href="resume.html"'));
  assert(html.includes('mailto:mayankvekariya100@gmail.com'));
});

test('Every local script exists and parses',()=>{
  assert(scripts.length>=4);
  for(const script of scripts){const file=new URL(script,import.meta.url);assert(fs.existsSync(file));execFileSync(process.execPath,['--check',fileURLToPath(file)]);}
});

test('Clicks escalate, cool down and reset; work routes stay within bounds',()=>{
  const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('farm-behaviour.js',import.meta.url),'utf8'),scope);
  const B=scope.window.FarmBehaviour,s=B.createReaction();
  assert.equal(B.react(s,1),1);assert.equal(B.react(s,2),2);assert.equal(B.react(s,3),3);assert.equal(B.react(s,4),3);
  assert(B.active(s,5));assert(!B.active(s,8));assert.equal(B.react(s,15),1);
  for(let t=-10;t<100;t+=.13){const r=B.shuttle(t);assert(r.value>=0&&r.value<=1);assert(r.loading>=0&&r.loading<=1);assert(Number.isFinite(B.heading(t)));}
  assert.equal(B.shuttle(0).moving,true);assert.equal(B.shuttle(13).moving,false);
});

test('Fallback camera projects finite coordinates across desktop and phone paths',()=>{
  let points=0;const gradient={addColorStop(){}};
  const ctx=new Proxy({createLinearGradient(){return gradient},createRadialGradient(){return gradient},moveTo(...v){assert(v.every(Number.isFinite));points++;},lineTo(...v){assert(v.every(Number.isFinite));points++;}}, {get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
  const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('solar-scene.js',import.meta.url),'utf8'),scope);
  const scene=scope.window.createSolarWalk({getContext:()=>ctx});
  for(const [w,h] of [[1440,900],[390,844]]){scene.resize(w,h,2);for(let p=0;p<=20;p++)scene.draw(p/20);}
  assert(points>1000);assert.equal(scope.window.createSolarWalk({getContext:()=>null}),null);
});

test('Crew stories link to real portfolio destinations and speech fits the viewport',()=>{
  const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(new URL('crew-story.js',import.meta.url),'utf8'),scope);
  const C=scope.window.CrewStory;assert.equal(C.profiles.length,9);
  for(const p of C.profiles){assert(p.line.length<160);if(p.href.startsWith('#'))assert(html.includes('id="'+p.href.slice(1)+'"'));else assert.equal(p.href,'resume.html');}
  for(const [w,h] of [[390,844],[1440,900]])for(const x of [-100,20,w/2,w+90])for(const y of [120,400,h-20]){
    const p=C.place(x,y,304,210,w,h);assert(p.left-152>=15);assert(p.left+152<=w-15);assert(p.top>=90);assert(p.top+210<=h-85);assert(p.tail>=22&&p.tail<=282);
  }
  const p=C.place(700,420,304,210,1440,900,[{left:500,right:900,top:140,bottom:410}]);assert(p.top>=420,'Speech should avoid a heading above its speaker');
});
