const $=s=>document.querySelector(s);
const scrollMode=matchMedia('(min-width: 701px) and (min-height: 460px)');
const sceneState={index:0,position:0,paused:false};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
const products=[
{name:'PrismSuite',asset:'prism',category:'ASSESS',title:'Clarity before<br>complexity.',description:'Know the health, performance and security of your IT. PrismSuite turns infrastructure data into priorities your business can act on.',features:['Infrastructure health & performance','Security posture & gap analysis','Prioritised recommendations']},
{name:'ProjectOne',asset:'project',category:'BUILD',title:'Built right.<br>Built to grow.',description:'Turn recommendations into a stronger foundation. ProjectOne helps redesign and implement infrastructure around the way your business works.',features:['Infrastructure planning & redevelopment','Network and system improvements','Implementation aligned to your priorities']},
{name:'AegisOne',asset:'aegis',category:'PROTECT',title:'Stay aware.<br>Stay ahead.',description:'Bring monitoring, security and management into one connected approach. AegisOne helps keep your IT environment visible and under control.',features:['SOC & NOC monitoring','Endpoint, patch & asset management','Privileged access & credential security']},
{name:'PhoenixODR',asset:'phoenix',category:'RECOVER',title:'Disruption happens.<br>Be ready.',description:'Make recovery part of your strategy. PhoenixODR helps protect business continuity with disaster recovery and a path back to operations.',features:['Disaster recovery planning','Business continuity preparedness','Recovery designed around business needs']},
{name:'Sovereign Cloud',asset:'cloud',category:'SCALE',title:'Your ambition.<br>A stronger cloud.',description:'Build your next stage of growth on a cloud strategy shaped around control, resilience and the needs of your organisation.',features:['Cloud infrastructure strategy','Data control & governance','Scalable foundations for growth']}
];
let active=-1,manualTarget=null;const tabs=$('.product-tabs'),scrollSection=$('.product-scroll'),card=$('.logo-card');
products.forEach((p,i)=>{const b=document.createElement('button');b.role='tab';b.textContent=p.name;b.id='tab-'+i;b.setAttribute('aria-controls','product-panel');b.addEventListener('click',()=>{sceneState.position=i;showProduct(i);if(!reduced.matches&&scrollMode.matches){const top=scrollSection.getBoundingClientRect().top+scrollY;manualTarget=top+(scrollSection.offsetHeight-innerHeight)*i/4;window.scrollTo({top:manualTarget,behavior:'smooth'});}});b.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:4))%5;tabs.children[n].focus();tabs.children[n].click();}});tabs.appendChild(b);});
$('.product-copy').id='product-panel';$('.product-copy').setAttribute('role','tabpanel');
function showProduct(i){if(i===active)return;active=i;sceneState.index=i;document.dispatchEvent(new Event('itcraft:product'));const p=products[i];$('.product-stage').dataset.solution=i;const word=$('.solution-word');if(word)word.textContent=p.category;$('#product-logo').src='assets/'+p.asset+'.webp';$('#product-logo').alt=p.name;$('#product-category').textContent=String(i+1).padStart(2,'0')+' / '+p.category;$('#product-title').innerHTML=p.title;$('#product-description').textContent=p.description;$('#product-features').replaceChildren(...p.features.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));$('#product-link').textContent='Discover '+p.name;$('#product-link').href=['prismsuite','projectone','aegisone','phoenixodr','sovereign-cloud'][i]+'.html';$('#product-link').removeAttribute('target');if(!reduced.matches){$('.product-copy').getAnimations().forEach(a=>a.cancel());$('.product-copy').animate([{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});}$('.chapter-number').textContent=String(i+1).padStart(2,'0')+' — 05';$('.product-copy').setAttribute('aria-labelledby','tab-'+i);[...tabs.children].forEach((b,n)=>{b.setAttribute('aria-selected',n===i);b.tabIndex=n===i?0:-1;});}
const word=document.createElement('div');word.className='solution-word';word.setAttribute('aria-hidden','true');word.textContent='ASSESS';$('.product-art').prepend(word);
document.addEventListener('itcraft:chapter',e=>showProduct(e.detail.index));
const chapters=document.createElement('div');chapters.className='mobile-chapters';
const routes=['prismsuite','projectone','aegisone','phoenixodr','sovereign-cloud'];
products.forEach((p,i)=>{const article=document.createElement('article');article.className='mobile-chapter';article.dataset.product=i;article.innerHTML=`<div class="eyebrow">0${i+1} / ${p.category}</div><h3>${p.title}</h3><p>${p.description}</p><ul>${p.features.map(t=>`<li>${t}</li>`).join('')}</ul><a class="product-discover" href="${routes[i]}.html">Discover ${p.name}</a>`;chapters.appendChild(article);});
$('.product-stage').appendChild(chapters);
function mobileMode(){document.body.classList.toggle('scroll-products',!reduced.matches);}
mobileMode();reduced.addEventListener('change',mobileMode);
showProduct(0);
$('.menu').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',open);$('.menu').setAttribute('aria-label',open?'Close navigation':'Open navigation');});$('nav').addEventListener('click',()=>{$('nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');});
function motionLabel(){document.querySelector('.hero-artwork')?.classList.toggle('art-paused',paused);sceneState.paused=paused;document.dispatchEvent(new CustomEvent('itcraft:motion',{detail:{paused}}));$('#motion').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';$('#motion').setAttribute('aria-pressed',paused);}motionLabel();$('#motion').addEventListener('click',()=>{paused=!paused;motionLabel();});reduced.addEventListener('change',()=>{paused=reduced.matches;motionLabel();});
$('#year').textContent=new Date().getFullYear();
let sectionTop=0,sectionHeight=1,layoutDirty=true,heroVisible=true;
addEventListener('resize',()=>{layoutDirty=true;});
addEventListener('wheel',()=>{manualTarget=null;},{passive:true});
addEventListener('touchstart',()=>{manualTarget=null;},{passive:true});

let ticking=false;
function updateShowcase(){
 ticking=false;
 if(layoutDirty){sectionTop=scrollSection.getBoundingClientRect().top+scrollY;sectionHeight=scrollSection.offsetHeight;layoutDirty=false;}
 const offset=scrollY-sectionTop,progress=Math.max(0,Math.min(1,offset/Math.max(1,sectionHeight-innerHeight)));
 if(manualTarget!==null&&Math.abs(scrollY-manualTarget)<3)manualTarget=null;
 if(manualTarget===null&&!reduced.matches&&scrollMode.matches&&offset>=-1&&offset<=sectionHeight-innerHeight+1){sceneState.position=progress*4;if(!$('.product-art').classList.contains('webgl-ready'))showProduct(Math.round(sceneState.position));}
 sceneState.phase=progress*5%1-.5;
 if(matchMedia('(max-width:700px)').matches&&!reduced.matches){const items=[...chapters.children],line=innerHeight*.64;let position=0;items.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.top<=line)position=i+Math.max(0,Math.min(1,(line-r.top)/r.height-.25));});sceneState.position=Math.min(4,position);if(!$('.product-art').classList.contains('webgl-ready'))showProduct(Math.round(sceneState.position));}
 document.dispatchEvent(new Event('itcraft:scroll'));
 if(!$('.product-art').classList.contains('webgl-ready'))card.style.transform=paused?'none':`rotateY(${-12+(progress*5%1)*20}deg) rotateX(4deg)`;
}
function schedule(){if(!ticking){ticking=true;requestAnimationFrame(updateShowcase);}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);new ResizeObserver(()=>{layoutDirty=true;schedule();}).observe(document.body);schedule();


import('./progressive3d.js').then(({prepare3D})=>prepare3D($('.product-art'),async()=>{const {initProductScene}=await import('./scene3d.js');const scene=await initProductScene($('.product-art'),sceneState);$('#reset-view').addEventListener('click',()=>scene.reset());}));

const heroArtwork=document.querySelector('.hero-artwork');
if(heroArtwork){new IntersectionObserver(entries=>heroArtwork.classList.toggle('art-offscreen',!entries[0].isIntersecting)).observe(heroArtwork);document.addEventListener('visibilitychange',()=>heroArtwork.classList.toggle('art-hidden',document.hidden));}
