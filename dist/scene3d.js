import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

// One renderer, one active product, no post-processing or external model downloads.
export async function initProductScene(host, state, options={}) {
  const canvas=document.createElement('canvas');canvas.className='product-webgl';canvas.setAttribute('aria-hidden','true');
  const mobile=matchMedia('(max-width: 600px)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,.3,9.8);camera.lookAt(0,0,0);
  const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04,.1,100,{size:128});scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xe8fff2,0x1f3b52,2));
  const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(-3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x75adff,2.5);fill.position.set(4,1,-2);scene.add(fill);
  const silver=new THREE.MeshStandardMaterial({color:0xc8d9da,metalness:.95,roughness:.23,envMapIntensity:1.8});
  const dark=new THREE.MeshStandardMaterial({color:0x153631,metalness:.72,roughness:.27});
  const ceramic=new THREE.MeshPhysicalMaterial({color:0xf9fcf8,metalness:.05,roughness:.21,clearcoat:1,clearcoatRoughness:.16});
  const colors=[0x37bde0,0x8fea90,0x4277ff,0xff923d,0x9972ff];
  const groups=[];const assets=['prism','project','aegis','phoenix','cloud'];
  const loader=new THREE.TextureLoader();
  const textures=await Promise.all(assets.map((n,i)=>options.single&&i!==state.index?null:loader.loadAsync('assets/'+n+'.webp')));
  const artworkBounds=[[44,113,578,766],[15,82,623,598],[89,37,584,682],[102,107,805,728],[95,163,814,686]];
  textures.forEach((t,i)=>{if(!t)return;const [l,top,r,b]=artworkBounds[i],w=t.image.width,h=t.image.height;t.offset.set(l/w,1-b/h);t.repeat.set((r-l)/w,(b-top)/h);t.userData.artRatio=(r-l)/(b-top);});
  textures.filter(Boolean).forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});
  const rounded=(x,y,z,r=.12)=>new RoundedBoxGeometry(x,y,z,3,r);
  function mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);parent.add(m);return m;}
  function torus(parent,r,t,mat,position=[0,0,0],rotation=[0,0,0],arc=Math.PI*2){const m=mesh(new THREE.TorusGeometry(r,t,8,64,arc),mat,parent,position);m.rotation.set(...rotation);return m;}
  for(let i=0;i<5;i++){
    if(options.single&&i!==state.index){groups.push(null);continue;}
    const g=new THREE.Group();scene.add(g);groups.push(g);g.visible=false;g.userData.weight=0;
    const accent=new THREE.MeshStandardMaterial({color:colors[i],metalness:.6,roughness:.2,emissive:colors[i],emissiveIntensity:.35});
    const badge=new THREE.Group();g.add(badge);
    // Broad sculpted medallion: the supplied artwork remains the focal point.
    const plate=new THREE.CylinderGeometry(1.67,1.67,.23,96);
    const rim=mesh(plate,silver,badge,[0,0,0]);rim.rotation.x=Math.PI/2;
    const face=mesh(new THREE.CylinderGeometry(1.58,1.58,.08,96),ceramic,badge,[0,0,.15]);face.rotation.x=Math.PI/2;
    torus(badge,1.63,.032,accent,[0,0,.15]);
    const ratio=textures[i].userData.artRatio;let pw=2.6,ph=pw/ratio;if(ph>2.7){ph=2.7;pw=ph*ratio;}const fit=Math.min(1,2.98/Math.hypot(pw,ph));pw*=fit;ph*=fit;
    const logoMaterial=new THREE.MeshBasicMaterial({map:textures[i],transparent:true,toneMapped:false,depthWrite:false});
    // Blend white artwork backgrounds into the ceramic face without raster upscaling.
    logoMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float paper=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
      diffuseColor.a *= 1.0-smoothstep(0.88,0.99,paper);
    `);};
    mesh(new THREE.PlaneGeometry(pw,ph),logoMaterial,badge,[0,0,.202]);
    if(i===0){
      const prism=mesh(new THREE.CylinderGeometry(1.5,1.5,2.8,3),new THREE.MeshPhysicalMaterial({color:0x43e3c5,metalness:.45,roughness:.08,transparent:true,opacity:.65,clearcoat:1}),g,[0,.15,-2.25]);prism.rotation.set(.15,Math.PI/6,.15);
      torus(g,2,.014,accent,[0,0,-.35],[.9,.35,.4]);
    }
    if(i===1){
      for(let k=0;k<3;k++){const slab=mesh(rounded(2.9,.12,.6,.05),k===1?accent:silver,g,[0,-2.23+k*.15,-.75]);slab.rotation.y=.2+k*.13;}
      mesh(rounded(.055,2.1,.055,.02),accent,g,[-1.53,-.2,-.55]);mesh(rounded(.055,1.8,.055,.02),accent,g,[1.55,.2,-.55]);
    }
    if(i===2){
      const s=new THREE.Shape();s.moveTo(-1.55,1.35);s.lineTo(0,1.8);s.lineTo(1.55,1.35);s.lineTo(1.45,-.15);s.quadraticCurveTo(1.1,-1.3,0,-1.85);s.quadraticCurveTo(-1.1,-1.3,-1.45,-.15);s.closePath();
      mesh(new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.09,bevelThickness:.08}),accent,g,[0,0,-.65]);
      torus(g,1.97,.025,silver,[0,0,-.6],[.3,.7,.2]);
    }
    if(i===3){
      torus(g,1.95,.095,accent,[0,0,-.4],[0,.25,-.6],Math.PI*1.6);
      torus(g,2.14,.027,silver,[0,0,-.5],[0,.25,.5],Math.PI*1.65);
      for(let k=0;k<3;k++){const m=mesh(new THREE.ConeGeometry(.12,.32,4),accent,g,[1.52+k*.19,.83-k*.27,-.15]);m.rotation.z=-.6;}
    }
    if(i===4){
      for(let k=0;k<3;k++){const m=mesh(rounded(2.55-k*.1,.12,.6,.05),k===1?accent:silver,g,[0,-2.23+k*.15,-.75]);m.rotation.y=.2;}
      // Architectural server fins behind the emblem, with recessed light strips.
      const infrastructure=new THREE.Group();g.add(infrastructure);infrastructure.position.set(0,.1,-1.05);
      for(let k=0;k<5;k++){
        const x=(k-2)*.71,height=2.9-Math.abs(k-2)*.23;
        const fin=mesh(rounded(.46,height,.42,.07),k%2?dark:silver,infrastructure,[x,.25,0]);
        mesh(rounded(.035,height-.2,.025,.01),accent,infrastructure,[x+.18,.25,.225]);
        for(let row=0;row<4;row++)mesh(rounded(.25,.035,.025,.01),dark,infrastructure,[x,height*.35-row*.18,.23]);
      }
      infrastructure.rotation.y=-.12;

    }
    badge.rotation.y=-.06;
  }
  // A soft contact shadow adds grounding without a shadow-map render pass.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const c=shadowCanvas.getContext('2d');const gradient=c.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(15,45,28,.3)');gradient.addColorStop(1,'rgba(15,45,28,0)');c.fillStyle=gradient;c.fillRect(0,0,128,128);
  const shadow=mesh(new THREE.PlaneGeometry(5.3,2.1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),scene,[0,-2,0]);shadow.rotation.x=-Math.PI/2;
  host.appendChild(canvas);let visible=false,frameId=0,last=0,elapsed=0,dragging=false,lastX=0,drag=0,hoverX=0,hoverY=0,rotationX=0,rotationY=0,dirty=true,slowFrames=0,sampled=0,frameInterval=1000/60;
  let scrollPosition=state.position||0,reported=-1;
  const current=()=>state.index||0;
  groups[current()].userData.weight=1;
  function size(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=camera.aspect<1?8.9:8.2;camera.updateProjectionMatrix();dirty=true;wake();}
  const resize=new ResizeObserver(size);resize.observe(host);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frameId);frameId=0;}},{rootMargin:'50px'});observer.observe(host);
  function wake(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(render);}
  function render(t){frameId=0;if(!visible||document.hidden)return;if(last&&t-last<frameInterval-1){wake();return;}const delta=Math.min((t-last||16)/1000,.06);last=t;
    const moving=!state.paused&&!reduced.matches;elapsed+=moving?delta:0;const ease=1-Math.exp(-delta*5);let settling=false;
    rotationX+=(hoverY*.12-rotationX)*ease;rotationY+=(hoverX*.2+drag-rotationY)*ease;
    if(!options.single){
      const raw=Number.isFinite(state.position)?state.position:current();
      const segment=Math.floor(raw),fraction=raw-segment,u=Math.max(0,Math.min(1,(fraction-.16)/.68));
      const target=segment+u*u*(3-2*u);
      scrollPosition+=(target-scrollPosition)*(1-Math.exp(-delta*10));
      settling=Math.abs(target-scrollPosition)>.0005;
      const chapter=Math.max(0,Math.min(4,Math.round(scrollPosition)));
      if(chapter!==reported){reported=chapter;document.dispatchEvent(new CustomEvent('itcraft:chapter',{detail:{index:chapter}}));}
      groups.forEach((g,i)=>{if(!g)return;g.visible=i===chapter;if(!g.visible)return;
        const turn=(scrollPosition-chapter)*Math.PI*2;
        g.scale.setScalar(1.09-.06*Math.sin(Math.abs(scrollPosition-chapter)*Math.PI));g.position.set(0,-.08,0);
        g.rotation.set(.06+(moving?rotationX:0),turn-.12+(moving?rotationY:0),-.09+Math.sin(scrollPosition*Math.PI*2)*.08);
      });
    }else{
    groups.forEach((g,i)=>{if(!g)return;const goal=i===current()?1:0;g.userData.weight+=(goal-g.userData.weight)*ease;const v=g.userData.weight;g.visible=v>.005;if(!g.visible)return;settling ||= Math.abs(goal-v)>.001;
      g.scale.setScalar(.86+.14*v);g.position.set((i-current())*7*(1-v),-.1+(moving?Math.sin(elapsed*.65)*.05:0),-(1-v)*1.5);
      g.rotation.set(.09+(moving?rotationX:0),-.12+(moving?Math.sin(elapsed*.3)*.08+rotationY+(state.phase||0)*.16:drag)+(1-v)*.35,-.035);

    });
    }
    const before=performance.now();renderer.render(scene,camera);const cost=performance.now()-before;
    if(moving&&sampled<100){sampled++;if(cost>24)slowFrames++;if(sampled===100&&slowFrames>35){frameInterval=1000/30;}}
    if(!host.classList.contains('webgl-ready'))host.classList.add('webgl-ready');
    dirty=false;if(moving||settling||dragging)wake();
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button'))return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);host.classList.add('dragging');wake();});
  host.addEventListener('pointermove',e=>{if(dragging){drag+=(e.clientX-lastX)*.006;drag=Math.max(-.95,Math.min(.95,drag));lastX=e.clientX;}else{const r=host.getBoundingClientRect();hoverX=(e.clientX-r.left)/r.width-.5;hoverY=(e.clientY-r.top)/r.height-.5;}wake();});
  function release(){dragging=false;host.classList.remove('dragging');}host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
  document.addEventListener('visibilitychange',()=>{last=0;wake();});
  const update=()=>{dirty=true;wake();};document.addEventListener('itcraft:product',update);document.addEventListener('itcraft:scroll',update);document.addEventListener('itcraft:motion',update);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('webgl-ready');cancelAnimationFrame(frameId);frameId=0;});
  canvas.addEventListener('webglcontextrestored',()=>{dirty=true;wake();});
  reduced.addEventListener('change',update);
  return {reset(){drag=hoverX=hoverY=0;update();},renderer};
}
