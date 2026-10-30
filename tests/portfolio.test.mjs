import test from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{validateContent}from'../src/validate.mjs';
import{renderPortfolio}from'../scripts/build.mjs';
import{progressAt,smoothStep,mediaTime}from'../assets/tour-math.js';
import{SeekController}from'../assets/seek-controller.js';

const data=JSON.parse(await readFile(new URL('../content/portfolio.json',import.meta.url),'utf8'));
const template=await readFile(new URL('../src/template.html',import.meta.url),'utf8');
test('all content is readable without JavaScript and anchor destinations exist',()=>{
  const html=renderPortfolio(data,template);
  for(const c of data.tour.chapters)assert.ok(html.includes(`id="${c.id}"`));
  for(const p of data.projects)assert.ok(html.includes(p.title.replaceAll('&','&amp;')));
  for(const e of data.experience)assert.ok(html.includes(e.company));
  assert.ok(html.includes('Resume.pdf'));assert.ok(!html.includes('{{'));
});
test('content edits cannot inject HTML or terminate the embedded JSON block',()=>{
  const copy=structuredClone(data);copy.profile.name='<img src=x onerror=alert(1)>';
  copy.projects[0].title='</script><script>alert(1)</script>';
  const html=renderPortfolio(copy,template);
  assert.ok(!html.includes('<img src=x onerror'));assert.ok(!html.includes('</script><script>alert(1)'));
  const json=html.match(/id="portfolio-data">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json).projects[0].title,copy.projects[0].title);
});
test('adding a project works, duplicate IDs and unsafe URLs fail before publishing',()=>{
  const copy=structuredClone(data);copy.projects.push({...copy.projects[0],id:'new-project'});assert.doesNotThrow(()=>validateContent(copy));
  copy.projects.at(-1).id=copy.projects[0].id;assert.throws(()=>validateContent(copy),/unique/);
  copy.projects.pop();copy.projects[0].source={label:'unsafe',url:'javascript:alert(1)'};assert.throws(()=>validateContent(copy),/HTTPS/);
  copy.projects[0].source=undefined;copy.tour.end=Infinity;assert.throws(()=>validateContent(copy),/finite/);
});
test('camera timing follows section geometry, in both directions, with overscroll clamped',()=>{
  const p=[{top:0,progress:0},{top:1000,progress:.2},{top:5000,progress:.8},{top:6000,progress:1}];
  assert.equal(progressAt(-500,p),0);assert.equal(progressAt(8000,p),1);
  assert.ok(Math.abs(progressAt(3000,p)-.5)<1e-9);
  assert.equal(progressAt(500,p),.1);
  assert.equal(progressAt(1000,p),.2);
  assert.ok(progressAt(2500,p)<progressAt(3000,p));
});
test('smoothing converges without overshoot and is time based across refresh rates',()=>{
  let at60=0,at120=0;for(let i=0;i<60;i++)at60=smoothStep(at60,1,16.67);for(let i=0;i<120;i++)at120=smoothStep(at120,1,8.335);
  assert.ok(Math.abs(at60-at120)<.001);assert.ok(at60<=1&&at60>.999);
  assert.ok(smoothStep(.8,.2,16.67)<.8);assert.ok(smoothStep(.8,.2,16.67)>.2);
});
test('end frame is kept inside the duration, even for a shorter replacement clip',()=>{
  assert.equal(mediaTime(1,0,4,3),2.96);assert.equal(mediaTime(-2,0,4,4),0);assert.equal(mediaTime(2,0,4,4),3.96);
});
class FakeVideo extends EventTarget{
  readyState=1;duration=4;seeking=false;time=0;requests=[];
  get currentTime(){return this.time}set currentTime(time){this.time=time;this.requests.push(time);this.seeking=true}
  complete(){this.seeking=false;this.dispatchEvent(new Event('seeked'))}
}
test('slow seeking coalesces requests to the newest scroll position',()=>{
  const v=new FakeVideo(),c=new SeekController(v);
  c.request(1);c.request(2);c.request(3);assert.deepEqual(v.requests,[1]);
  v.complete();assert.deepEqual(v.requests,[1,3]);
  v.complete();assert.equal(v.requests.length,2);c.dispose();
});
test('media errors stop seeking; missing media cannot trap the scroll controller',()=>{
  const v=new FakeVideo(),c=new SeekController(v);c.request(2);v.dispatchEvent(new Event('error'));c.request(3);assert.deepEqual(v.requests,[2]);c.dispose();
});
