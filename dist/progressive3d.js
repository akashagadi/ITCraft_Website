// Keep WebGL outside the initial rendering path: start it once the visual is near the viewport and the page is idle.
// Visitors with reduced motion, Data Saver or a very slow connection keep the static artwork.
export function prepare3D(host,start){
 if(!host||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const connection=navigator.connection;
 if(connection?.saveData||/2g/.test(connection?.effectiveType||''))return;
 let started=false;
 const run=async()=>{if(started)return;started=true;try{await start();}catch(e){started=false;console.warn('Static artwork retained.',e);}};
 const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();const idle=()=>{if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1500});else setTimeout(run,100);};if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true});},{rootMargin:'80px'});observer.observe(host);
}
