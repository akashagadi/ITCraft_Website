import * as THREE from './vendor/three.module.min.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

// Analytic curves: no pixel contours, raster tracing, or enlarged logo textures.
function shieldShape(){const s=new THREE.Shape();s.moveTo(0,1.85);s.bezierCurveTo(.4,1.5,1.05,1.25,1.48,1.22);s.bezierCurveTo(1.5,-.45,.95,-1.2,0,-1.87);s.bezierCurveTo(-.95,-1.2,-1.5,-.45,-1.48,1.22);s.bezierCurveTo(-1.05,1.25,-.4,1.5,0,1.85);return s;}
function extrude(shape,depth=.12,bevel=.04){return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:5,bevelSize:bevel,bevelThickness:bevel,curveSegments:48,steps:1});}
function add(parent,geometry,material,position=[0,0,0]){const m=new THREE.Mesh(geometry,material);m.position.set(...position);parent.add(m);return m;}
function materials(){return {
 chrome:new THREE.MeshPhysicalMaterial({color:0xb9d5dd,metalness:1,roughness:.2,clearcoat:1}),
 blue:new THREE.MeshPhysicalMaterial({color:0x135eac,metalness:.63,roughness:.22,clearcoat:1,clearcoatRoughness:.12}),
 face:new THREE.MeshPhysicalMaterial({color:0x08283c,metalness:.45,roughness:.24,clearcoat:1,clearcoatRoughness:.12}),
 green:new THREE.MeshPhysicalMaterial({color:0x7fef9b,metalness:.35,roughness:.24,clearcoat:1,emissive:0x194e2a,emissiveIntensity:.4})
};}
export function buildShield(){
 const g=new THREE.Group(),m=materials();
 add(g,extrude(shieldShape(),.24,.045),m.chrome,[0,0,-.13]);
 const bezel=add(g,extrude(shieldShape(),.16,.04),m.blue,[0,0,.05]);bezel.scale.set(.956,.956,1);
 const face=add(g,extrude(shieldShape(),.065,.025),m.face,[0,0,.215]);face.scale.set(.887,.887,1);
 const mark=new THREE.Group();mark.position.set(0,0,.36);g.add(mark);
 // The ITCraft circuit motif, rebuilt as clean rounded strokes and circular rings.
 const lines=[[-1.08,-.89,1.14,1.05],[-.97,-.25,.14,.72],[-.05,-.4,.91,.42]];
 for(const [x1,y1,x2,y2] of lines){const a=new THREE.Vector3(x1,y1,0),b=new THREE.Vector3(x2,y2,0);const length=a.distanceTo(b);const bar=add(mark,new RoundedBoxGeometry(length,.058,.056,4,.025),m.blue,[(x1+x2)/2,(y1+y2)/2,0]);bar.rotation.z=Math.atan2(y2-y1,x2-x1);}
 for(const [x,y] of [[-1.08,-.89],[1.14,1.05],[-.97,-.25],[.14,.72],[-.05,-.4],[-.57,.65]]){
  const ring=new THREE.Shape();ring.absarc(0,0,.115,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,.06,0,Math.PI*2,true);ring.holes.push(hole);add(mark,extrude(ring,.035,.008),m.green,[x,y,.015]);
 }
 // A restrained metal signature at the lower tip.
 const inset=add(g,new RoundedBoxGeometry(.44,.025,.012,2,.009),m.green,[0,-1.36,.31]);
 return g;
}
function linkShape(w=1.7,h=2.8,r=.6,thickness=.36){
 const round=(Shape,w,h,r)=>{const s=new Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;};
 const shape=round(THREE.Shape,w,h,r);shape.holes.push(round(THREE.Path,w-thickness*2,h-thickness*2,r-thickness*.6));return shape;
}
export function buildEditorial(kind){
 const g=new THREE.Group(),m=materials();
 if(kind==='partners'){
  const geo=extrude(linkShape(2.05,3.12,.77,.34),.37,.09);
  const left=add(g,geo,m.chrome,[-.73,.35,-.22]);left.rotation.set(.15,-.5,-.47);
  const right=add(g,geo,m.green,[.76,-.35,.25]);right.rotation.set(-.2,.72,-.47);
  const inner=add(g,extrude(linkShape(2.05,3.12,.77,.34),.025,.024),m.blue,[-.73,.35,.19]);inner.rotation.copy(left.rotation);inner.scale.set(.96,.96,1);
 }else{
  const outline=shieldShape();
  for(let i=3;i>=1;i--){const layer=add(g,extrude(outline,.08,.035),i===2?m.green:m.chrome,[i*.36,i*.2,-i*.38]);layer.scale.setScalar(1-i*.015);}
  const front=buildShield();front.position.set(-.4,-.2,.12);g.add(front);
 }
 return g;
}
export function buildConnectedCore(){
 const g=new THREE.Group(),m=materials();
 const light=new THREE.MeshPhysicalMaterial({color:0x9affdf,metalness:.38,roughness:.12,clearcoat:1,emissive:0x38dca5,emissiveIntensity:.8});
 const core=add(g,new THREE.IcosahedronGeometry(.77,1),m.chrome);core.rotation.set(.3,.2,.3);
 const inner=add(g,new THREE.OctahedronGeometry(.5),light);inner.scale.setScalar(1.7);inner.rotation.set(.3,.5,.1);
 const rings=[];
 for(let i=0;i<3;i++){
  const ring=new THREE.Group();g.add(ring);rings.push(ring);
  ring.rotation.set([.7,1.2,.2][i],[.3,-.7,1.1][i],[.2,1.1,-.6][i]);
  const radius=1.3+i*.31;
  add(ring,new THREE.TorusGeometry(radius,.115,12,100,Math.PI*1.72),i===1?m.blue:m.chrome);
  add(ring,new THREE.TorusGeometry(radius,.028,8,100,Math.PI*1.72),light,[0,0,.112]);
  const end=Math.PI*1.72;
  add(ring,new THREE.SphereGeometry(.12,16,12),light,[Math.cos(end)*radius,Math.sin(end)*radius,0]);
 }
 g.userData.rings=rings;g.userData.core=core;
 return g;
}
export function initBrandScene(host,kind='shield'){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');if(reduced.matches)return null;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.domElement.className='brand-webgl';renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,.1,8.9);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04,.1,100,{size:128});scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xc4ffe5,0x061a2c,1.4));const key=new THREE.DirectionalLight(0xe3f2ff,3.4);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.DirectionalLight(0x79eeb1,2.3);rim.position.set(4,1,-1);scene.add(rim);
 const world=kind==='shield'?buildConnectedCore():buildEditorial(kind);scene.add(world);
 // Grounding without a dynamic shadow-map pass.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const c=shadowCanvas.getContext('2d');const gradient=c.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,128,128);const shadow=add(scene,new THREE.PlaneGeometry(5.5,2.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),[0,-2.35,0]);shadow.rotation.x=-Math.PI/2;
 let visible=false,raf=0,last=0,time=0,paused=false,px=0,py=0,sx=0,sy=0,scrollAim=0,scrollSmooth=0,disposed=false,frameInterval=1000/60,samples=0,slow=0;
 let bounds=host.getBoundingClientRect();
 function measure(){bounds=host.getBoundingClientRect();scrollAim=Math.max(-1,Math.min(1,(innerHeight*.5-bounds.top-bounds.height*.5)/innerHeight));}
 function resize(){measure();renderer.setSize(bounds.width,bounds.height,false);camera.aspect=bounds.width/bounds.height;camera.position.z=camera.aspect<.85?10.5:8.9;camera.updateProjectionMatrix();wake();}
 const ro=new ResizeObserver(resize);ro.observe(host);const io=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible){measure();wake();}else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'40px'});io.observe(host);
 function wake(){if(!raf&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(render);}
 function render(t){raf=0;if(disposed||!visible||document.hidden)return;if(last&&t-last<frameInterval-1){wake();return;}const dt=Math.min((t-last||16)/1000,.05);last=t;const moving=!paused&&!reduced.matches;
  if(moving){time+=dt;const ease=1-Math.exp(-dt*3.4);sx+=(px-sx)*ease;sy+=(py-sy)*ease;scrollSmooth+=(scrollAim-scrollSmooth)*ease;
   world.rotation.y=-.22+Math.sin(time*.22)*.07+sx*.24+scrollSmooth*.2;world.rotation.x=.08+sy*.1+scrollSmooth*.06;world.rotation.z=kind==='partners'?.06:-.06;world.position.y=Math.sin(time*.6)*.07;
   if(kind==='shield'){world.userData.core.rotation.y=time*.18;world.userData.rings.forEach((ring,i)=>{ring.rotation.z=[.2,1.1,-.6][i]+time*(i===1?-.075:.055);});}
  }
  const start=performance.now();renderer.render(scene,camera);if(samples<120){samples++;if(performance.now()-start>24)slow++;if(samples===120&&slow>35)frameInterval=1000/30;}
  host.classList.add('brand-ready');if(moving)wake();
 }
 host.addEventListener('pointermove',e=>{px=(e.clientX-bounds.left)/bounds.width-.5;py=(e.clientY-bounds.top)/bounds.height-.5;});host.addEventListener('pointerleave',()=>{px=py=0;});addEventListener('scroll',()=>{if(visible)measure();},{passive:true});
 const button=host.querySelector('.brand-motion');button?.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';button.setAttribute('aria-pressed',paused);wake();});
 document.addEventListener('itcraft:motion',e=>{if(kind==='shield'){paused=!!e.detail?.paused;wake();}});document.addEventListener('visibilitychange',()=>{last=0;wake();});addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;});addEventListener('pageshow',wake);reduced.addEventListener('change',wake);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('brand-ready');cancelAnimationFrame(raf);raf=0;});renderer.domElement.addEventListener('webglcontextrestored',wake);
 return {renderer,dispose(){disposed=true;ro.disconnect();io.disconnect();cancelAnimationFrame(raf);scene.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});environment.dispose();renderer.dispose();}};
}
