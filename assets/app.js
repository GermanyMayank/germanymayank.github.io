import{initTour}from'./tour.js';

const data=JSON.parse(document.getElementById('portfolio-data').textContent);
const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden))});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus()}});
document.addEventListener('click',event=>{if(!menu.hidden&&!event.target.closest('.site-header'))closeMenu()});
matchMedia('(min-width: 721px)').addEventListener('change',event=>{if(event.matches)closeMenu()});

const dialog=document.querySelector('#project-dialog');
let returnFocus=null;
if(typeof dialog.showModal==='function'){
  document.querySelectorAll('.project-open').forEach(button=>{
    button.hidden=false;
    button.addEventListener('click',()=>{
      const project=data.projects.find(p=>p.id===button.dataset.project);if(!project)return;
      returnFocus=button;
      document.querySelector('#dialog-title').textContent=project.title;
      document.querySelector('#dialog-description').textContent=project.description;
      document.querySelector('#dialog-number').textContent=`${String(data.projects.indexOf(project)+1).padStart(2,'0')} / SELECTED WORK`;
      const img=document.querySelector('#dialog-image');img.src=project.image;img.alt=project.alt;
      const tags=document.querySelector('#dialog-tags');tags.replaceChildren(...project.tags.map(tag=>{const li=document.createElement('li');li.textContent=tag;return li}));
      const source=document.querySelector('#dialog-source');source.replaceChildren();
      for(const[key,label]of[['source','Source'],['credit','Photo']]){
        if(project[key]){const a=document.createElement('a');a.href=project[key].url;a.textContent=project[key].label;a.target='_blank';a.rel='noopener';source.append(`${source.childNodes.length?' · ':''}${label}: `,a)}
      }
      dialog.showModal();dialog.scrollTop=0;document.body.classList.add('dialog-open');
      dialog.querySelector('.dialog-close').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');returnFocus?.focus({preventScroll:true})});
}

// Content and project interactions work independently of media availability.
try{initTour(data.tour)}catch(error){console.warn('Tour enhancement unavailable; portfolio content remains accessible.',error)}
