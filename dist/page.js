const menu=document.querySelector('.menu'),nav=document.querySelector('nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
document.getElementById('year').textContent=new Date().getFullYear();
const host=document.querySelector('.product-art'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(host){const state={index:Number(document.body.dataset.product)||0,paused:false};import('./progressive3d.js').then(({prepare3D})=>prepare3D(host,async()=>{const {initProductScene}=await import('./scene3d.js');const scene=await initProductScene(host,state,{single:true});document.getElementById('reset-view').addEventListener('click',()=>scene.reset());document.getElementById('detail-motion').addEventListener('click',e=>{state.paused=!state.paused;e.currentTarget.textContent=state.paused?'Resume motion':'Pause motion';e.currentTarget.setAttribute('aria-pressed',state.paused);document.dispatchEvent(new Event('itcraft:motion'));});}));}

const brandHost=document.querySelector('[data-brand-scene]');
if(brandHost)import('./progressive3d.js').then(({prepare3D})=>prepare3D(brandHost,async()=>{const {initBrandScene}=await import('./brand3d.js');initBrandScene(brandHost,brandHost.dataset.brandScene);}));
