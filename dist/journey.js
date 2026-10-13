// Scroll-driven Pac-Man story. Pac (an Indian SME) travels a long serpentine timeline: a chain of S-bends,
// one per product. A camera follows him down the track; "stations" along the way explain the problems
// and what PrismSuite, ProjectOne, AegisOne and PhoenixODR do about them.
(()=>{
const root=document.querySelector('#solutions.journey');
if(!root)return;
const stage=root.querySelector('.journey-sticky'),svg=root.querySelector('.journey-svg'),board=root.querySelector('.journey-board'),bubble=root.querySelector('.journey-bubble');
const cards=[...root.querySelectorAll('.journey-card')],steps=[...root.querySelectorAll('.journey-steps button')];
const meters=[...root.querySelectorAll('.hud-row')],stateLabel=root.querySelector('#journey-state');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobileMQ=matchMedia('(max-width:860px)');
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ramp=(v,a,b)=>clamp((v-a)/(b-a));
const ease=x=>x*x*(3-2*x);
const lerp=(a,b,t)=>a+(b-a)*t;
const win=(t,a,b,c,d)=>ease(ramp(t,a,b))*(1-ease(ramp(t,c,d)));
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const x=hex(a),y=hex(b);return'#'+x.map((v,i)=>Math.round(lerp(v,y[i],t)).toString(16).padStart(2,'0')).join('');};
const el=(tag,attrs,parent)=>{const n=document.createElementNS(NS,tag);for(const k in attrs)n.setAttribute(k,attrs[k]);if(parent)parent.appendChild(n);return n;};

// ---- the story, in the order Pac meets it ----
const P=t=>({k:'problem',t}),F=t=>({k:'feature',t}),D=t=>({k:'disaster',t}),G=(g,name,logo)=>({k:'gate',g,name,logo});
const ROWS=[
 [P('Old hardware'),P('No backups'),P('Weak passwords')],
 [P('Old software'),P('No monitoring')],
 [D('Ransomware'),D('Server failure'),D('Fire or flood')],
 [G('prism','PrismSuite','assets/prism.webp'),F('IT health'),F('Availability')],
 [F('Performance'),F('Security risks'),F('Gap analysis')],
 [G('project','ProjectOne','assets/project.webp'),F('Smart planning'),F('New network')],
 [G('aegis','AegisOne','assets/aegis.webp'),F('SOC & NOC'),F('Auto patching')],
 [G('phoenix','PhoenixODR','assets/phoenix.webp'),F('Recovery plan'),F('Keep running')]
];
const ITEMS=ROWS.flat();
const IX={prism:8,project:14,aegis:17,phoenix:20};
const BUBBLES=[
[-9,'I’m your business. Running on hope.','sad'],[-.4,'My hardware is old and slow…','sad'],[.6,'No backups. One crash and it’s all gone.','sad'],[1.6,'My passwords are weak…','sad'],[2.6,'My software is out of date.','sad'],[3.6,'And nobody is watching me.','sad'],[4.4,'Something feels wrong…','sad'],
[4.75,'Ransomware! My files are locked!','shock'],[5.75,'My server just died!','shock'],[6.7,'Fire… flood… everything is gone!','shock'],[7.3,'I’m all alone…','sad'],
[7.6,'I need to see what’s wrong.','aware'],[8,'PrismSuite: let’s look inside.','aware'],[8.8,'IT health: checking my vitals…','aware'],[9.8,'High availability: am I always up?','aware'],[10.8,'Performance: how fast am I?','aware'],[11.8,'Security risks: hunting for threats…','aware'],[12.8,'Gap analysis: what am I missing?','aware'],[13.5,'Now I can see everything.','aware'],
[14,'ProjectOne: time to fix it.','happy'],[14.8,'A smart plan, built for me.','happy'],[15.8,'A stronger network.','happy'],[16.5,'I feel stronger!','happy'],
[17,'AegisOne: now someone protects me.','safe'],[17.8,'SOC & NOC: watched 24×7.','safe'],[18.8,'Patches applied automatically.','safe'],[19.4,'But what if it happens again?','happy'],
[20,'PhoenixODR: I can always come back.','safe'],[20.8,'A recovery plan is ready.','safe'],[21.7,'My business never stops.','safe'],[22.3,'Ready for anything.','safe']];
const CHAPTERS=[-99,4.6,7.4,13.3,13.7,16.6,19.6,22.6];
const BANDS=[[-99,'Exposed'],[4.8,'Under attack!'],[7.6,'Looking inside'],[11.8,'Clear view'],[14,'Rebuilding'],[17.4,'Protected'],[20.3,'Unstoppable']];

let S=null,tgt=0,cur=0,lastTime=0,inView=false,ambientPaused=false,rafId=0,topY=0,heightPx=1,boardW=1,boardH=1,camY=0;

function build(mobile){
 svg.replaceChildren();
 const u=mobile?.7:1,cu=mobile?.82:1;
 const W=mobile?340:760,m=mobile?26:50,r=mobile?55:100,gap=2*r,viewH=mobile?420:560;
 const groups=mobile?ITEMS.map(i=>[i]):ROWS;
 const R=34*u,top=mobile?88:112;
 const nRows=groups.length,H=top+m+(nRows-1)*gap+gap*.8;
 const xl=m+r,xr=W-m-r;
 // serpentine path: even rows run right→left, odd rows left→right
 let d=`M${W-m} ${top}`,s=0;const rows=[];
 for(let k=0;k<nRows;k++){
  const y=top+k*gap,left=k%2===0,last=k===nRows-1;
  const xStart=k===0?W-m:(left?xr:xl);
  const xEnd=last?(left?m+22:W-m-22):(left?xl:xr);
  const len=Math.abs(xEnd-xStart);
  rows.push({k,y,left,xStart,xEnd,len,s0:s});
  d+=`H${xEnd}`;s+=len;
  if(!last){d+=left?`A${r} ${r} 0 0 0 ${xl} ${y+gap}`:`A${r} ${r} 0 0 1 ${xr} ${y+gap}`;s+=Math.PI*r;}
 }
 svg.setAttribute('viewBox',`0 0 ${W} ${viewH}`);board.style.setProperty('--ar',W/viewH);
 const path=el('path',{d,fill:'none',stroke:'none'},svg);
 const L=path.getTotalLength();
 const x0=W-m;
 const pt=q=>{if(q<0)return{x:x0-q,y:top};const p=path.getPointAtLength(Math.min(L,q));return{x:p.x,y:p.y};};
 const ang=q=>{if(q<=0)return Math.PI;const a=pt(Math.max(0,q-3)),b=pt(Math.min(L,q+3));return Math.atan2(b.y-a.y,b.x-a.x);};
 el('path',{d,class:'tl-track'},svg);
 const prog=el('path',{d,class:'tl-progress'},svg);prog.style.strokeDasharray='0 '+L;
 // place items on rows
 const SL={1:[.5],2:[.3,.7],3:[.14,.5,.86],last:[.1,.38,.66]};
 const items=[];groups.forEach((grp,gi)=>grp.forEach((it,si)=>{
  const row=rows[gi],f=(gi===groups.length-1&&grp.length===3?SL.last:SL[grp.length])[si],q=row.s0+f*row.len,x=row.xStart+(row.xEnd-row.xStart)*f;
  items.push({...it,i:items.length,q,tp:q/L,x,y:row.y});
 }));
 const xAtT=t=>{// fractional item index at path position t
  const a=items[0],b=items[items.length-1];
  if(t<=a.tp)return(t-a.tp)/(items[1].tp-a.tp);
  if(t>=b.tp)return items.length-1+(t-b.tp)/(b.tp-items[items.length-2].tp);
  let k=0;while(items[k+1].tp<t)k++;
  return k+(t-items[k].tp)/(items[k+1].tp-items[k].tp);
 };
 const tAtX=x=>{const k=clamp(Math.floor(x),0,items.length-2);return clamp(items[k].tp+(x-k)*(items[k+1].tp-items[k].tp),0,1);};
 // pellets
 const pelletG=el('g',{class:'pellets'},svg),pellets=[],gapS=mobile?24:34;
 for(let q=44*u,idx=0;q<L-26*u;q+=gapS,idx++){
  const t=q/L,x=xAtT(t);
  if(items.some(it=>it.k==='gate'&&Math.abs(q-it.q)<34*u))continue;
  if(x<7.6&&(idx*7919)%5<2)continue;
  const kind=x<7.6?'bad':x<9.4?'dim':x<14?'ok':x<20?'good':'safe';
  const p=pt(q);
  pellets.push({s:q,eaten:false,c:el('circle',{cx:p.x.toFixed(1),cy:p.y.toFixed(1),r:(kind==='bad'?2.6:3.4)*Math.max(.85,u),class:'pellet '+kind},pelletG)});
 }
 // stations and gates hang below the line
 const stG=el('g',{class:'stations'},svg);
 items.forEach(it=>{
  const g=el('g',{class:'station st-'+it.k+(it.g?' gate gate-'+it.g:''),'data-state':'ahead'},stG);
  it.g_el=g;
  if(it.k==='gate'){
   const p=pt(it.q),a=ang(it.q);
   const fr=el('g',{transform:`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(a*180/Math.PI).toFixed(1)})`,class:'gate-frame'},g);
   el('line',{x1:0,y1:-22*u,x2:0,y2:22*u,class:'gate-line'},fr);el('circle',{r:12*u,class:'gate-node'},fr);el('circle',{r:5*u,class:'gate-node-dot'},fr);
   const w=(mobile?62:({prism:84,phoenix:96}[it.g]||104)),h=mobile?62:({prism:108,phoenix:96}[it.g]||92),cy=it.y+(mobile?34:48)+h/2;
   el('line',{x1:it.x,y1:it.y,x2:it.x,y2:cy-h/2,class:'gate-tether'},g);
   const em=el('g',{transform:`translate(${it.x.toFixed(1)} ${cy.toFixed(1)})`,class:'emblem'},g);
   el('rect',{x:-w/2,y:-h/2,width:w,height:h,rx:14,class:'logo-plate'},em);
   el('image',{x:-w/2+5,y:-h/2+5,width:w-10,height:h-10,preserveAspectRatio:'xMidYMid meet',href:it.logo},em);
  }
 });
 // Pac
 const pac=el('g',{class:'pac'},svg);
 const aura=el('g',{class:'aura'},pac);el('circle',{r:R*2.1,class:'aura-ring'},aura);el('circle',{r:R*1.7,class:'aura-hex'},aura);
 const flames=el('g',{class:'flames'},pac);for(let i=0;i<7;i++)el('path',{d:`M0 0C${-.2*R} ${-.35*R} ${-.06*R} ${-.6*R} 0 ${-1.05*R}C${.06*R} ${-.6*R} ${.2*R} ${-.35*R} 0 0Z`,class:'flame'},flames);
 const puffs=el('g',{class:'puffs'},pac);[-.5,.1,.7].forEach((x,i)=>el('circle',{cx:x*R,cy:-R*1.1,r:R*.17,class:'puff puff-'+i},puffs));
 const body=el('path',{class:'pac-body'},pac);
 const cracks=el('path',{d:`M${-.55*R} ${-.55*R}l${.28*R} ${.18*R}l${-.1*R} ${.2*R}l${.24*R} ${.16*R}M${.2*R} ${.7*R}l${.08*R} ${-.24*R}l${.2*R} ${.06*R}`,class:'cracks'},pac);
 const bandage=el('g',{class:'bandage',transform:`translate(${-.42*R} ${-.5*R}) rotate(-32)`},pac);
 el('rect',{x:-.34*R,y:-.14*R,width:.68*R,height:.28*R,rx:.06*R},bandage);el('path',{d:`M${-.12*R} 0h${.24*R}M0 ${-.09*R}v${.18*R}`},bandage);
 const eyeX=.1*R,eyeY=-.46*R,eye=el('g',{class:'eye'},pac);
 const blush=el('circle',{cx:eyeX+.18*R,cy:eyeY+.6*R,r:.17*R,class:'blush'},eye);
 const sclera=el('circle',{cx:eyeX,cy:eyeY,r:.2*R,class:'sclera'},eye),pupil=el('circle',{cx:eyeX,cy:eyeY,r:.09*R,class:'pupil'},eye);
 const hl=el('circle',{r:.035*R,class:'hl'},eye);
 const lid=el('rect',{x:eyeX-.24*R,y:eyeY-.24*R,width:.48*R,height:.2*R,class:'lid'},eye);
 const bag=el('path',{d:`M${eyeX-.2*R} ${eyeY+.27*R}q${.2*R} ${.1*R} ${.4*R} 0`,class:'bag'},eye);
 const arc=el('path',{d:`M${eyeX-.21*R} ${eyeY+.07*R}Q${eyeX} ${eyeY-.32*R} ${eyeX+.21*R} ${eyeY+.07*R}`,class:'happy-eye'},eye);
 const brow=el('path',{class:'brow'},pac);
 const tear=el('circle',{r:.065*R,class:'tear'},pac),sweat=el('circle',{r:.075*R,class:'sweat'},pac);
 const sparkles=el('g',{class:'sparkles'},pac);[[-1.5,-1.3],[1.45,-1.5],[1.7,-.2]].forEach(([x,y])=>{const s2=.2*R;el('path',{d:`M${x*R-s2} ${y*R}H${x*R+s2}M${x*R} ${y*R-s2}V${y*R+s2}`,class:'sparkle'},sparkles);});
 return{prog,u,W,H,viewH,R,L,d,pt,ang,pellets,items,xAtT,tAtX,pac,body,cracks,bandage,sclera,pupil,lid,bag,puffs,aura,eyeX,eyeY,eatenTo:0,mobile,flames,blush,hl,arc,brow,tear,sweat,sparkles,dir:1};
}

function metrics(x){
 const clarity=ease(ramp(x,8,11)),strength=ease(ramp(x,14,16.4)),protect=ease(ramp(x,17,18.4));
 const pre=1-ease(ramp(x,4.8,5.8));
 const joy=Math.max(win(x,17.2,18,19.4,20.2),ease(ramp(x,21.2,22.4)));
 const emo={tired:win(x,-9,0,2,4),worried:win(x,.8,1.8,3.4,4.8),curious:win(x,7.9,8.7,12,13.4),determined:win(x,13.8,14.6,16,17),joy,
  shock:win(x,4.8,5.3,6.2,6.9),pain:win(x,6.2,6.9,8.6,9.6),reborn:win(x,19.9,20.4,21.4,22.1)};
 return{clarity,strength,protect,dip:0,emo,health:Math.max(.05,.09+.23*pre+.14*clarity+.5*strength+.26*protect)};
}

// ---- sound: small synthesized effects (Web Audio), off until the visitor turns it on ----
const Snd=(()=>{
 let ctx=null,master=null,nbuf=null,flip=0;const o={on:false};
 const btn=root.querySelector('.journey-sound'),lab=btn&&btn.querySelector('span');
 const ensure=()=>{if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=1;const lim=ctx.createDynamicsCompressor();lim.threshold.value=-14;lim.knee.value=12;lim.ratio.value=10;lim.attack.value=.003;lim.release.value=.2;const out=ctx.createGain();out.gain.value=1.5;master.connect(lim);lim.connect(out);out.connect(ctx.destination);
   nbuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  if(ctx.state==='suspended')ctx.resume();return true;};
 const tone=(f,dur,type='sine',v=.25,at=0,to=null)=>{if(!o.on||!ctx)return;const t=ctx.currentTime+at,osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(f,t);if(to)osc.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(g);g.connect(master);osc.start(t);osc.stop(t+dur+.05);};
 const noise=(dur,v=.25,freq=1200,at=0,type='lowpass')=>{if(!o.on||!ctx)return;const t=ctx.currentTime+at,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=nbuf;f.type=type;f.frequency.value=freq;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.05);};
 o.chomp=()=>{flip^=1;tone(flip?540:340,.07,'triangle',.18,0,flip?340:540);};
 o.item=k=>{if(k==='feature')tone(880,.09,'sine',.2,0,1320);else if(k==='problem')tone(190,.18,'sawtooth',.13,0,120);else{noise(.28,.22,500);tone(95,.3,'sawtooth',.18,0,45);}};
 o.boom=()=>{noise(.9,.5,320);tone(70,.9,'sine',.5,0,26);for(let i=0;i<5;i++)noise(.04,.18,3200,.2+i*.09,'highpass');};
 o.sad=()=>{tone(392,.4,'sawtooth',.1,0,368);tone(370,.4,'sawtooth',.1,.42,346);tone(349,1,'sawtooth',.1,.84,290);};
 o.gate=g=>{
  if(g==='prism')[784,988,1175,1568,1976].forEach((f,i)=>tone(f,.4,'sine',.15,i*.07));
  else if(g==='project'){tone(150,.12,'square',.18);tone(150,.12,'square',.18,.15);[392,494,587].forEach((f,i)=>tone(f,.3,'triangle',.18,.32+i*.1));}
  else if(g==='aegis'){tone(280,.55,'sawtooth',.09,0,900);[659,880,1175].forEach((f,i)=>tone(f,.4,'sine',.15,.4+i*.09));}
  else{noise(.6,.22,2400);tone(200,.7,'triangle',.18,0,900);[523,659,784,1047].forEach((f,i)=>tone(f,.4,'triangle',.17,.45+i*.1));}};
 o.win=()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,.45,'triangle',.18,i*.1));tone(2093,.5,'sine',.08,.6);};
 const paint=()=>{if(btn){btn.setAttribute('aria-pressed',String(o.on));btn.setAttribute('aria-label',o.on?'Mute sound':'Unmute sound');lab.textContent=o.on?'Sound on':'Muted';btn.classList.toggle('on',o.on);}};
 o.set=v=>{o.on=v;if(v)ensure();paint();if(o.on)tone(660,.12,'sine',.2,0,990);};
 // sound is on by default; browsers only allow audio after a first click, tap or key press, so unlock then
 o.resume=()=>{if(o.on&&ctx&&ctx.state==='suspended')ctx.resume();};
 o.on=true;paint();
 const EV=['pointerdown','pointerup','mousedown','click','keydown','touchend','wheel','touchmove'];
 const ready=()=>root.classList.add('sound-ready');
 const unlock=()=>{if(!o.on)return;ensure();if(ctx){const done=()=>{if(ctx.state==='running'){ready();EV.forEach(ev=>removeEventListener(ev,unlock,true));}};if(ctx.state==='running')done();else ctx.resume().then(done,()=>{});}};
 EV.forEach(ev=>addEventListener(ev,unlock,true));
 o.state=()=>ctx?ctx.state:'none';
 if(btn)btn.addEventListener('click',()=>o.set(!o.on));
 return o;
})();
let lastX=null,lastChomp=0,events=[];
function buildEvents(){events=[];S.items.forEach(it=>{if(it.k==='gate')events.push({x:it.i-.05,f:()=>Snd.gate(it.g)});else events.push({x:it.i-.6,f:()=>Snd.item(it.k)});});
 events.push({x:4.8,f:Snd.boom},{x:6.9,f:Snd.sad},{x:22.2,f:Snd.win});events.sort((a,b)=>a.x-b.x);}
