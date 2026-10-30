import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateContent } from '../src/validate.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e=escapeHtml;
export function renderPortfolio(data, template) {
  validateContent(data);
  const tags = items => items.map(tag=>`<li>${e(tag)}</li>`).join('');
  const source = p => p.source ? `<p class="source-note">Source: <a href="${e(p.source.url)}" target="_blank" rel="noopener">${e(p.source.label)}</a>${p.credit ? ` · Photo: <a href="${e(p.credit.url)}" target="_blank" rel="noopener">${e(p.credit.label)}</a>` : ''}</p>` : '';
  const values={...data.profile,
    description:'Mayank Vekariya — electrical engineering, renewable energy project execution, selected projects, experience and skills.',
    poster:data.tour.poster, year:new Date().getFullYear(),credit:data.tour.credit,creditUrl:data.tour.creditUrl,
    navigation:data.tour.chapters.filter(c=>c.id!=='profile'&&c.id!=='achievements').map(c=>`<a href="#${e(c.id)}">${e(c.label)}</a>`).join(''),
    experience:data.experience.map((job,i)=>`<article class="experience-item"><div class="experience-date"><span class="index">${String(i+1).padStart(2,'0')}</span><span>${e(job.date)}</span></div><div class="experience-copy"><p class="company">${e(job.company)}</p><h3>${e(job.role)}</h3><p>${e(job.description)}</p></div></article>`).join(''),
    projects:data.projects.map((p,i)=>`<article class="project-card"><div class="project-image"><img src="${e(p.image)}" alt="${e(p.alt)}" loading="lazy" decoding="async" width="800" height="500"><span class="project-index">${String(i+1).padStart(2,'0')} / PROJECT</span></div><div class="project-copy"><ul class="tags">${tags(p.tags.slice(0,3))}</ul><h3>${e(p.title)}</h3><p>${e(p.description)}</p>${source(p)}<button class="project-open" type="button" data-project="${e(p.id)}" hidden>Explore project <span aria-hidden="true">↗</span></button></div></article>`).join(''),
    skills:data.skills.map((s,i)=>`<article class="skill-card"><span class="index">0${i+1}</span><h3>${e(s.title)}</h3><p>${e(s.description)}</p><ul>${s.items.map(x=>`<li>${e(x)}</li>`).join('')}</ul></article>`).join(''),
    tools:data.tools.map(t=>`<li><span>${e(t.name)}</span><small>${e(t.use)}</small></li>`).join(''),
    achievements:data.achievements.map(a=>`<article class="achievement"><p class="achievement-value">${e(a.value)}</p><h3>${e(a.label)}</h3><p>${e(a.detail)}</p></article>`).join(''),
    clientData:JSON.stringify({tour:data.tour,projects:data.projects}).replace(/</g,'\\u003c')
  };
  const raw=new Set(['navigation','experience','projects','skills','tools','achievements','clientData']);
  return template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in values)) throw Error(`Missing template value: ${key}`);return raw.has(key)?values[key]:e(values[key]);});
}
export async function build(root=resolve(fileURLToPath(new URL('..',import.meta.url)))) {
  const data=JSON.parse(await readFile(resolve(root,'content/portfolio.json'),'utf8'));
  const template=await readFile(resolve(root,'src/template.html'),'utf8');
  await mkdir(resolve(root,'assets'),{recursive:true});
  await writeFile(resolve(root,'index.html'),renderPortfolio(data,template));
  console.log(`Built index.html: ${data.experience.length} roles, ${data.projects.length} projects, ${data.tour.chapters.length} chapters.`);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) await build();
