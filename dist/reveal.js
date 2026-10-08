// Calm, scroll-driven motion for the sections after the story: spotlight lists and gentle reveals.
(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// 1) spotlight lists: one item in focus at a time, with a progress line and counter
document.querySelectorAll('[data-spot]').forEach(sec=>{
 const items=[...sec.querySelectorAll('.spot-item')],list=sec.querySelector('.spot-list'),count=sec.querySelector('.spot-count b');
 if(!items.length)return;
 sec.classList.add('js-spot');
 const line=document.createElement('i');line.className='spot-line';list.prepend(line);
 const set=i=>{items.forEach((it,k)=>it.classList.toggle('active',k===i));if(count)count.textContent=String(i+1).padStart(2,'0');};
 let cur=-1;
 const update=()=>{
  const mid=innerHeight*.5;let best=0,bd=1e9;
  items.forEach((it,k)=>{const r=it.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=k;}});
  if(best!==cur){cur=best;set(best);}
  const lr=list.getBoundingClientRect(),p=Math.max(0,Math.min(1,(mid-lr.top-40)/Math.max(1,lr.height-80)));
  sec.style.setProperty('--sp',p.toFixed(3));
 };
 let tick=false;const kick=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;update();});}};
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);update();
});
// 1b) card deck (Why ITCraft): each card slides up over the previous one
document.querySelectorAll('[data-deck]').forEach(sec=>{
 const cards=[...sec.querySelectorAll('.deck-card')],dots=[...sec.querySelectorAll('.deck-dots i')],count=sec.querySelector('.spot-count b'),N=cards.length;
 if(!N)return;sec.classList.add('js-deck');
 let last=-1;
 const update=()=>{
  const r=sec.getBoundingClientRect(),span=Math.max(1,r.height-innerHeight),p=Math.max(0,Math.min(1,-r.top/span)),s=p*(N-1);
  cards.forEach((c,i)=>{
   const enter=i===0?1:Math.max(0,Math.min(1,s-i+1)),d=Math.max(0,s-i),e=1-Math.pow(1-enter,3);
   const y=(1-e)*(innerHeight*.9)-Math.min(d,3)*22,sc=1-Math.min(d,3)*.05,op=enter<=0?0:1-Math.max(0,d-2)*.6;
   c.style.transform=reduced.matches?'none':`translate3d(0,${y.toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
   c.style.opacity=reduced.matches?(i<=Math.round(s)?1:0):Math.max(0,op).toFixed(2);
   c.style.zIndex=i;c.style.filter=d>0?`brightness(${(1-Math.min(d,3)*.18).toFixed(2)})`:'none';
  });
  const act=Math.round(s);
  if(act!==last){last=act;cards.forEach((c,i)=>c.classList.toggle('active',i===act));dots.forEach((d,i)=>d.classList.toggle('on',i===act));if(count)count.textContent=String(act+1).padStart(2,'0');}
 };
 let tick=false;const kick=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;update();});}};
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);update();
});
// 2) gentle staggered reveal
const groups=[
 ['.intro .eyebrow,.intro h2,.intro-bottom>p,.mini-stat'],
 ['.story .eyebrow,.story h2,.story-grid .large-copy,.story-grid>div>p,.story .text-link'],
 ['.partner>*'],
 ['.faq-section .eyebrow,.faq-section h2,.faq-list details'],
 ['.contact .wrap>*,.contact-bottom>*']
];
const seen=new Set();
groups.forEach(([sel])=>{let n=0;document.querySelectorAll(sel).forEach(el=>{if(seen.has(el))return;seen.add(el);el.classList.add('rv');el.style.setProperty('--d',Math.min(n++,6)*.09+'s');});});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
// 2b) inner pages: sections fade up in sequence; cards stagger
if(document.body.classList.contains('inner-page')){
 document.querySelectorAll('main > section').forEach((sec,si)=>{
  const direct=si===0?[...sec.querySelectorAll('.editorial-copy>*,.detail-hero>div:first-child>*')]:[...sec.children,...sec.querySelectorAll(':scope > div > .eyebrow,:scope > div > h2')];
  const items=[...sec.querySelectorAll('.capability-grid article,.workflow article,.deliverables li,.issue-list li,.jobs article,.contact-options article,.related a,.outcomes p,.team-grid>*,.prose p')];
  let n=0;[...direct,...items].forEach(el=>{if(seen.has(el)||el.closest('.brand-stage'))return;seen.add(el);el.classList.add('rv');el.style.setProperty('--d',Math.min(n++,8)*.07+'s');io.observe(el);});
 });
 document.querySelectorAll('.brand-anim').forEach(f=>{f.classList.add('rv');io.observe(f);});
}
// 2c) home story timeline
const sl=document.querySelector('.story-line');
if(sl)new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){sl.classList.add('in');o.disconnect();}},{threshold:.4}).observe(sl);
// 3) count-up for the headline stat
const stat=document.querySelector('.mini-stat strong');
if(stat&&!reduced.matches){const m=stat.textContent.match(/^(\d+)(.*)$/);if(m){const to=+m[1],suf=m[2];stat.textContent='0'+suf;
 new IntersectionObserver((es,o)=>{if(!es[0].isIntersecting)return;o.disconnect();const t0=performance.now();const step=now=>{const k=Math.min(1,(now-t0)/1400);stat.textContent=Math.round(to*(1-Math.pow(1-k,3)))+suf;if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);},{threshold:.6}).observe(stat);}}
})();
