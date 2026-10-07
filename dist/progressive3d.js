// Keep WebGL outside the initial rendering path; phones get an explicit opt-in.
export function prepare3D(host,start){
 if(!host||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const connection=navigator.connection;
 const light=matchMedia('(max-width: 900px) and (pointer: coarse)').matches||connection?.saveData||/2g/.test(connection?.effectiveType||'')||(navigator.deviceMemory&&navigator.deviceMemory<=4);
 let started=false;
 const button=document.createElement('button');button.type='button';button.className='enable-3d';button.textContent='View interactive 3D';
 const run=async()=>{if(started)return;started=true;button.disabled=true;button.textContent='Loading 3D…';try{await start();button.remove();}catch(e){started=false;button.disabled=false;button.textContent='Retry interactive 3D';if(!button.isConnected)host.append(button);console.warn('Static artwork retained.',e);}};
 button.addEventListener('click',run);
 if(light){host.append(button);return;}
 const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();const idle=()=>{if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1500});else setTimeout(run,100);};if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true});},{rootMargin:'80px'});observer.observe(host);
}
