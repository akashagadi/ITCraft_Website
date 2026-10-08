// Hero globe: a dotted, slowly rotating Earth with glowing connection arcs fanning out from India.
(()=>{
const canvas=document.querySelector('.hero-globe canvas');
if(!canvas)return;
const ctx=canvas.getContext('2d'),host=canvas.parentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const D=Math.PI/180;
// very coarse landmasses (lon,lat), enough to read as continents when drawn as dots
const LAND=[
 [[-168,66],[-140,70],[-95,72],[-62,60],[-55,47],[-70,42],[-80,25],[-97,18],[-87,15],[-80,8],[-105,20],[-118,32],[-124,45],[-135,58]],
 [[-80,8],[-60,10],[-35,-6],[-40,-22],[-58,-38],[-68,-55],[-75,-48],[-72,-20],[-81,-5]],
 [[-10,36],[-9,43],[-1,46],[5,53],[12,56],[22,70],[45,68],[70,73],[105,78],[140,73],[170,70],[180,66],[165,58],[142,52],[135,43],[127,38],[122,31],[120,24],[110,20],[106,10],[100,13],[98,8],[103,1],[98,16],[92,22],[88,22],[80,15],[77,8],[73,17],[68,24],[57,25],[56,27],[50,29],[56,26],[58,22],[52,16],[43,13],[35,28],[35,36],[28,36],[26,40],[20,40],[15,38],[8,44],[-1,37]],
 [[-17,21],[-10,35],[10,37],[32,31],[35,28],[43,12],[51,12],[40,-5],[40,-15],[33,-27],[20,-35],[12,-18],[9,0],[-8,4],[-17,14]],
 [[113,-22],[122,-17],[131,-12],[142,-11],[153,-27],[146,-39],[137,-35],[115,-34]],
 [[-55,60],[-20,70],[-20,82],[-60,82],[-70,76]],
 [[95,5],[106,-6],[115,-8],[120,-2],[110,2]],
 [[130,31],[140,36],[142,44],[135,34]]
];
const inPoly=(lon,lat,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>lat)!==(yj>lat)&&lon<(xj-xi)*(lat-yi)/(yj-yi)+xi)c=!c;}return c;};
const land=(lon,lat)=>LAND.some(p=>inPoly(lon,lat,p));
const ll=(lon,lat)=>({lon:lon*D,lat:lat*D});
// land dots on a roughly even lattice
const dots=[];
for(let lat=-80;lat<=84;lat+=3){const n=Math.max(1,Math.round(360*Math.cos(lat*D)/3));for(let i=0;i<n;i++){const lon=-180+(i+.5)*360/n;if(land(lon,lat))dots.push(ll(lon,lat));}}
const HUB=ll(72.9,19.1); // Mumbai
const CITIES=[ll(-0.1,51.5),ll(55.3,25.3),ll(103.8,1.3),ll(-74,40.7),ll(151,-33.9),ll(3.4,6.5),ll(139.7,35.7)];
const vec=(p,r=1)=>[Math.cos(p.lat)*Math.sin(p.lon)*r,Math.sin(p.lat)*r,Math.cos(p.lat)*Math.cos(p.lon)*r];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const arcs=CITIES.map((c,i)=>{const a=vec(HUB),b=vec(c),om=Math.acos(Math.max(-1,Math.min(1,dot(a,b))));return{a,b,om,off:i*.37,h:.1+.22*om/Math.PI};});
let size=400,dpr=1,lam=0,tilt=.38,running=true,paused=false,visible=true,last=0,mx=0,my=0;
function resize(){const r=host.getBoundingClientRect();size=Math.max(200,Math.round(r.width));dpr=Math.min(2,devicePixelRatio||1);canvas.width=canvas.height=Math.round(size*dpr);canvas.style.width=canvas.style.height=size+'px';}
new ResizeObserver(()=>{resize();draw(0);}).observe(host);resize();
// rotate a unit-ish vector: spin about the vertical axis (lam), then tilt the north pole toward the viewer
function rot(v){const c=Math.cos(lam),s=Math.sin(lam),x=v[0]*c-v[2]*s,z=v[0]*s+v[2]*c,y=v[1],ct=Math.cos(tilt+my*.15),st=Math.sin(tilt+my*.15);return[x,y*ct-z*st,y*st+z*ct];}
function draw(t){
 const W=size,R=W*.38,cx=W/2,cy=W/2;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,W);
 // atmosphere
 let g=ctx.createRadialGradient(cx,cy,R*.92,cx,cy,R*1.32);g.addColorStop(0,'rgba(182,244,163,.28)');g.addColorStop(1,'rgba(182,244,163,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.32,0,7);ctx.fill();
 // ocean sphere
 g=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);g.addColorStop(0,'#1d5a45');g.addColorStop(.6,'#0b2b22');g.addColorStop(1,'#061611');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
 ctx.strokeStyle='rgba(182,244,163,.5)';ctx.lineWidth=1.4;ctx.stroke();
 // graticule
 ctx.lineWidth=.7;ctx.strokeStyle='rgba(182,244,163,.10)';
 for(let la=-60;la<=60;la+=30){ctx.beginPath();let pen=false;for(let lo=-180;lo<=180;lo+=6){const p=rot(vec(ll(lo,la)));if(p[2]>0){const x=cx+p[0]*R,y=cy-p[1]*R;pen?ctx.lineTo(x,y):ctx.moveTo(x,y);pen=true;}else pen=false;}ctx.stroke();}
 for(let lo=-180;lo<180;lo+=30){ctx.beginPath();let pen=false;for(let la=-84;la<=84;la+=6){const p=rot(vec(ll(lo,la)));if(p[2]>0){const x=cx+p[0]*R,y=cy-p[1]*R;pen?ctx.lineTo(x,y):ctx.moveTo(x,y);pen=true;}else pen=false;}ctx.stroke();}
 // land dots
 const r0=Math.max(1.1,W*.0036);
 for(const d of dots){const p=rot(vec(d));if(p[2]<=0)continue;ctx.fillStyle=`rgba(182,244,163,${(.25+.75*p[2]).toFixed(2)})`;ctx.fillRect(cx+p[0]*R-r0/2,cy-p[1]*R-r0/2,r0,r0);}
 // arcs from India
 for(const A of arcs){
  const pts=[];for(let k=0;k<=40;k++){const u=k/40,w1=Math.sin((1-u)*A.om)/Math.sin(A.om),w2=Math.sin(u*A.om)/Math.sin(A.om),h=1+A.h*Math.sin(Math.PI*u);
   const v=[(A.a[0]*w1+A.b[0]*w2)*h,(A.a[1]*w1+A.b[1]*w2)*h,(A.a[2]*w1+A.b[2]*w2)*h];const p=rot(v);pts.push({x:cx+p[0]*R,y:cy-p[1]*R,z:p[2],raw:rot([v[0]/h,v[1]/h,v[2]/h])[2]});}
  ctx.lineWidth=1;ctx.strokeStyle='rgba(182,244,163,.14)';ctx.beginPath();let pen=false;pts.forEach(q=>{if(q.raw>.02){pen?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);pen=true;}else pen=false;});ctx.stroke();
  const head=((t*.00045+A.off)%1.5),hu=Math.min(1,head),tu=Math.max(0,head-.4);
  ctx.lineWidth=2.2;
  for(let k=Math.floor(tu*40);k<Math.floor(hu*40);k++){const q=pts[k],q2=pts[k+1];if(q.raw<=.02||q2.raw<=.02)continue;const a=(k/40-tu)/Math.max(.01,hu-tu);ctx.strokeStyle=`rgba(234,255,226,${(.9*a).toFixed(2)})`;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q2.x,q2.y);ctx.stroke();}
  if(head<1.05){const q=pts[Math.min(40,Math.round(hu*40))];if(q&&q.raw>.02){ctx.fillStyle='#eaffe2';ctx.shadowColor='#b6f4a3';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(q.x,q.y,2.6,0,7);ctx.fill();ctx.shadowBlur=0;}}
 }
 // city markers
 const mark=(p,big)=>{const q=rot(vec(p));if(q[2]<=.02)return;const x=cx+q[0]*R,y=cy-q[1]*R;ctx.fillStyle='#eaffe2';ctx.shadowColor='#b6f4a3';ctx.shadowBlur=big?16:8;ctx.beginPath();ctx.arc(x,y,big?4.6:2.6,0,7);ctx.fill();ctx.shadowBlur=0;
  if(big){const k=((t*.0008)%1);ctx.strokeStyle=`rgba(182,244,163,${(.7*(1-k)).toFixed(2)})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,5+k*26,0,7);ctx.stroke();}};
 CITIES.forEach(c=>mark(c,false));mark(HUB,true);
 // soft highlight
 g=ctx.createRadialGradient(cx-R*.45,cy-R*.5,R*.05,cx-R*.45,cy-R*.5,R*.9);g.addColorStop(0,'rgba(255,255,255,.10)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
}
function loop(now){
 if(!running)return;
 const dt=Math.min(.05,(now-last)/1000||0);last=now;
 if(!paused&&!reduced.matches)lam-=dt*.14;
 draw(paused||reduced.matches?0:now);
 if(visible&&!document.hidden&&!reduced.matches&&!paused)requestAnimationFrame(loop);else running=false;
}
function wake(){if(running)return;running=true;last=performance.now();requestAnimationFrame(loop);}
new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)wake();}).observe(host);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});
document.addEventListener('itcraft:motion',e=>{paused=!!e.detail?.paused;wake();});
addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5);my=((e.clientY-r.top)/r.height-.5);},{passive:true});
lam=HUB.lon-.12;draw(0);running=false;if(!reduced.matches)wake();
})();
