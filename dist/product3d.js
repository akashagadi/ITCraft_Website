// Product hero scenes (ProjectOne, AegisOne, PhoenixODR, Sovereign Cloud).
// Same idea as the PrismSuite scene: a themed 3D object on the left, six glowing nodes on the right (one per feature).
// Hover or tap a node to follow its ray; drag to turn the object. Procedural geometry only, no model downloads.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const COLORS=[[0x6bf178,'#6bf178'],[0x4dd9ff,'#4dd9ff'],[0xffd23f,'#ffd23f'],[0xff8bd0,'#ff8bd0'],[0xa78bfa,'#a78bfa'],[0xff9f43,'#ff9f43']];
const node=(name,title,desc,i)=>({name,title,desc,color:COLORS[i][0],css:COLORS[i][1]});
const DATA={
 project:{logo:'assets/project.webp',alt:'ProjectOne',nodes:[
  node('Design','Design & modernisation','Plan infrastructure around business requirements, resilience and future growth.',0),
  node('Deployment','Deployment & configuration','Use consistent configurations and repeatable deployment practices.',1),
  node('Hardening','Security hardening','Address identified weaknesses and improve the security of deployed systems.',2),
  node('Integration','System integration','Connect new and existing technology into a cohesive working environment.',3),
  node('Hybrid & cloud','On-premise, cloud & hybrid','Coordinate implementation across the environments your organisation uses.',4),
  node('Optimisation','Performance optimisation','Tune the environment for reliability, efficiency and day-to-day productivity.',5)]},
 aegis:{logo:'assets/aegis.webp',alt:'AegisOne',nodes:[
  node('SOC','Security Operations Centre','24/7 monitoring, threat detection and response supported by security analysts.',0),
  node('NOC','Network Operations Centre','Monitor infrastructure health and identify performance or availability issues.',1),
  node('Smart alerts','Monitoring & intelligent alerts','Surface meaningful events and prioritise issues across your environment.',2),
  node('SIEM & SOAR','SIEM & SOAR','Correlate security events and support incident response through automated playbooks.',3),
  node('Assets & patches','Asset & patch management','Maintain visibility over devices and coordinate timely updates.',4),
  node('Privileged access','Privileged access control','Govern privileged access and maintain audit trails and access accountability.',5)]},
 phoenix:{logo:'assets/phoenix.webp',alt:'PhoenixODR',nodes:[
  node('Backups','Automated backups','Schedule and manage backups with versioning and appropriate protection.',0),
  node('Recovery plan','Disaster recovery planning','Document recovery priorities, responsibilities and step-by-step procedures.',1),
  node('Failover','Failover infrastructure','Plan standby systems and failover processes for critical workloads.',2),
  node('Restoration','Data restoration','Use verified recovery points and structured restoration workflows.',3),
  node('Continuity','Business continuity','Plan communication, stakeholder updates and operational workarounds.',4),
  node('Improvement','Recovery improvement','Review incidents and tests to strengthen future recovery readiness.',5)]},
 cloud:{logo:'assets/cloud.webp',alt:'Sovereign Cloud',nodes:[
  node('Secure','Secure infrastructure','Build on a protected environment with access controls and security practices.',0),
  node('Flexible','Flexible deployment','Choose an environment that fits your workload and operational needs.',1),
  node('Scalable','Scalable capacity','Adapt infrastructure as demand and the business grow.',2),
  node('Data control','Data control','Discuss data location, access and governance requirements as part of the design.',3),
  node('Clear pricing','Transparent pricing','Define your services and costs clearly before committing.',4),
  node('Support','Dedicated support','Work with a team that understands your environment and supports ongoing operations.',5)]}
};
const KEYS=['prism','project','aegis','phoenix','cloud'];

