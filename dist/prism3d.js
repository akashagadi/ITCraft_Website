// PrismSuite hero: a scan beam hits a desktop computer, whose screen reports the five things PrismSuite checks.
// Hover (or tap) a node to follow its ray; drag to turn the desktop. No external models or textures.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const PARAMS=[
 {name:'Security risks',desc:'Threats and weak spots, found before attackers find them.',color:0xff5d5d,css:'#ff5d5d'},
 {name:'Performance',desc:'Where systems slow down and what is holding them back.',color:0xffd23f,css:'#ffd23f'},
 {name:'IT health',desc:'How every device and system is really doing.',color:0x6bf178,css:'#6bf178'},
 {name:'High availability',desc:'Whether your IT stays up when your business needs it.',color:0x4dd9ff,css:'#4dd9ff'},
 {name:'Gap analysis',desc:'What is missing compared with where you should be.',color:0xa78bfa,css:'#a78bfa'}
];

export async function initPrismScene(host,state){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const phone=matchMedia('(max-width: 600px)').matches;
 const canvas=document.createElement('canvas');canvas.className='product-webgl';canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(32,1,.1,60);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04,.1,100,{size:128}).texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe8fff2,0x10261c,1.2));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,6);scene.add(key);

 // ---- helpers ----
 const radial=(inner='rgba(255,255,255,1)',outer='rgba(255,255,255,0)')=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,inner);r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
 const glowTex=radial();
 const sprite=(color,scale,opacity=1)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));s.scale.set(scale,scale,1);s.renderOrder=4;return s;};
 const beamMats=[];
 function beam(from,to,width,color,k=1,flow=1){
  const len=from.distanceTo(to);
  const mat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,
   uniforms:{c:{value:new THREE.Color(color)},k:{value:k},t:{value:0},flow:{value:flow}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'varying vec2 vUv;uniform vec3 c;uniform float k,t,flow;void main(){float a=pow(max(1.-abs(vUv.y-.5)*2.,0.),2.2);float core=pow(max(1.-abs(vUv.y-.5)*7.,0.),2.);float e=smoothstep(0.,.08,vUv.x)*smoothstep(1.,.92,vUv.x);float p=.8+.2*sin(vUv.x*24.-t*4.*flow);gl_FragColor=vec4(mix(c,vec3(1.),core*.7),(a*.65+core)*k*p*e);}'});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);m.scale.set(len,width,1);
  m.position.copy(from).add(to).multiplyScalar(.5);m.rotation.z=Math.atan2(to.y-from.y,to.x-from.x);m.renderOrder=3;m.userData.base=width;beamMats.push(mat);return m;
 }

 // ---- backdrop: dark plane with a faint grid, so the glass has something to refract ----
 const gc=document.createElement('canvas');gc.width=gc.height=256;{const g=gc.getContext('2d');g.fillStyle='#07150f';g.fillRect(0,0,256,256);g.strokeStyle='rgba(182,244,163,.16)';g.lineWidth=2;g.strokeRect(0,0,256,256);}
 const gridTex=new THREE.CanvasTexture(gc);gridTex.wrapS=gridTex.wrapT=THREE.RepeatWrapping;gridTex.repeat.set(34,20);gridTex.colorSpace=THREE.SRGBColorSpace;gridTex.anisotropy=4;
 const back=new THREE.Mesh(new THREE.PlaneGeometry(34,20),new THREE.MeshBasicMaterial({map:gridTex}));back.position.z=-3.2;scene.add(back);
 const halo=sprite(0x8be8b4,9,.34);halo.position.set(0,.1,-2.2);scene.add(halo);

 // ---- the desktop computer ----
 const prism=new THREE.Group();prism.position.set(-1,.1,0);prism.scale.setScalar(1.2);scene.add(prism);
 const rb=(x,y,z,r=.05)=>new RoundedBoxGeometry(x,y,z,3,r);
 const metal=new THREE.MeshStandardMaterial({color:0xb4c4be,metalness:.9,roughness:.28,envMapIntensity:1.6});
 const shell=new THREE.MeshStandardMaterial({color:0x0e1d18,metalness:.65,roughness:.32,envMapIntensity:1.3});
 const part=(g,m,pos)=>{const o=new THREE.Mesh(g,m);o.position.set(...pos);prism.add(o);return o;};
 part(rb(3.3,2.1,.16,.09),shell,[0,.55,0]);                       // monitor body
 const sc=document.createElement('canvas');sc.width=640;sc.height=400;const sg=sc.getContext('2d');
 const screenTex=new THREE.CanvasTexture(sc);screenTex.colorSpace=THREE.SRGBColorSpace;screenTex.anisotropy=4;
 part(new THREE.PlaneGeometry(3.0,1.875),new THREE.MeshBasicMaterial({map:screenTex,toneMapped:false}),[0,.55,.085]); // screen
 part(rb(.26,.8,.12,.04),metal,[0,-.78,-.05]);                    // neck
 part(rb(1.4,.07,.8,.03),metal,[0,-1.2,.02]);                      // stand foot
 part(rb(2.5,.08,.82,.04),shell,[0,-1.28,1.05]);                   // keyboard
 {const kc=document.createElement('canvas');kc.width=320;kc.height=104;const k=kc.getContext('2d');k.fillStyle='#0b1813';k.fillRect(0,0,320,104);
  for(let r=0;r<4;r++)for(let c=0;c<(r===3?9:13);c++){k.fillStyle=(r+c)%7===0?'#1f4d3a':'#16302a';const w=r===3?(c===4?100:24):19;const x=10+c*(r===3?(c<4?30:30):23)+(r===3&&c>4?76:0);k.fillRect(x,12+r*22,w,16);}
  const kt=new THREE.CanvasTexture(kc);kt.colorSpace=THREE.SRGBColorSpace;const top=part(new THREE.PlaneGeometry(2.4,.78),new THREE.MeshBasicMaterial({map:kt}),[0,-1.236,1.05]);top.rotation.x=-Math.PI/2;}
 part(rb(.3,.1,.5,.05),shell,[1.7,-1.27,1.05]);                    // mouse
 const base=sprite(0xb6f4a3,5.4,.22);base.position.set(0,-1.45,.4);prism.add(base);
 const screenGlow=sprite(0xb6f4a3,5.2,.2);screenGlow.position.set(0,.55,-.4);prism.add(screenGlow);
 const rowFill=[.74,.58,.88,.66,.5];
 const rr=(x,y,w,h,r)=>{sg.beginPath();if(sg.roundRect)sg.roundRect(x,y,w,h,r);else sg.rect(x,y,w,h);};
 function drawScreen(t,cur){
  sg.fillStyle='#07140f';sg.fillRect(0,0,640,400);
  sg.fillStyle='#0d241b';sg.fillRect(0,0,640,40);
  ['#ff5d5d','#ffd23f','#6bf178'].forEach((c,i)=>{sg.fillStyle=c;sg.beginPath();sg.arc(24+i*22,20,6,0,7);sg.fill();});
  sg.fillStyle='rgba(182,244,163,.25)';rr(120,16,220,8,4);sg.fill();
  const scan=(t*.33)%1.3,prog=Math.min(1,scan);
  sg.lineCap='round';sg.lineWidth=16;sg.strokeStyle='#14382a';sg.beginPath();sg.arc(150,225,88,0,7);sg.stroke();
  sg.strokeStyle='#b6f4a3';sg.beginPath();sg.arc(150,225,88,-Math.PI/2,-Math.PI/2+prog*Math.PI*2);sg.stroke();
  sg.fillStyle='rgba(182,244,163,'+(.2+.12*Math.sin(t*3)).toFixed(2)+')';sg.beginPath();sg.arc(150,225,50+4*Math.sin(t*3),0,7);sg.fill();
  sg.strokeStyle='#eaffe2';sg.lineWidth=9;sg.beginPath();sg.moveTo(126,226);sg.lineTo(144,244);sg.lineTo(176,206);sg.stroke();
  PARAMS.forEach((p,k)=>{const y=82+k*60,on=cur===k,f=Math.min(1,Math.max(0,(scan-k*.12)*1.6))*rowFill[k];
   sg.globalAlpha=on?1:.8;sg.fillStyle=p.css;sg.beginPath();sg.arc(322,y+16,on?11:8,0,7);sg.fill();
   sg.globalAlpha=1;sg.fillStyle='#10281e';rr(348,y+6,252,22,11);sg.fill();
   sg.globalAlpha=on?1:.6;sg.fillStyle=p.css;if(f>.02){rr(348,y+6,252*f,22,11);sg.fill();}sg.globalAlpha=1;
   if(on){sg.strokeStyle=p.css;sg.lineWidth=3;rr(343,y+1,262,32,16);sg.stroke();}});
  const sy=40+((t*.5)%1)*360,gr=sg.createLinearGradient(0,sy-34,0,sy+8);gr.addColorStop(0,'rgba(182,244,163,0)');gr.addColorStop(1,'rgba(182,244,163,.22)');sg.fillStyle=gr;sg.fillRect(0,sy-34,640,42);
  screenTex.needsUpdate=true;
 }
 drawScreen(0,-1);

 // ---- light: one white beam in, five coloured rays out ----
 const light=new THREE.Group();scene.add(light);
 const S=new THREE.Vector3(-4.9,-.45,0),H=new THREE.Vector3(-3.04,.76,0),E=new THREE.Vector3(1.04,.76,0);
 light.add(beam(S,H,.2,0xffffff,1.1,.8));
 const emitter=sprite(0xffffff,1.1,.9);emitter.position.copy(S);light.add(emitter);
 const portIn=sprite(0xffffff,.9,.9);portIn.position.copy(H);light.add(portIn);const portOut=sprite(0xb6f4a3,.9,.8);portOut.position.copy(E);light.add(portOut);
 const ys=[2.5,1.35,.2,-.95,-2.1].map(y=>y+.2),TX=3.65;
 const rays=[],orbs=[],hits=[],pts=[];
 PARAMS.forEach((p,k)=>{
  const T=new THREE.Vector3(TX,ys[k],0);
  const ray=beam(E,T,.17,p.color,1,1);light.add(ray);
  const orb=new THREE.Group();orb.position.copy(T);light.add(orb);
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(.2,24,16),new THREE.MeshBasicMaterial({color:p.color,depthTest:false})));
  const g=sprite(p.color,1.5,.9);orb.add(g);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.33,48),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.6,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));ring.renderOrder=4;orb.add(ring);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(.6,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.userData.k=k;orb.add(hit);hits.push(hit);
  // particles travelling along the ray
  const N=16,pos=new Float32Array(N*3),pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pm=new THREE.PointsMaterial({color:p.color,size:.11,map:glowTex,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,sizeAttenuation:true});
  const points=new THREE.Points(pg,pm);points.renderOrder=4;points.frustumCulled=false;light.add(points);
  rays.push({ray,orb,g,ring,T,points,pos,N,k:1,w:.17,s:1});
 });
 // slow dashed ring that frames the prism
 const circ=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;circ.push(new THREE.Vector3(Math.cos(a)*3.5,Math.sin(a)*3.5,-.4));}
 const ringLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(circ),new THREE.LineDashedMaterial({color:0xb6f4a3,dashSize:.14,gapSize:.24,transparent:true,opacity:.35}));ringLine.computeLineDistances();ringLine.position.set(-1,.3,0);scene.add(ringLine);
 // floating dust for depth
 const DN=70,dpos=new Float32Array(DN*3),dseed=[];for(let i=0;i<DN;i++){dpos[i*3]=(Math.random()-.5)*12;dpos[i*3+1]=(Math.random()-.5)*7;dpos[i*3+2]=-1+Math.random()*-1.8;dseed.push(Math.random()*6.28);}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
 const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0xcfffe0,size:.05,map:glowTex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(dust);

 // ---- overlay: node labels and caption ----
 const ui=document.createElement('div');ui.className='prism-ui';host.append(ui);
 const badge=document.createElement('img');badge.className='prism-badge';badge.src='assets/prism.webp';badge.alt='PrismSuite';ui.append(badge);
 const labels=PARAMS.map((p,k)=>{const b=document.createElement('button');b.type='button';b.className='prism-label';b.style.setProperty('--c',p.css);b.innerHTML='<i></i><span></span>';b.querySelector('span').textContent=p.name;b.setAttribute('aria-label',p.name+': '+p.desc);ui.append(b);return b;});
 const cap=document.createElement('div');cap.className='prism-caption';cap.setAttribute('aria-live','polite');ui.append(cap);

 // ---- interaction state ----
 let frameN=0,hover=-1,lock=-1,cycle=0,cycleAt=0,shown=-2,elapsed=0,last=0,visible=true,frameId=0,dragging=false,lastX=0,drag=0,hx=0,hy=0,rotX=0,rotY=0;
 const current=()=>hover>=0?hover:lock>=0?lock:cycle;
 const setHover=k=>{if(hover!==k){hover=k;wake();}};
 labels.forEach((b,k)=>{b.addEventListener('pointerenter',()=>setHover(k));b.addEventListener('pointerleave',()=>setHover(-1));b.addEventListener('focus',()=>setHover(k));b.addEventListener('blur',()=>setHover(-1));b.addEventListener('click',()=>{lock=lock===k?-1:k;wake();});});
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 host.addEventListener('pointermove',e=>{
  const r=host.getBoundingClientRect();
  if(dragging){drag=Math.max(-.9,Math.min(.9,drag+(e.clientX-lastX)*.006));lastX=e.clientX;}
  else if(e.pointerType!=='touch'){hx=(e.clientX-r.left)/r.width-.5;hy=(e.clientY-r.top)/r.height-.5;}
  if(e.pointerType!=='touch'&&!e.target.closest('button')){ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);const h=ray.intersectObjects(hits)[0];setHover(h?h.object.userData.k:-1);host.style.cursor=h?'pointer':'';}
  wake();
 });
 host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button'))return;dragging=true;lastX=e.clientX;host.classList.add('dragging');try{host.setPointerCapture(e.pointerId);}catch(_){}wake();});
 const release=()=>{dragging=false;host.classList.remove('dragging');};
 host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('pointerleave',()=>{hx=hy=0;setHover(-1);});

 function fit(){
  const r=host.getBoundingClientRect(),aspect=Math.max(.5,r.width/Math.max(1,r.height));
  renderer.setSize(r.width,r.height,false);camera.aspect=aspect;
  const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),zW=6.0/(t*aspect),zH=4.0/t;
  const cx=r.width<560?1.35:.95;camera.position.set(cx,0,Math.max(zW,zH,9));camera.lookAt(cx,0,0);camera.updateProjectionMatrix();
  host.classList.toggle('prism-narrow',r.width<560);wake();
 }
 new ResizeObserver(fit).observe(host);fit();
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)wake();},{rootMargin:'60px'}).observe(host);
 document.addEventListener('visibilitychange',()=>{last=0;wake();});
 document.addEventListener('itcraft:motion',wake);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('webgl-ready');cancelAnimationFrame(frameId);frameId=0;});
 canvas.addEventListener('webglcontextrestored',wake);

 const v=new THREE.Vector3();
 function frame(t){
  try{frameInner(t);}catch(e){console.error('prism frame',e);window.__prismErr=String(e&&e.stack||e);}
 }
 function frameInner(t){
  frameId=0;if(!visible||document.hidden)return;
  const dt=Math.min((t-last)/1000||.016,.06);last=t;
  const moving=!state.paused&&!reduced.matches;
  if(moving)elapsed+=dt;
  // auto-tour the five nodes when nobody is pointing at anything
  if(hover<0&&lock<0&&moving&&elapsed-cycleAt>3){cycleAt=elapsed;cycle=(cycle+1)%5;}
  const cur=current(),ease=1-Math.exp(-dt*6);
  rotY+=((moving?Math.sin(elapsed*.5)*.22:0)+hx*.45+drag-rotY)*ease;rotX+=(.2+hy*.2-rotX)*ease;
  prism.rotation.set(rotX,rotY,0);ringLine.rotation.z=moving?elapsed*.12:ringLine.rotation.z;
  beamMats.forEach(m=>{m.uniforms.t.value=elapsed;});
  rays.forEach((o,k)=>{
   const on=cur===k,any=cur>=0;
   o.k+=((any?(on?2:.28):1)-o.k)*ease;o.w+=((on?.34:.17)-o.w)*ease;o.s+=((on?1.55:1)-o.s)*ease;
   o.ray.material.uniforms.k.value=o.k;o.ray.scale.y=o.w;o.orb.scale.setScalar(o.s);
   const p=((elapsed*.85+k*.21)%1);o.ring.scale.setScalar(1+p*1.5);o.ring.material.opacity=(1-p)*(on?.9:.35);o.g.material.opacity=on?1:(any?.4:.85);
   o.points.material.opacity=on?1:(any?.18:.8);
   for(let i=0;i<o.N;i++){const u=((i/o.N)+elapsed*.2+k*.13)%1;o.pos[i*3]=E.x+(o.T.x-E.x)*u;o.pos[i*3+1]=E.y+(o.T.y-E.y)*u;o.pos[i*3+2]=0;}
   o.points.geometry.attributes.position.needsUpdate=true;
  });
  for(let i=0;i<DN;i++){dpos[i*3+1]+=moving?Math.sin(elapsed*.4+dseed[i])*.0009:0;dpos[i*3]+=moving?.0016:0;if(dpos[i*3]>6)dpos[i*3]=-6;}dg.attributes.position.needsUpdate=true;
  halo.material.opacity=.3+(moving?Math.sin(elapsed*1.2)*.05:0);
  // labels follow their nodes on screen
  const W=renderer.domElement.clientWidth,Hh=renderer.domElement.clientHeight;
  labels.forEach((b,k)=>{v.copy(rays[k].T);v.x+=.42;v.project(camera);b.style.transform=`translate(${((v.x*.5+.5)*W).toFixed(1)}px,${((-v.y*.5+.5)*Hh).toFixed(1)}px) translateY(-50%)`;b.classList.toggle('on',cur===k);b.classList.toggle('dim',cur>=0&&cur!==k);});
  if(shown!==cur){shown=cur;const p=PARAMS[cur];cap.style.setProperty('--c',p.css);cap.innerHTML='<b></b><span></span>';cap.firstChild.textContent=p.name;cap.lastChild.textContent=p.desc;}
  if(((frameN++)&1)===0)drawScreen(elapsed,cur);
  renderer.render(scene,camera);
  if(!host.classList.contains('webgl-ready'))host.classList.add('webgl-ready');
  if(moving||dragging||Math.abs(rotY)>.001)wake();
 }
 function wake(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(frame);}
 wake();
 return {reset(){drag=hx=hy=0;lock=-1;hover=-1;wake();},renderer};
}
