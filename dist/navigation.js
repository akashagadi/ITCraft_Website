// Let the browser own navigation/history. Prefetch on intent without delaying clicks.
(()=>{
 const prefetched=new Set();let count=0;const slow=navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||'');
 function warm(e){if(slow||count>=5)return;const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname||!u.pathname.endsWith('.html')||prefetched.has(u.pathname))return;prefetched.add(u.pathname);count++;const l=document.createElement('link');l.rel='prefetch';l.href=u.origin+u.pathname;l.as='document';document.head.append(l);}
 document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);
})();

// Tech stack dropdown: hover/focus opens it on desktop (CSS); click/tap toggles it everywhere; Esc and outside click close it.
(()=>{
 const dd=document.querySelector('.nav-dd');if(!dd)return;
 const btn=dd.querySelector('.nav-dd-btn');
 const set=o=>{dd.classList.toggle('open',o);btn.setAttribute('aria-expanded',String(o));};
 btn.addEventListener('click',e=>{e.stopPropagation();set(!dd.classList.contains('open'));});
 document.addEventListener('click',e=>{if(!dd.contains(e.target))set(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dd.classList.contains('open')){set(false);btn.focus();}});
})();