function soundStep(X,newEaten){
 Snd.resume();
 if(lastX!==null&&Snd.on&&inView&&!document.hidden&&X>lastX&&X-lastX<2.5){let n=0;for(const e of events){if(e.x>lastX&&e.x<=X&&n++<3)e.f();}
  if(newEaten&&performance.now()-lastChomp>120){lastChomp=performance.now();Snd.chomp();}}
 lastX=X;
}
let lastBubble=-1,lastChapter=-1,lastBand=-1;
function render(time,dt){
 const t=clamp(cur/S.L),X=S.xAtT(t),{clarity,strength,protect,dip,emo:E,health}=metrics(X);
 const {R}=S,p=S.pt(cur),a=S.ang(cur),idle=reduced.matches||ambientPaused;
 const T=idle?0:time;
 root.classList.toggle('is-disaster',X>4.8&&X<7.4);
 // camera follows Pac down the track
 const camT=clamp(p.y-S.viewH*.5,0,S.H-S.viewH);
 camY=reduced.matches||Math.abs(camT-camY)>400?camT:lerp(camY,camT,1-Math.exp(-(dt||.016)*6));
 svg.setAttribute('viewBox',`0 ${camY.toFixed(1)} ${S.W} ${S.viewH}`);
 let tint=mix('#6a6552','#ffd23f',ease(health));
 tint=mix(tint,'#aebcc4',E.shock*.8);tint=mix(tint,'#ffb347',E.reborn*.55);
 S.prog.style.strokeDasharray=Math.max(0,cur)+' '+S.L;S.prog.style.stroke=mix('#ff7a59','#b6f4a3',ease(health));
 // body language
 if(Math.abs(Math.cos(a))>.25)S.dir=Math.cos(a)>0?1:-1;
 const tremble=idle?0:E.shock*2.6+E.worried*.9+E.pain*.8;
 const jx=tremble?Math.sin(T*47)*tremble:0,jy=tremble?Math.cos(T*41)*tremble*.7:0;
 const hop=idle?0:-Math.abs(Math.sin(T*5.5))*R*.3*E.joy*(1-E.shock);
 const breath=1+(idle?0:Math.sin(T*(E.tired>.5?1.4:3.2))*.028*(1+E.joy*2))+E.shock*.1-E.pain*.05;
 S.pac.setAttribute('transform',`translate(${(p.x+jx).toFixed(1)} ${(p.y+hop+jy).toFixed(1)}) scale(${breath.toFixed(3)})`);
 let m=reduced.matches?.3:(4+30*Math.abs(Math.sin(cur*.09))*(.35+.65*health))*Math.PI/180;
 m=lerp(m,.7,clamp(E.shock+E.pain*.3));
 const a1=a+m,a2=a-m;
 S.body.setAttribute('d',`M0 0L${(R*Math.cos(a1)).toFixed(1)} ${(R*Math.sin(a1)).toFixed(1)}A${R} ${R} 0 1 1 ${(R*Math.cos(a2)).toFixed(1)} ${(R*Math.sin(a2)).toFixed(1)}Z`);
 S.body.style.fill=tint;
 S.pac.style.setProperty('--glow',(2+health*14+E.reborn*16).toFixed(0)+'px');
 S.pac.style.setProperty('--gc',E.reborn>.15?'#ff7a2f':E.shock>.2?'#9fb7c4':mix('#ff9f43','#ffd23f',health));
 S.cracks.style.opacity=Math.max(.95*(1-strength),E.shock*.95,E.pain*.8).toFixed(2);
 S.bandage.style.opacity=Math.max(1-ease(ramp(X,14,15.6)),E.pain*.9).toFixed(2);
 S.puffs.style.opacity=(Math.max(0,.9-health*1.4)).toFixed(2);
 // face
 const er=.2*R*(1+.4*clarity+.3*E.shock+.15*E.curious);
 const darting=idle?0:Math.sin(T*1.9)*.07*R*(E.worried+E.pain*.5);
 S.sclera.setAttribute('r',er.toFixed(2));
 S.pupil.setAttribute('r',(.09*R*(1+.4*E.curious+.2*clarity)*(1-.5*E.shock)).toFixed(2));
 const px0=S.eyeX+Math.cos(a)*.05*R+darting,py0=S.eyeY+Math.sin(a)*.04*R+(E.tired+E.pain)*.05*R-E.curious*.02*R;
 S.pupil.setAttribute('cx',px0.toFixed(2));S.pupil.setAttribute('cy',py0.toFixed(2));
 S.hl.setAttribute('cx',(px0+.03*R).toFixed(2));S.hl.setAttribute('cy',(py0-.035*R).toFixed(2));
 const blink=idle?0:((T%3.7)<.1?1:0);
 const lidAmt=clamp(Math.max(E.tired*.62+E.pain*.5,blink)+Math.max(0,Math.sin(T*1.3))*.05*E.tired);
 S.lid.setAttribute('x',(S.eyeX-er-.04*R).toFixed(2));S.lid.setAttribute('y',(S.eyeY-er-.04*R).toFixed(2));S.lid.setAttribute('width',(er*2+.08*R).toFixed(2));S.lid.setAttribute('height',((er*2+.08*R)*lidAmt).toFixed(2));
 S.lid.style.fill=tint;S.bag.style.opacity=clamp(E.tired*.9+E.pain*.8).toFixed(2);
 S.sclera.classList.toggle('keen',clarity>.5&&E.shock<.2);
 const happy=ramp(E.joy,.65,.9);
 S.arc.style.opacity=happy.toFixed(2);S.sclera.style.opacity=S.pupil.style.opacity=(1-happy).toFixed(2);S.hl.style.opacity=((1-.7*E.tired-.5*E.pain)*(1-happy)).toFixed(2);
 S.blush.style.opacity=(E.joy*.55+E.determined*.12).toFixed(2);
 const tilt=E.worried+E.pain*1.1-E.determined*.9+E.shock*.2,raise=E.curious*.8+E.shock*1.3+E.joy*.6-E.tired*.6+E.worried*.3,arch=E.joy*.8+E.shock*.5+E.curious*.4;
 const brx=S.eyeX,bry=S.eyeY-er*1.55-raise*R*.1,brw=er*1.45,k=R*.12,d2=S.dir;
 S.brow.setAttribute('d',`M${(brx-d2*brw).toFixed(1)} ${(bry+tilt*k+E.tired*R*.05).toFixed(1)}Q${brx.toFixed(1)} ${(bry-arch*R*.14).toFixed(1)} ${(brx+d2*brw).toFixed(1)} ${(bry-tilt*k).toFixed(1)}`);
 const f1=(T*.75)%1,f2=(T*1.1+.4)%1;
 const tearAmt=idle?0:Math.max(E.worried*.6,E.pain*.95,E.shock*.45,E.tired*.4);
 S.tear.setAttribute('cx',(S.eyeX+.02*R).toFixed(1));S.tear.setAttribute('cy',(S.eyeY+er+f1*R*.95).toFixed(1));S.tear.style.opacity=(tearAmt*(1-f1)).toFixed(2);
 const swAmt=idle?0:Math.max(E.worried*.7,E.shock);
 S.sweat.setAttribute('cx',(-.62*R).toFixed(1));S.sweat.setAttribute('cy',(-.7*R+f2*R*.8).toFixed(1));S.sweat.style.opacity=(swAmt*(1-f2)).toFixed(2);
 S.sparkles.style.opacity=Math.max(E.curious*.9,ramp(E.joy,.5,.9)*(idle?.6:1)).toFixed(2);
 S.sparkles.style.transform=`scale(${(.85+(idle?0:Math.sin(T*6)*.15)).toFixed(2)}) rotate(${(idle?0:T*30).toFixed(0)}deg)`;
 S.aura.style.opacity=(protect*(1-dip)).toFixed(2);S.aura.style.transform=`scale(${(.6+.4*protect).toFixed(2)})`;
 [...S.flames.children].forEach((f,i)=>{const th=Math.PI+(i+.5)*Math.PI/7,fl=idle?1:.8+Math.sin(T*9+i*2)*.22;
  f.setAttribute('transform',`translate(${(Math.cos(th)*R*.88).toFixed(1)} ${(Math.sin(th)*R*.88).toFixed(1)}) rotate(${(th*180/Math.PI+90).toFixed(0)}) scale(${(1.15*fl).toFixed(2)})`);});
 S.flames.style.opacity=E.reborn.toFixed(2);
 // pellets
 const lim=cur-6;let newEaten=0;
 for(let i=S.eatenTo;i<S.pellets.length;i++){const q=S.pellets[i];if(q.s<lim){if(!q.eaten){q.eaten=true;newEaten++;q.c.classList.add('eaten');}S.eatenTo=i+1;}else break;}
 while(S.eatenTo>0&&S.pellets[S.eatenTo-1].s>=lim){const q=S.pellets[--S.eatenTo];q.eaten=false;q.c.classList.remove('eaten');}
 soundStep(X,newEaten);
 // stations appear one by one as Pac reaches them, then fade away behind him
 S.items.forEach(it=>{const dd=X-it.i,g=it.g_el;
  const op=ramp(dd,-.8,-.2)*(1-ramp(dd,it.k==='gate'?2:.7,it.k==='gate'?3:1.5));
  g.style.opacity=op.toFixed(2);g.style.visibility=op<.01?'hidden':'visible';
  const st=dd>=0?'passed':dd>-1.2?'near':'ahead';
  if(g.dataset.state!==st){const was=g.dataset.state;g.dataset.state=st;if(it.k==='gate'&&st==='passed'&&was!=='passed'&&!reduced.matches){g.classList.remove('burst');void g.getBoundingClientRect();g.classList.add('burst');}}});
 // mood, hud, bubble, chapter
 root.style.setProperty('--health',health.toFixed(3));
 root.style.setProperty('--mood',mix('#ff5d5d','#ffd23f',ease(ramp(health,0,.6))));
 root.style.setProperty('--mood2',mix('#ffd23f','#b6f4a3',ease(ramp(health,.6,1))));
 meters.forEach(m2=>{const v=Math.round(health*100);m2.querySelector('i').style.transform=`scaleX(${health.toFixed(3)})`;const b=m2.querySelector('b');if(b.textContent!==v+'%')b.textContent=v+'%';});
 let band=0;BANDS.forEach((b,i)=>{if(X>=b[0])band=i;});
 if(band!==lastBand){lastBand=band;stateLabel.textContent=BANDS[band][1];root.dataset.band=band;}
 let bi=0;BUBBLES.forEach((b,i)=>{if(X>=b[0])bi=i;});
 if(bi!==lastBubble){lastBubble=bi;bubble.textContent=BUBBLES[bi][1];bubble.dataset.tone=BUBBLES[bi][2];bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');}
 const sc=boardW/S.W,bw=bubble.offsetWidth,bh=bubble.offsetHeight,px=p.x*sc,py=(p.y-camY)*sc,rpx=R*sc;
 const cx=clamp(px,bw/2+6,boardW-bw/2-6);let cy=py-rpx*1.55-bh/2;
 if(cy<bh/2+6)cy=py+rpx*1.55+bh/2;
 bubble.style.transform=`translate(${cx.toFixed(0)}px,${cy.toFixed(0)}px) translate(-50%,-50%)`;
 let ch=0;CHAPTERS.forEach((c,i)=>{if(X>=c)ch=i;});
 if(ch!==lastChapter){lastChapter=ch;cards.forEach((c,i)=>{const on=i===ch;c.classList.toggle('is-active',on);c.toggleAttribute('inert',!on);c.setAttribute('aria-hidden',on?'false':'true');});}
 let act=0;steps.forEach((b,i)=>{if(X>=+b.dataset.x-.6)act=i;});steps.forEach((b,i)=>b.classList.toggle('on',i===act));
}
function scrollT(){const p=(scrollY-topY)/Math.max(1,heightPx-innerHeight);return clamp((p-.02)/.96);}
function frame(now){
 rafId=0;topY=root.getBoundingClientRect().top+scrollY;heightPx=root.offsetHeight;
 const time=now/1000,dt=Math.min(.4,(now-lastTime)/1000||0.016);lastTime=now;
 tgt=scrollT()*S.L;
 cur=reduced.matches?tgt:lerp(cur,tgt,1-Math.exp(-dt*7));
 if(Math.abs(cur-tgt)<.05)cur=tgt;
 render(time,dt);
 if(inView&&!reduced.matches&&!document.hidden)rafId=requestAnimationFrame(frame);
}
function kick(){if(!rafId)rafId=requestAnimationFrame(frame);}
function sizeTrack(){// the scroll distance follows the path length, so there is time to read every station
 root.style.height=Math.round(S.L*(S.mobile?1.2:1.4)+innerHeight)+'px';
}
function measure(){topY=root.getBoundingClientRect().top+scrollY;heightPx=root.offsetHeight;boardW=board.clientWidth;boardH=board.clientHeight;}
function init(){
 root.classList.add('js-journey');
 S=build(mobileMQ.matches);sizeTrack();measure();
 cur=tgt=scrollT()*S.L;lastBubble=lastChapter=lastBand=-1;camY=0;lastX=null;buildEvents();
 steps.forEach(b=>{const k=b.dataset.g;b.dataset.x=k==='today'?-9:IX[k];});
 render(0,.016);
}
init();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{S.items.forEach(i=>i.fit&&i.fit());});
addEventListener('scroll',kick,{passive:true});
addEventListener('resize',()=>{sizeTrack();measure();kick();});
new ResizeObserver(()=>{measure();kick();}).observe(board);
mobileMQ.addEventListener('change',()=>{init();kick();});
new IntersectionObserver(e=>{inView=e[0].isIntersecting;if(inView){measure();kick();}}).observe(root);
document.addEventListener('visibilitychange',kick);
document.addEventListener('itcraft:motion',e=>{ambientPaused=!!e.detail?.paused;kick();});
steps.forEach(b=>b.addEventListener('click',()=>{
 const k=b.dataset.g,t=k==='today'?0:S.tAtX(IX[k]+.2);measure();
 scrollTo({top:topY+(heightPx-innerHeight)*(.02+.96*t),behavior:reduced.matches?'auto':'smooth'});}));
stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch'||mobileMQ.matches)return;const r=board.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;board.style.setProperty('--rx',(-y*3).toFixed(2)+'deg');board.style.setProperty('--ry',(x*4).toFixed(2)+'deg');});
stage.addEventListener('pointerleave',()=>{board.style.setProperty('--rx','0deg');board.style.setProperty('--ry','0deg');});
})();
