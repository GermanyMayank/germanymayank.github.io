export function validateContent(data) {
  const fail=message=>{throw new Error(`Invalid portfolio: ${message}`)};
  const text=(v,name)=>{if(typeof v!=='string'||!v.trim())fail(`${name} must be nonempty text`)};
  const array=(v,name)=>{if(!Array.isArray(v)||!v.length)fail(`${name} must be a nonempty array`)};
  const url=(v,name)=>{text(v,name);if(!/^https:\/\//.test(v))fail(`${name} must use HTTPS`);try{new URL(v)}catch{fail(`${name} must be a valid URL`)}};
  const path=(v,name)=>{text(v,name);if(!/^[\w./-]+$/.test(v)||v.startsWith('/')||v.split('/').includes('..'))fail(`${name} must be a relative asset path`)};
  if(!data||!data.profile||!data.tour)fail('profile and tour are required');
  for(const k of ['name','role','location','email','summary','availability'])text(data.profile[k],`profile.${k}`);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.profile.email))fail('profile.email is invalid');
  for(const k of ['linkedin','github'])url(data.profile[k],`profile.${k}`);
  path(data.profile.resume,'profile.resume');
  for(const k of ['experience','projects','skills','tools','achievements'])array(data[k],k);
  data.experience.forEach((x,i)=>['role','company','date','description'].forEach(k=>text(x[k],`experience[${i}].${k}`)));
  const ids=new Set();
  data.projects.forEach((x,i)=>{
    for(const k of ['id','title','description','alt'])text(x[k],`projects[${i}].${k}`);
    if(!/^[a-z][a-z0-9-]*$/.test(x.id)||ids.has(x.id))fail('project IDs must be unique lowercase slugs');
    ids.add(x.id);path(x.image,`projects[${i}].image`);array(x.tags,`projects[${i}].tags`);x.tags.forEach(t=>text(t,'project tag'));
    for(const k of ['source','credit'])if(x[k]){text(x[k].label,`${k} label`);url(x[k].url,`${k} URL`)}
  });
  data.skills.forEach(x=>{text(x.title,'skill title');text(x.description,'skill description');array(x.items,'skill items');x.items.forEach(i=>text(i,'skill item'))});
  data.tools.forEach(x=>{text(x.name,'tool name');text(x.use,'tool use')});
  data.achievements.forEach(x=>['value','label','detail'].forEach(k=>text(x[k],`achievement.${k}`)));
  const t=data.tour;path(t.source,'tour.source');path(t.poster,'tour.poster');text(t.credit,'tour.credit');url(t.creditUrl,'tour.creditUrl');
  if(!Number.isFinite(t.start)||t.start<0||!Number.isFinite(t.end)||t.end<=t.start)fail('tour time range must be finite and increasing');
  if(!Number.isFinite(t.smoothing)||t.smoothing<=0||t.smoothing>1)fail('tour.smoothing must be in (0,1]');
  array(t.chapters,'tour.chapters');
  const allowed=['profile','experience','projects','skills','achievements','contact'];
  if(t.chapters.length!==allowed.length||t.chapters.some((c,i)=>c.id!==allowed[i]))fail('chapters must follow the page section order');
  t.chapters.forEach((c,i)=>{text(c.label,'chapter label');if(!Number.isFinite(c.progress)||c.progress<0||c.progress>1||(i>0&&c.progress<=t.chapters[i-1].progress))fail('chapter progress must increase between 0 and 1')});
  if(t.chapters[0].progress!==0||t.chapters.at(-1).progress!==1)fail('tour must start at 0 and end at 1');
  return data;
}
