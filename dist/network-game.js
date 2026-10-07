const root=document.querySelector('.cyber-arcade');
if(root){
 const $=s=>root.querySelector(s),arena=$('.arcade-arena'),layer=$('.arcade-packets'),overlay=$('.arcade-overlay'),start=$('.arc-start'),pause=$('.arc-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='ready',time=20,score=0,health=100,combo=0,blocked=0,packets=[],raf=0,last=0,spawn=0,serial=0,width=400,height=280,feedbackUntil=0;
 let pointer=null;
 const effects=new Set();
 const threats=['PHISHING','MALWARE','RANSOMWARE'];
 const safe=['EMAIL','BACKUP','BUSINESS DATA'];
 function measure(){width=arena.clientWidth;height=arena.clientHeight;}
 new ResizeObserver(measure).observe(arena);measure();
 function hud(){$('#arc-score').textContent=String(score).padStart(3,'0');$('#arc-time').textContent=Math.ceil(time)+'s';$('#arc-health').textContent=health+'%';root.style.setProperty('--integrity',health+'%');}
 function clearEffects(){for(const e of effects){e.getAnimations().forEach(a=>a.cancel());e.remove();}effects.clear();}
 function clear(){clearEffects();packets.forEach(p=>p.el.remove());packets=[];}
 function feedback(message,bad=false){$('.arcade-combo').textContent=message;$('.arcade-combo').classList.toggle('bad',bad);feedbackUntil=performance.now()+650;$('.arcade-flash').classList.toggle('hit',bad);}
 function remove(p){p.el.remove();packets=packets.filter(x=>x!==p);}
 function hit(p){if(mode!=='playing'||!packets.includes(p))return;
  if(p.bad){slice(p);combo++;blocked++;const bonus=Math.min(30,10+Math.floor(combo/3)*5);score+=bonus;feedback(combo>=3?`${combo} SLICE STREAK +${bonus}`:`SLICED +${bonus}`);}
  else{combo=0;score=Math.max(0,score-5);health=Math.max(0,health-10);feedback('SAFE TRAFFIC · −5',true);}
  remove(p);hud();if(health===0)finish();
 }

 function effect(el,frames,duration){
  if(reduced.matches||effects.size>=60)return;
  el.classList.add('arc-fx');el.setAttribute('aria-hidden','true');arena.append(el);effects.add(el);
  const animation=el.animate(frames,{duration,easing:'cubic-bezier(.18,.6,.35,1)',fill:'forwards'});
  animation.onfinish=()=>{el.remove();effects.delete(el);};
 }
 function trail(a,b){const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<3)return;
  const el=document.createElement('i');el.className='arc-slash';el.style.left=a.x+'px';el.style.top=a.y+'px';el.style.width=length+'px';el.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;
  effect(el,[{opacity:1},{opacity:0}],190);
 }
 function slice(p){const x=(p.lane+.5)*width/3,w=p.el.offsetWidth,h=p.el.offsetHeight,y=p.y;
  trail({x:x-w*.65,y:y+h*.85},{x:x+w*.65,y:y+h*.15});
  for(const side of [-1,1]){const el=document.createElement('span');el.className='arc-half';el.textContent=p.el.textContent;el.style.cssText=`left:${x-w/2}px;top:${y}px;width:${w}px;height:${h}px;clip-path:${side<0?'polygon(0 0,100% 0,0 100%)':'polygon(100% 0,100% 100%,0 100%)'}`;
   effect(el,[{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${side*45}px,${side<0?-25:65}px) rotate(${side*32}deg)`,opacity:0}],460);
  }
  for(let i=0;i<6;i++){const el=document.createElement('i');el.className='arc-spark';el.style.left=x+'px';el.style.top=(y+h/2)+'px';const a=Math.PI*2*i/6;effect(el,[{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(a)*50}px,${Math.sin(a)*45}px)`,opacity:0}],340);}
 }
 function point(e){const r=arena.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
 function swipe(a,b){trail(a,b);const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
  for(const p of [...packets]){const x=(p.lane+.5)*width/3,y=p.y+p.el.offsetHeight/2,t=d?Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/d)):0;
   if(Math.abs(x-(a.x+t*dx))<p.el.offsetWidth/2&&Math.abs(y-(a.y+t*dy))<p.el.offsetHeight/2)hit(p);
  }
 }
 arena.addEventListener('pointerdown',e=>{if(mode!=='playing'||e.button!==0||pointer)return;pointer={id:e.pointerId,...point(e)};arena.setPointerCapture(e.pointerId);swipe(pointer,pointer);});
 arena.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId||mode!=='playing')return;const next=point(e);swipe(pointer,next);pointer={id:e.pointerId,...next};});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])arena.addEventListener(event,()=>{pointer=null;});

 function spawnPacket(){const lane=serial++%3,bad=Math.random()<.72,el=document.createElement('button');el.type='button';el.className='arc-packet '+(bad?'threat':'safe');el.textContent=(bad?threats:safe)[Math.floor(Math.random()*3)];el.setAttribute('aria-label',`${bad?'Block threat':'Safe traffic: let through'}, ${el.textContent}, lane ${lane+1}`);layer.append(el);const p={el,lane,bad,y:-48};packets.push(p);el.addEventListener('click',()=>hit(p));}
 function frame(now){raf=0;if(mode!=='playing')return;const dt=Math.min((now-last)/1000||0,.05);last=now;time=Math.max(0,time-dt);spawn-=dt;
  if(spawn<=0){spawnPacket();spawn=time>10?.76:.61;}
  const speed=((reduced.matches?48:58)+(20-time)*1.6)*Math.max(.8,(height-74)/211);
  for(const p of [...packets]){p.y+=dt*speed;p.el.style.transform=`translate(${(p.lane+.5)*width/3}px,${p.y}px) translateX(-50%)`;
   if(p.y>height-74){if(p.bad){health=Math.max(0,health-20);combo=0;feedback('THREAT GOT THROUGH',true);}else score+=2;remove(p);}}
  if(now>feedbackUntil){$('.arcade-combo').textContent='';$('.arcade-flash').classList.remove('hit');}
  hud();if(time<=0||health<=0){finish();return;}raf=requestAnimationFrame(frame);
 }
 function showOverlay(title,copy,label){$('.arc-overlay-title').textContent=title;$('.arc-overlay-copy').textContent=copy;start.textContent=label;overlay.hidden=false;}
 function begin(){cancelAnimationFrame(raf);clear();time=20;score=0;health=100;combo=blocked=serial=0;spawn=.25;mode='playing';root.classList.add('arcade-active');root.classList.remove('arcade-over');overlay.hidden=true;$('.game-next').hidden=true;pause.disabled=false;pause.textContent='Pause';pause.setAttribute('aria-pressed','false');$('.game-status').textContent='Round started. Slice red threats. Allow green traffic. Keys 1, 2 and 3 block the lowest packet in each lane.';hud();measure();last=performance.now();raf=requestAnimationFrame(frame);pause.focus();}
 function setPaused(){if(mode!=='playing')return;mode='paused';pointer=null;clearEffects();cancelAnimationFrame(raf);pause.textContent='Resume';pause.setAttribute('aria-pressed','true');showOverlay('Defence paused.','Your round will resume exactly where you left it.','Resume round');$('.game-status').textContent='Game paused.';}
 function resume(){if(mode!=='paused')return;mode='playing';overlay.hidden=true;pause.textContent='Pause';pause.setAttribute('aria-pressed','false');last=performance.now();raf=requestAnimationFrame(frame);pause.focus();}
 function finish(){mode='over';cancelAnimationFrame(raf);clear();root.classList.add('arcade-over');pause.disabled=true;const title=health===0?'Network breached.':health>=80?'Defence held strong.':'You held the line.';const result=`${blocked} threats sliced · ${score} points · ${health}% integrity`;showOverlay(title,result,'Play again');$('.game-status').textContent=title+' '+result;$('.game-next').hidden=false;start.focus();}
 start.addEventListener('click',()=>mode==='paused'?resume():begin());pause.addEventListener('click',()=>mode==='playing'?setPaused():resume());
 function laneHit(lane){if(mode!=='playing')return;const candidates=packets.filter(p=>p.lane===lane&&p.y>=0).sort((a,b)=>b.y-a.y);if(candidates[0])hit(candidates[0]);}
 root.addEventListener('keydown',e=>{if(e.repeat)return;if(['1','2','3'].includes(e.key)){e.preventDefault();laneHit(Number(e.key)-1);}if(e.key==='Escape')setPaused();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused();});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)setPaused();},{threshold:.15}).observe(root);
 document.addEventListener('itcraft:motion',e=>{if(e.detail?.paused)setPaused();});
 addEventListener('pagehide',()=>{setPaused();cancelAnimationFrame(raf);});hud();
}