export async function initProductHero(host,state,index){
 const key=KEYS[index],cfg=DATA[key],NODES=cfg.nodes;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas');canvas.className='product-webgl';canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(32,1,.1,60);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04,.1,100,{size:128}).texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe8fff2,0x10261c,1.2));
 const keyLight=new THREE.DirectionalLight(0xffffff,3);keyLight.position.set(-3,4,6);scene.add(keyLight);

 // ---- helpers ----
 const radial=()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;};
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
  m.position.copy(from).add(to).multiplyScalar(.5);m.rotation.z=Math.atan2(to.y-from.y,to.x-from.x);m.renderOrder=3;beamMats.push(mat);return m;
 }
 const rb=(x,y,z,r=.05)=>new RoundedBoxGeometry(x,y,z,3,r);
 const smooth=(a,b,t)=>{t=Math.min(1,Math.max(0,(t-a)/(b-a)));return t*t*(3-2*t);};

 // ---- backdrop grid so the scene has depth ----
 const gc=document.createElement('canvas');gc.width=gc.height=256;{const g=gc.getContext('2d');g.fillStyle='#07150f';g.fillRect(0,0,256,256);g.strokeStyle='rgba(182,244,163,.16)';g.lineWidth=2;g.strokeRect(0,0,256,256);}
 const gridTex=new THREE.CanvasTexture(gc);gridTex.wrapS=gridTex.wrapT=THREE.RepeatWrapping;gridTex.repeat.set(34,20);gridTex.colorSpace=THREE.SRGBColorSpace;gridTex.anisotropy=4;
 const back=new THREE.Mesh(new THREE.PlaneGeometry(34,20),new THREE.MeshBasicMaterial({map:gridTex}));back.position.z=-3.2;scene.add(back);
 const halo=sprite(0x8be8b4,9,.3);halo.position.set(-1,.1,-2.2);scene.add(halo);

 // ---- the hero object (differs per product) ----
 const hero=new THREE.Group();hero.position.set(-1,.2,0);hero.scale.setScalar(1.15);scene.add(hero);
 const metal=new THREE.MeshStandardMaterial({color:0xaebdb8,metalness:.9,roughness:.3,envMapIntensity:1.6});
 const shell=new THREE.MeshStandardMaterial({color:0x13261f,metalness:.65,roughness:.34,envMapIntensity:1.3});
 const edgeMat=c=>new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.9});
 const dyn=[];           // per-frame animators: fn(ctx)
 const grpEmph=[0,0,0];  // smoothed emphasis per feature pair (0:nodes 0-1, 1:nodes 2-3, 2:nodes 4-5)
 let anyEmph=0;

 if(key==='project'){
  // Infrastructure restructuring: a tangled estate of devices is scanned and re-organised into a clean core / distribution / access network.
  const AMB=0xffb347,RED=0xff5d4d,V=THREE.Vector3;
  const bc=document.createElement('canvas');bc.width=bc.height=256;{const g=bc.getContext('2d');g.strokeStyle='rgba(255,179,71,.55)';g.lineWidth=2;for(let i=0;i<=256;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke();}g.strokeStyle='rgba(255,179,71,.9)';g.lineWidth=3;g.strokeRect(2,2,252,252);}
  const bt=new THREE.CanvasTexture(bc);bt.colorSpace=THREE.SRGBColorSpace;
  const bp=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.9),new THREE.MeshBasicMaterial({map:bt,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}));bp.position.set(0,.2,-1.2);hero.add(bp);
  // structured layout: 1 core, 3 distribution, 8 access
  const SP=[new V(0,1.5,0)],TIER=[0],PAR=[-1];
  [-1.5,0,1.5].forEach(x=>{SP.push(new V(x,.3,0));TIER.push(1);PAR.push(0);});
  for(let i=0;i<8;i++){SP.push(new V(-1.925+i*.55,-1.1,0));TIER.push(2);PAR.push(i<3?1:i<5?2:3);}
  let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const nodes=SP.map((sp,i)=>{
   const tier=TIER[i],sz=tier===0?[.66,.48,.66]:tier===1?[.5,.36,.5]:[.32,.26,.32];
   const g=rb(sz[0],sz[1],sz[2],.06),mat=shell.clone();mat.emissive=new THREE.Color(RED);mat.emissiveIntensity=.3;
   const m=new THREE.Mesh(g,mat);const e=new THREE.LineSegments(new THREE.EdgesGeometry(g),edgeMat(AMB));m.add(e);
   if(tier<2){const led=new THREE.Mesh(new THREE.PlaneGeometry(sz[0]*.5,.05),new THREE.MeshBasicMaterial({color:AMB}));led.position.set(0,0,sz[2]/2+.003);m.add(led);}
   hero.add(m);
   return {m,mat,e,tier,sp,chaos:new V((rnd()-.5)*4.4,(rnd()-.5)*3.4+.2,(rnd()-.5)*1.7),rot:new V((rnd()-.5)*3,(rnd()-.5)*3,(rnd()-.5)*3),sc:.8+rnd()*.5,ph:rnd()*6.28};
  });
  const pairs=[];const seen=new Set();nodes.forEach((n,i)=>{[(i+3)%12,(i*5+2)%12].forEach(k=>{if(k===i)return;const key2=i<k?i+'-'+k:k+'-'+i;if(!seen.has(key2)){seen.add(key2);pairs.push([i,k]);}});});
  const tree=nodes.map((n,i)=>[PAR[i],i]).filter(x=>x[0]>=0);
  const mkLines=(list,color)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(list.length*6),3));const l=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity:.5,depthWrite:false}));l.frustumCulled=false;hero.add(l);return l;};
  const messy=mkLines(pairs,RED),clean=mkLines(tree,AMB);
  const setLines=(l,list)=>{const a=l.geometry.attributes.position.array;list.forEach(([i,k],n)=>{const p=nodes[i].m.position,q=nodes[k].m.position;a[n*6]=p.x;a[n*6+1]=p.y;a[n*6+2]=p.z;a[n*6+3]=q.x;a[n*6+4]=q.y;a[n*6+5]=q.z;});l.geometry.attributes.position.needsUpdate=true;};
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(4.4,.07),new THREE.MeshBasicMaterial({color:AMB,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false}));scan.renderOrder=4;scan.position.z=.4;hero.add(scan);
  const scanGlow=sprite(AMB,2.6,0);scanGlow.scale.set(5,1,1);scanGlow.position.z=.4;hero.add(scanGlow);
  const PN=tree.length,ppos=new Float32Array(PN*3),pgm=new THREE.BufferGeometry();pgm.setAttribute('position',new THREE.BufferAttribute(ppos,3));
  const pulses=new THREE.Points(pgm,new THREE.PointsMaterial({color:0xfff0c8,size:.14,map:glowTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));pulses.renderOrder=5;pulses.frustumCulled=false;hero.add(pulses);
  const T=9.6,col=new THREE.Color(),cR=new THREE.Color(RED),cA=new THREE.Color(AMB);
  dyn.push(({t,emph})=>{
   const ph=t%T;
   const s=smooth(1.6,4.6,ph)*(1-smooth(8.2,9.4,ph));
   nodes.forEach((n,i)=>{
    const d=n.tier*.4,f=smooth(1.6+d*.5,3.4+d*.5,ph)*(1-smooth(8.2+(2-n.tier)*.2,9.2+(2-n.tier)*.2,ph));
    n.m.position.copy(n.chaos).lerp(n.sp,f);
    const jit=(1-f)*.07;n.m.position.x+=Math.sin(t*1.6+n.ph)*jit;n.m.position.y+=Math.cos(t*1.3+n.ph)*jit;
    n.m.rotation.set(n.rot.x*(1-f),n.rot.y*(1-f),n.rot.z*(1-f));
    n.m.scale.setScalar(n.sc+(1-n.sc)*f);
    col.copy(cR).lerp(cA,f);n.mat.emissive.copy(col);
    n.mat.emissiveIntensity=.22+f*.3+(n.tier===2?emph[2]*.5:n.tier===1?emph[1]*.5:emph[0]*.5)+Math.max(0,Math.sin(t*3-n.tier*1.2))*f*.12;
    n.e.material.color.copy(col);
   });
   setLines(messy,pairs);setLines(clean,tree);
   messy.material.opacity=.06+.5*(1-s);clean.material.opacity=.12+.88*s*(.65+emph[0]*.35+emph[1]*.25);
   bp.material.opacity=.16+emph[0]*.4+s*.08;
   // scan sweep top to bottom while restructuring
   const sw=(ph-1.6)/3;if(sw>=0&&sw<=1){scan.position.y=1.9-sw*3.9;scanGlow.position.y=scan.position.y;scan.material.opacity=.85;scanGlow.material.opacity=.4;}else{scan.material.opacity=0;scanGlow.material.opacity=0;}
   pulses.material.opacity=s>.6?(s-.6)/.4:0;
   for(let i=0;i<PN;i++){const [pi,ci]=tree[i],u=((t*.45*(1+emph[2]*1.2)+i*.093)%1),a=nodes[pi].m.position,b=nodes[ci].m.position;ppos[i*3]=a.x+(b.x-a.x)*u;ppos[i*3+1]=a.y+(b.y-a.y)*u;ppos[i*3+2]=a.z+(b.z-a.z)*u;}
   pgm.attributes.position.needsUpdate=true;
  });
 }

 if(key==='aegis'){
  const s=new THREE.Shape();s.moveTo(-1.3,1.15);s.lineTo(0,1.62);s.lineTo(1.3,1.15);s.lineTo(1.22,-.1);s.quadraticCurveTo(.9,-1.1,0,-1.58);s.quadraticCurveTo(-.9,-1.1,-1.22,-.1);s.closePath();
  const sg=new THREE.ExtrudeGeometry(s,{depth:.28,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.09,bevelThickness:.09});sg.translate(0,0,-.14);
  const shieldMat=new THREE.MeshStandardMaterial({color:0x2c7a5a,metalness:.7,roughness:.25,emissive:0x6bf178,emissiveIntensity:.18,envMapIntensity:1.6});
  const shield=new THREE.Mesh(sg,shieldMat);hero.add(shield);
  shield.add(new THREE.LineSegments(new THREE.EdgesGeometry(sg,30),edgeMat(0xb6f4a3)));
  const inner=[];for(let i=0;i<=40;i++){const a=i/40;}
  const s2=new THREE.Shape();s2.moveTo(-.95,.8);s2.lineTo(0,1.15);s2.lineTo(.95,.8);s2.lineTo(.9,-.05);s2.quadraticCurveTo(.65,-.8,0,-1.15);s2.quadraticCurveTo(-.65,-.8,-.9,-.05);s2.closePath();
  const il=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(s2.getPoints(24).map(p=>new THREE.Vector3(p.x,p.y,.27))),new THREE.LineBasicMaterial({color:0xeaffe2,transparent:true,opacity:.8}));hero.add(il);
  // check mark on the shield
  const ck=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.42,.02,.3),new THREE.Vector3(-.1,-.34,.3),new THREE.Vector3(.5,.45,.3)]),new THREE.LineBasicMaterial({color:0xeaffe2}));hero.add(ck);
  const rings=[0,1].map(i=>{const r=new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.3,.02,8,96),new THREE.MeshBasicMaterial({color:i?0x4dd9ff:0xb6f4a3,transparent:true,opacity:.7}));r.rotation.set(1.1+i*.5,i*.6,0);hero.add(r);return r;});
  // radar sweep disc
  const sweepMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{a:{value:0},k:{value:.5}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'varying vec2 vUv;uniform float a,k;void main(){float r=length(vUv)*2.;if(r>1.)discard;float ang=atan(vUv.y,vUv.x);float d=mod(a-ang,6.2831853);float w=exp(-d*2.2)*k;float ring=smoothstep(.98,.9,r)*.25;gl_FragColor=vec4(.45,.95,.6,(w+ring)*(1.-r*.3));}'});
  const sweep=new THREE.Mesh(new THREE.PlaneGeometry(5.2,5.2),sweepMat);sweep.position.z=-.5;sweep.renderOrder=2;hero.add(sweep);
  // incoming threats that bounce off the shield
  const threats=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.13),new THREE.MeshBasicMaterial({color:0xff5d5d,depthTest:false}));m.renderOrder=5;const g=sprite(0xff5d5d,.7,.8);m.add(g);hero.add(m);threats.push({m,g,ph:i/7,ang:Math.random()*6.28,speed:.28+Math.random()*.12});}
  const flash=sprite(0xb6f4a3,1.6,0);flash.position.z=.3;hero.add(flash);let flashT=0;
  dyn.push(({t,dt,emph,any})=>{
   sweepMat.uniforms.a.value=(t*1.1)%6.2831853;sweepMat.uniforms.k.value=.45+emph[0]*.8;
   rings.forEach((r,i)=>{r.rotation.z+=dt*(.25+i*.15)*(1+emph[2]*2.5);r.material.opacity=.45+emph[2]*.5;});
   shieldMat.emissiveIntensity=.16+emph[2]*.35+emph[0]*.15+flashT*.8;
   threats.forEach(o=>{o.ph+=dt*o.speed;if(o.ph>=1){o.ph-=1;o.ang=Math.random()*6.28;flashT=1;flash.position.set(Math.cos(o.ang)*1.55,Math.sin(o.ang)*1.55,.3);}
    const u=o.ph,rad=u<.85?3.4-(u/.85)*1.85:1.55+((u-.85)/.15)*1.2;const vis=u<.85?1:Math.max(0,1-(u-.85)/.15);
    o.m.position.set(Math.cos(o.ang)*rad,Math.sin(o.ang)*rad,.2);o.m.rotation.x+=dt*3;o.m.rotation.y+=dt*2;o.m.scale.setScalar((.85+emph[1]*.7)*vis+.001);});
   flashT=Math.max(0,flashT-dt*3);flash.material.opacity=flashT*.9;flash.scale.setScalar(1.2+(1-flashT)*1.2);
  });
 }

 if(key==='phoenix'){
  const OR=0xff9f43;
  const base=new THREE.Mesh(rb(3.4,.14,1.9,.06),shell);base.position.y=-1.55;hero.add(base);
  // server rack: 5 units, each split in two halves that can fly apart
  const frags=[];const unitH=.5,units=5;
  for(let u=0;u<units;u++)for(let side=-1;side<=1;side+=2){
   const mat=shell.clone();mat.emissive=new THREE.Color(OR);mat.emissiveIntensity=.12;
   const g=rb(1.1,unitH,1.5,.06),m=new THREE.Mesh(g,mat),home=new THREE.Vector3(side*.56,-1.2+unitH/2+u*(unitH+.06),0);
   m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),edgeMat(OR)));
   const led=new THREE.Mesh(new THREE.PlaneGeometry(.12,.06),new THREE.MeshBasicMaterial({color:u%2?0x6bf178:OR}));led.position.set(-side*.38,0,.76);m.add(led);
   hero.add(m);frags.push({m,mat,home,rx:(Math.random()-.5)*3,ry:(Math.random()-.5)*3,rz:(Math.random()-.5)*3,out:new THREE.Vector3(side*(.7+Math.random()*.7),(Math.random()-.4)*1.5,(Math.random()-.5)*1)});
  }
  const debris=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(rb(.14+Math.random()*.12,.12,.12,.03),new THREE.MeshStandardMaterial({color:0x2b241f,emissive:OR,emissiveIntensity:.5,metalness:.5,roughness:.4}));hero.add(m);const a=Math.random()*6.28;debris.push({m,home:new THREE.Vector3((Math.random()-.5)*1.8,-1+Math.random()*2.2,(Math.random()-.5)*1),out:new THREE.Vector3(Math.cos(a)*(1.1+Math.random()*.9),Math.sin(a)*(.9+Math.random()*.9),(Math.random()-.5)*1.4),spin:Math.random()*6});}
  const fire=sprite(0xff7a2f,4.4,0);fire.position.set(0,-.6,-.3);hero.add(fire);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.9,.96,64),new THREE.MeshBasicMaterial({color:OR,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false}));ring.position.set(0,-.2,.9);ring.renderOrder=4;hero.add(ring);
  const EN=40,epos=new Float32Array(EN*3),eseed=[];for(let i=0;i<EN;i++)eseed.push([Math.random()*2-1,Math.random(),Math.random()*6.28]);
  const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(epos,3));
  const embers=new THREE.Points(eg,new THREE.PointsMaterial({color:0xffb26b,size:.12,map:glowTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));embers.renderOrder=5;embers.frustumCulled=false;hero.add(embers);
  const T=9;
  dyn.push(({t,emph})=>{
   const ph=t%T;
   // b = how broken (0 whole, 1 scattered): break at 2.6s, scattered, rebuild 4.7-6.3s
   const b=smooth(2.6,3.4,ph)*(1-smooth(4.7,6.3,ph));
   const rebuilding=ph>4.7&&ph<6.6,reb=rebuilding?smooth(4.7,6.3,ph):0;
   frags.forEach(f=>{f.m.position.copy(f.home).addScaledVector(f.out,b);f.m.rotation.set(f.rx*b,f.ry*b,f.rz*b);
    f.mat.emissiveIntensity=.12+emph[0]*.3+emph[2]*.2+(1-b)*.08+Math.max(0,Math.sin(ph*14))*b*.5+(rebuilding?(.6*reb*(1-reb)*4):0);});
   debris.forEach(d=>{d.m.position.copy(d.home).addScaledVector(d.out,b);d.m.rotation.set(d.spin*b,d.spin*b*1.3,0);d.m.scale.setScalar(Math.max(.001,Math.min(1,b*3)));d.m.visible=b>.01;});
   fire.material.opacity=.15+Math.sin(t*3)*.03+emph[1]*.2+(rebuilding?reb*(1-reb)*3.2:0);
   const sw=ph>6.1&&ph<7.1?(ph-6.1):-1;ring.material.opacity=sw>=0?(1-sw)*.9:0;ring.scale.setScalar(1+Math.max(0,sw)*3.6);
   embers.material.opacity=rebuilding?.95:(b>.5?.35:.1+emph[2]*.4);
   for(let i=0;i<EN;i++){const s=eseed[i],u=((t*.35+s[1])%1);epos[i*3]=s[0]*1.4+Math.sin(t*2+s[2])*.15;epos[i*3+1]=-1.2+u*3.6;epos[i*3+2]=.2;}
   eg.attributes.position.needsUpdate=true;
  });
 }

 if(key==='cloud'){
  const CY=0x4dd9ff;
  const cloudMat=new THREE.MeshStandardMaterial({color:0x9fcbe6,roughness:.7,metalness:0,emissive:0x2f86c8,emissiveIntensity:.14,envMapIntensity:.55});
  const cloud=new THREE.Group();hero.add(cloud);
  [[-.95,-.15,0,.62],[-.3,.2,0,.82],[.55,.1,.05,.7],[1.1,-.2,0,.5],[-.3,-.4,.25,.7],[.5,-.35,.25,.6],[.1,.55,-.15,.55]].forEach(([x,y,z,r])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),cloudMat);m.position.set(x,y,z);cloud.add(m);});
  const dome=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.35,1)),new THREE.LineBasicMaterial({color:0xb6f4a3,transparent:true,opacity:.4}));hero.add(dome);
  const domeGlow=sprite(CY,6,.2);domeGlow.position.z=-.5;hero.add(domeGlow);
  const bRing=new THREE.Mesh(new THREE.TorusGeometry(2.4,.018,8,128),new THREE.MeshBasicMaterial({color:CY,transparent:true,opacity:.6}));bRing.rotation.x=1.35;hero.add(bRing);
  const PN=26,ppos=new Float32Array(PN*3),pseed=[];for(let i=0;i<PN;i++)pseed.push({a:Math.random()*6.28,tilt:(Math.random()-.5)*2.4,sp:.4+Math.random()*.7,r:1.5+Math.random()*.7,ph:Math.random()*6.28});
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(ppos,3));
  const packets=new THREE.Points(pg,new THREE.PointsMaterial({color:0xeaffe2,size:.14,map:glowTex,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false}));packets.renderOrder=5;packets.frustumCulled=false;hero.add(packets);
  dyn.push(({t,dt,emph})=>{
   dome.rotation.y+=dt*.12;dome.rotation.x=Math.sin(t*.2)*.15;bRing.rotation.z+=dt*.2;
   dome.material.opacity=.24+emph[0]*.5+emph[1]*.1;dome.scale.setScalar(1+emph[1]*.1+Math.sin(t*.9)*.01);
   cloudMat.emissiveIntensity=.12+emph[2]*.55;cloud.position.y=Math.sin(t*.8)*.06;cloud.scale.setScalar(1+emph[2]*.05);
   packets.material.opacity=.7+emph[1]*.3;
   for(let i=0;i<PN;i++){const s=pseed[i],a=s.a+t*s.sp,r=s.r+Math.sin(t*.6+s.ph)*.2+emph[1]*.25;ppos[i*3]=Math.cos(a)*r;ppos[i*3+1]=Math.sin(a)*r*Math.cos(s.tilt);ppos[i*3+2]=Math.sin(a)*r*Math.sin(s.tilt);}
   pg.attributes.position.needsUpdate=true;
  });
 }

 // ---- light: one ray from the hero to each of the six feature nodes ----
 const light=new THREE.Group();scene.add(light);
 const E=new THREE.Vector3(1.15,.5,0);
 const ys=NODES.map((_,k)=>2.65-k*1.02),TX=3.55;
 const rays=[],hits=[];
 const portOut=sprite(0xb6f4a3,.9,.8);portOut.position.copy(E);light.add(portOut);
 NODES.forEach((p,k)=>{
  const T=new THREE.Vector3(TX,ys[k],0);
  const ray=beam(E,T,.15,p.color,1,1);light.add(ray);
  const orb=new THREE.Group();orb.position.copy(T);light.add(orb);
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(.19,24,16),new THREE.MeshBasicMaterial({color:p.color,depthTest:false})));
  const g=sprite(p.color,1.4,.9);orb.add(g);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.28,.31,48),new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:.6,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));ring.renderOrder=4;orb.add(ring);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(.55,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.userData.k=k;orb.add(hit);hits.push(hit);
  const N=12,pos=new Float32Array(N*3),pgm=new THREE.BufferGeometry();pgm.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const points=new THREE.Points(pgm,new THREE.PointsMaterial({color:p.color,size:.1,map:glowTex,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,sizeAttenuation:true}));points.renderOrder=4;points.frustumCulled=false;light.add(points);
  rays.push({ray,orb,g,ring,T,points,pos,N,k:1,w:.15,s:1});
 });
 const DN=60,dpos=new Float32Array(DN*3),dseed=[];for(let i=0;i<DN;i++){dpos[i*3]=(Math.random()-.5)*12;dpos[i*3+1]=(Math.random()-.5)*7;dpos[i*3+2]=-1+Math.random()*-1.8;dseed.push(Math.random()*6.28);}
 const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
 scene.add(new THREE.Points(dg,new THREE.PointsMaterial({color:0xcfffe0,size:.05,map:glowTex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})));

 // ---- overlay ----
 const ui=document.createElement('div');ui.className='prism-ui';host.append(ui);
 const badge=document.createElement('img');badge.className='prism-badge';badge.src=cfg.logo;badge.alt=cfg.alt;ui.append(badge);
 const labels=NODES.map((p,k)=>{const b=document.createElement('button');b.type='button';b.className='prism-label';b.style.setProperty('--c',p.css);b.innerHTML='<i></i><span></span>';b.querySelector('span').textContent=p.name;b.setAttribute('aria-label',p.title+': '+p.desc);ui.append(b);return b;});
 const cap=document.createElement('div');cap.className='prism-caption';cap.setAttribute('aria-live','polite');ui.append(cap);

 // ---- interaction ----
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
  const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),zW=5.3/(t*aspect),zH=4.3/t;
  const cx=r.width<560?1.75:1.5;camera.position.set(cx,0,Math.max(zW,zH,9));camera.lookAt(cx,0,0);camera.updateProjectionMatrix();
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
  try{frameInner(t);}catch(e){console.error('product3d frame',e);window.__prismErr=String(e&&e.stack||e);}
 }
 function frameInner(t){
  frameId=0;if(!visible||document.hidden)return;
  const dt=Math.min((t-last)/1000||.016,.06);last=t;
  const moving=!state.paused&&!reduced.matches;
  if(moving)elapsed+=dt;
  if(hover<0&&lock<0&&moving&&elapsed-cycleAt>3){cycleAt=elapsed;cycle=(cycle+1)%NODES.length;}
  const cur=current(),ease=1-Math.exp(-dt*6);
  rotY+=((moving?Math.sin(elapsed*.5)*.22:0)+hx*.45+drag-rotY)*ease;rotX+=(.12+hy*.18-rotX)*ease;
  hero.rotation.set(rotX,rotY,0);
  for(let g=0;g<3;g++)grpEmph[g]+=(((cur>=0&&Math.floor(cur/2)===g)?1:0)-grpEmph[g])*ease;
  anyEmph+=((cur>=0?1:0)-anyEmph)*ease;
  const ctx={t:elapsed,dt:moving?dt:0,emph:grpEmph,any:anyEmph,moving};
  dyn.forEach(f=>f(ctx));
  beamMats.forEach(m=>{m.uniforms.t.value=elapsed;});
  rays.forEach((o,k)=>{
   const on=cur===k,any=cur>=0;
   o.k+=((any?(on?2:.28):1)-o.k)*ease;o.w+=((on?.32:.15)-o.w)*ease;o.s+=((on?1.55:1)-o.s)*ease;
   o.ray.material.uniforms.k.value=o.k;o.ray.scale.y=o.w;o.orb.scale.setScalar(o.s);
   const p=((elapsed*.85+k*.17)%1);o.ring.scale.setScalar(1+p*1.5);o.ring.material.opacity=(1-p)*(on?.9:.35);o.g.material.opacity=on?1:(any?.4:.85);
   o.points.material.opacity=on?1:(any?.18:.8);
   for(let i=0;i<o.N;i++){const u=((i/o.N)+elapsed*.2+k*.13)%1;o.pos[i*3]=E.x+(o.T.x-E.x)*u;o.pos[i*3+1]=E.y+(o.T.y-E.y)*u;o.pos[i*3+2]=0;}
   o.points.geometry.attributes.position.needsUpdate=true;
  });
  for(let i=0;i<DN;i++){dpos[i*3+1]+=moving?Math.sin(elapsed*.4+dseed[i])*.0009:0;dpos[i*3]+=moving?.0016:0;if(dpos[i*3]>6)dpos[i*3]=-6;}dg.attributes.position.needsUpdate=true;
  halo.material.opacity=.28+(moving?Math.sin(elapsed*1.2)*.05:0);
  const W=renderer.domElement.clientWidth,Hh=renderer.domElement.clientHeight;
  labels.forEach((b,k)=>{v.copy(rays[k].T);v.x+=.4;v.project(camera);b.style.transform=`translate(${((v.x*.5+.5)*W).toFixed(1)}px,${((-v.y*.5+.5)*Hh).toFixed(1)}px) translateY(-50%)`;b.classList.toggle('on',cur===k);b.classList.toggle('dim',cur>=0&&cur!==k);});
  if(shown!==cur){shown=cur;const p=NODES[cur];cap.style.setProperty('--c',p.css);cap.innerHTML='<b></b><span></span>';cap.firstChild.textContent=p.title;cap.lastChild.textContent=p.desc;}
  renderer.render(scene,camera);
  if(!host.classList.contains('webgl-ready'))host.classList.add('webgl-ready');
  if(moving||dragging||Math.abs(rotY)>.001)wake();
 }
 function wake(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(frame);}
 wake();
 return {reset(){drag=hx=hy=0;lock=-1;hover=-1;wake();},renderer};
}
