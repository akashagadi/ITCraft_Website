const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
$('.menu').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('.menu').setAttribute('aria-expanded',open);$('.menu').setAttribute('aria-label',open?'Close navigation':'Open navigation');});$('nav').addEventListener('click',()=>{$('nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');});
function motionLabel(){document.querySelector('.hero-artwork')?.classList.toggle('art-paused',paused);document.dispatchEvent(new CustomEvent('itcraft:motion',{detail:{paused}}));$('#motion').textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';$('#motion').setAttribute('aria-pressed',paused);}motionLabel();$('#motion').addEventListener('click',()=>{paused=!paused;motionLabel();});reduced.addEventListener('change',()=>{paused=reduced.matches;motionLabel();});
$('#year').textContent=new Date().getFullYear();
const heroArtwork=document.querySelector('.hero-artwork');
if(heroArtwork){new IntersectionObserver(entries=>heroArtwork.classList.toggle('art-offscreen',!entries[0].isIntersecting)).observe(heroArtwork);document.addEventListener('visibilitychange',()=>heroArtwork.classList.toggle('art-hidden',document.hidden));}
// The Pac-Man story journey lives in journey.js; load after first paint.
import('./journey.js').catch(()=>{});
import('./reveal.js').catch(()=>{});
import('./globe.js').catch(()=>{});
