import React from 'react';
import {RoundedBox} from '@react-three/drei';
import * as THREE from 'three';

const POS={internet:[5.1,-2.55,.05],firewall:[3.15,-1.55,.15],router:[1.25,-.65,.12],switch:[-.75,.15,.1],server:[-5,-.55,.18],nas:[-3.5,1.35,.18],ap1:[-1.9,2.05,.15],ap2:[.15,2.7,.15],users:[-4.35,3.15,.15]};
const LINKS=[['internet','firewall','wan'],['firewall','router','wan'],['router','switch','core'],['switch','server','server'],['switch','nas','storage'],['switch','ap1','wifi'],['switch','ap2','wifi'],['switch','users','endpoint']];
const V=n=>new THREE.Vector3(...POS[n]);

function Led({x,y=0,color='#36f0a4'}){return <mesh position={[x,y,.421]}><boxGeometry args={[.075,.045,.018]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>}
function FloorRing({color='#36cfff',r=.68}){return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.47,-.05]}><ringGeometry args={[r,r+.035,48]}/><meshBasicMaterial color={color} transparent opacity={.38} side={THREE.DoubleSide} toneMapped={false}/></mesh>}
function Router(){return <group><RoundedBox args={[1.25,.55,.7]} radius={.1} castShadow><meshStandardMaterial color="#066b9e" metalness={.68} roughness={.28}/></RoundedBox><mesh position={[0,.1,.37]}><boxGeometry args={[.55,.055,.02]}/><meshBasicMaterial color="#021726"/></mesh>{[-.42,-.28,-.14,0,.14,.28,.42].map((x,i)=><Led key={i} x={x} y={-.13} color={i%2?'#41e9ff':'#58ffb6'}/>)}</group>}
function Firewall(){return <group rotation={[0,0,-.18]}><RoundedBox args={[1.15,.78,.72]} radius={.07} castShadow><meshStandardMaterial color="#9e1434" metalness={.64} roughness={.25}/></RoundedBox><mesh position={[0,.05,.37]}><boxGeometry args={[.78,.18,.02]}/><meshStandardMaterial color="#1a0810"/></mesh>{[-.32,-.2,-.08,.04,.16,.28].map((x,i)=><Led key={i} x={x} y={.05} color={i%3===0?'#ffd059':'#39f3bf'}/>)}</group>}
function Switch(){return <group><RoundedBox args={[1.55,.46,.72]} radius={.06} castShadow><meshStandardMaterial color="#28784f" metalness={.65} roughness={.3}/></RoundedBox>{Array.from({length:10},(_,i)=>{const x=-.62+i*.14;return <group key={i}><mesh position={[x,.03,.37]}><boxGeometry args={[.09,.1,.025]}/><meshStandardMaterial color="#07140f"/></mesh><Led x={x} y={-.13} color={i%4===0?'#ffce4b':'#4cff9a'}/></group>})}</group>}
function ServerRack(){return <group>{[-.35,0,.35].map((y,i)=><group key={i} position={[0,y,0]}><RoundedBox args={[1.7,.3,.72]} radius={.04} castShadow><meshStandardMaterial color="#08111f" metalness={.78} roughness={.23}/></RoundedBox>{[-.55,-.42,-.29].map((x,j)=><Led key={j} x={x} y={0} color={j===0?'#47ff9b':'#43bfff'}/>)}</group>)}</group>}
function Nas(){return <group><RoundedBox args={[.9,1.55,.72]} radius={.06} castShadow><meshStandardMaterial color="#392179" metalness={.65} roughness={.27}/></RoundedBox>{[-.5,-.18,.14,.46].map((y,i)=><group key={i}><mesh position={[0,y,.37]}><boxGeometry args={[.65,.2,.025]}/><meshStandardMaterial color="#090817"/></mesh><Led x={-.22} y={y} color={i===1?'#ffd44d':'#4dffaf'}/></group>)}</group>}
function AccessPoint(){return <group><mesh position={[0,.02,0]}><sphereGeometry args={[.48,32,18,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#c57a08" metalness={.45} roughness={.3} emissive="#6b3900" emissiveIntensity={.25}/></mesh><mesh position={[0,-.06,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.48,.51,40]}/><meshBasicMaterial color="#e7a32d" transparent opacity={.45} side={THREE.DoubleSide}/></mesh></group>}
function EndpointGroup(){return <group>{[-.35,.35].map((x,i)=><group key={i} position={[x,0,0]}><mesh><boxGeometry args={[.55,.36,.055]}/><meshStandardMaterial color="#0b4d70" emissive="#0b3650" emissiveIntensity={.5}/></mesh><mesh position={[0,-.27,0]}><boxGeometry args={[.08,.18,.06]}/><meshStandardMaterial color="#566879"/></mesh></group>)}</group>}
function Internet(){return <group><mesh><icosahedronGeometry args={[.72,2]}/><meshStandardMaterial color="#07121f" wireframe emissive="#9cb9d5" emissiveIntensity={1.4}/></mesh><mesh><sphereGeometry args={[.75,24,16]}/><meshBasicMaterial color="#a9c8e4" transparent opacity={.045}/></mesh></group>}
const MODEL={internet:Internet,firewall:Firewall,router:Router,switch:Switch,server:ServerRack,nas:Nas,ap1:AccessPoint,ap2:AccessPoint,users:EndpointGroup};
const LABEL={internet:'INTERNET',firewall:'Firewall 1',router:'Router 1',switch:'Switch 1',server:'Server 1',nas:'NAS / Backup 1',ap1:'Access Point 1',ap2:'Access Point 2',users:'24 Endpoints'};
const COLORS={internet:'#a6c4df',firewall:'#df3555',router:'#2bbbe9',switch:'#58c784',server:'#416b99',nas:'#8664d4',ap1:'#d8901f',ap2:'#d8901f',users:'#65c8ee'};


function DesktopServer() {
  return <group>
    <RoundedBox args={[.58, 1.05, .65]} position={[-.6, 0, 0]} radius={.04}><meshStandardMaterial color="#77736b" roughness={.8}/></RoundedBox>
    <mesh position={[-.6, .2, .34]}><boxGeometry args={[.4, .06, .02]}/><meshStandardMaterial color="#252930"/></mesh>
    <group position={[-.6, -.24, -.07]}><Led x={0} color="#ffb14d"/></group>
    <RoundedBox args={[.95, .66, .12]} position={[.3, .2, .02]} radius={.03}><meshStandardMaterial color="#616675"/></RoundedBox>
    <mesh position={[.3, .2, .09]}><planeGeometry args={[.82, .53]}/><meshBasicMaterial color="#10476d"/></mesh>
    {[-.07, .07].flatMap(x => [-.07, .07].map(y => <mesh key={`${x}-${y}`} position={[.3 + x, .2 + y, .1]}><planeGeometry args={[.11, .11]}/><meshBasicMaterial color="#6ab5e2"/></mesh>))}
    <mesh position={[.3, -.25, 0]}><boxGeometry args={[.08, .27, .1]}/><meshStandardMaterial color="#616675"/></mesh>
    <mesh position={[.3, -.42, .07]}><boxGeometry args={[.65, .06, .32]}/><meshStandardMaterial color="#616675"/></mesh>
  </group>;
}

function UnmanagedSwitch() {
  return <group><RoundedBox args={[1.15, .3, .58]} radius={.04}><meshStandardMaterial color="#8c8271" roughness={.85}/></RoundedBox>{[-.38, -.13, .13, .38].map(x => <group key={x}><mesh position={[x, 0, .3]}><boxGeometry args={[.16, .12, .02]}/><meshStandardMaterial color="#161c22"/></mesh><group position={[0, -.1, -.12]}><Led x={x} color="#e6a64e"/></group></group>)}</group>;
}

function ExternalBackupDrive() {
  return <group rotation={[0, 0, -.12]}>
    <RoundedBox args={[.82, .95, .23]} radius={.1}><meshStandardMaterial color="#807c70" metalness={.3} roughness={.65}/></RoundedBox>
    <RoundedBox args={[.67, .65, .025]} position={[0, .04, .13]} radius={.05}><meshStandardMaterial color="#313841" roughness={.7}/></RoundedBox>
    <mesh position={[0, -.16, .15]}><boxGeometry args={[.3, .06, .02]}/><meshBasicMaterial color="#d9c9a3"/></mesh>
    <mesh position={[.22, -.34, .13]}><sphereGeometry args={[.025, 8, 8]}/><meshBasicMaterial color="#e5ad53" toneMapped={false}/></mesh>
    <mesh position={[0, -.53, 0]}><boxGeometry args={[.16, .16, .12]}/><meshStandardMaterial color="#252a34"/></mesh>
  </group>;
}

export {POS, LINKS, V, MODEL, LABEL, COLORS, FloorRing, DesktopServer, UnmanagedSwitch, ExternalBackupDrive};
