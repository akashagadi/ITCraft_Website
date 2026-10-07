// Let the browser own navigation/history. Prefetch on intent without delaying clicks.
(()=>{
 const prefetched=new Set();let count=0;const slow=navigator.connection?.saveData||/2g/.test(navigator.connection?.effectiveType||'');
 function warm(e){if(slow||count>=5)return;const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname||!u.pathname.endsWith('.html')||prefetched.has(u.pathname))return;prefetched.add(u.pathname);count++;const l=document.createElement('link');l.rel='prefetch';l.href=u.origin+u.pathname;l.as='document';document.head.append(l);}
 document.addEventListener('pointerover',warm,{passive:true});document.addEventListener('focusin',warm);
})();
