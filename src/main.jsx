import React, {Suspense, memo, useCallback, useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Float, Html, Line, RoundedBox} from '@react-three/drei';
import {Bloom, EffectComposer, Vignette} from '@react-three/postprocessing';
import {AnimatePresence, motion} from 'framer-motion';
import {Activity, ArrowRight, Bug, Check, ChevronDown, LockKeyhole, Play, RotateCcw, Shield, ShieldAlert, Square, Terminal, Zap} from 'lucide-react';
import * as THREE from 'three';
import {POS, LINKS, V, MODEL, LABEL, COLORS, FloorRing, DesktopServer, UnmanagedSwitch, ExternalBackupDrive} from './devices';
import {FINDINGS, durationFor, scanCountAt, findingState} from './transformation.mjs';
import {THREAT_STYLES, RansomwarePayload, MalwarePayload} from './threat-visuals';
import {ATTACK_PATH, WAVE_DURATION, FIREWALL_STOP, attackFrame, resolveScenario, monitoringFrame} from './simulation.mjs';
import './styles.css';

const PHASES = [
  {id: 'discover', label: 'Live topology', title: 'Your infrastructure. In motion.', copy: 'Watch traffic move through the network. Launch a simulated threat, then bring each layer of defense online.'},
  {id: 'assess', label: 'PrismSuite', action: 'Initiate PrismSuite', title: 'Reveal what needs to change.', copy: 'Inspect firewall policies, switching, the desktop workload, segmentation, manual backup storage and endpoint protection. Findings attach to assets as the scan reaches them.', steps: ['Inspecting firewall configuration', 'Discovering switch capabilities', 'Inspecting the Windows desktop host', 'Assessing segmentation, backups and endpoint AV'], result: 'Assessment complete. Six findings confirmed, including manual USB backups and endpoints without managed EDR/XDR.'},
  {id: 'build', label: 'Project One', action: 'Initiate Project One', title: 'Watch the infrastructure transform.', copy: 'Harden the network, migrate the desktop workload, replace manual USB backups with a scheduled NAS backup system and deploy EPS with EDR/XDR. Protection activates when the upgrade completes.', steps: ['Staging firewall rules and logging', 'Replacing the unmanaged switch', 'Creating network segments', 'Migrating workload; deploying NAS and EPS'], result: 'Project One complete. Firewall policies, managed switching and VLANs active; dedicated server, scheduled NAS backups and EPS with EDR/XDR deployed.', requires: 'assess'},
  {id: 'protect', label: 'Aegis One', action: 'Activate Aegis One', title: 'Monitor, manage, and respond.', copy: 'Connect the hardened network to SOC/NOC operations. Observe firewall events, triage incidents, and monitor service availability while Project One policies keep enforcing protection.', steps: ['Connecting security telemetry', 'Enabling NOC health monitoring', 'Connecting SOC incident workflows', 'Validating monitoring coverage'], result: 'Aegis One SOC/NOC online. Security monitoring, incident management, and service health telemetry connected.', requires: 'build'},
  {id: 'recover', label: 'Phoenix ODR', action: 'Run recovery drill', title: 'Prove that recovery works.', copy: 'Simulate a primary workload outage, isolate it, and bring a recovery workload online without removing your defenses.', steps: ['Simulating primary workload outage', 'Isolating the affected workload', 'Restoring the recovery workload', 'Recovery workload online'], result: 'Recovery drill complete. Recovery workload online; primary isolated.', requires: 'protect'},
];
const assetUrl = file => `${import.meta.env.BASE_URL}logos/${file}`;
const LOGOS = {discover: assetUrl('itcraft.png'), assess: assetUrl('prism.png'), build: assetUrl('projectone.jpeg'), protect: assetUrl('aegis.jpg'), recover: assetUrl('phoenix.png')};
const EMPTY_DEFENSES = {assess: false, build: false, protect: false, recover: false};

function SimulatedTelemetry({attack, stats, defenses, operation, scanCount}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const packets = attack ? 184 + ((tick * 7) % 41) : 0;
  const latency = defenses.protect ? 8 + (tick % 3) : 18 + (tick % 6);
  const coverage = Math.round((scanCount / FINDINGS.length) * 100);
  const state = operation ? `${operation.id.toUpperCase()} IN PROGRESS` : attack?.stage?.toUpperCase() || 'STANDING BY';
  return <section className="telemetry-strip" aria-label="Simulated telemetry">
    <div className="telemetry-title"><Activity size={13}/><b>SIMULATED TELEMETRY</b><span>DEMO DATA</span></div>
    <div className="telemetry-grid">
      <div><span>PACKETS / SEC</span><strong>{String(packets).padStart(3, '0')}</strong></div>
      <div><span>LATENCY</span><strong>{latency}<small> ms</small></strong></div>
      <div><span>ASSESSMENT</span><strong>{coverage}<small>%</small></strong></div>
      <div><span>EVENTS</span><strong>{String(stats.attempts + stats.blocked + stats.breaches).padStart(2, '0')}</strong></div>
    </div>
    <p><span className="telemetry-live-dot"/>{state} · illustrative values only; no live traffic is inspected.</p>
  </section>;
}

function Pulse({color = '#ff456a'}) {
  const ref = useRef();
  useFrame(({clock}) => ref.current.scale.setScalar(1 + (Math.sin(clock.elapsedTime * 4) + 1) * .25));
  return <mesh ref={ref} position={[0, 0, -.15]}><ringGeometry args={[.8, .84, 48]}/><meshBasicMaterial color={color} transparent opacity={.6} side={THREE.DoubleSide} toneMapped={false}/></mesh>;
}

function Device({id, defenses, running, breached, recovery, scanCount, upgradeStep}) {
  const upgraded = defenses.build || (id === 'switch' && upgradeStep >= 2);
  const C = id === 'server' && !upgraded ? DesktopServer : id === 'switch' && !upgraded ? UnmanagedSwitch : id === 'nas' && !upgraded ? ExternalBackupDrive : MODEL[id];
  const findingIndex = FINDINGS.findIndex(item => item.id === id);
  const finding = FINDINGS[findingIndex];
  const scanning = running === 'assess' && findingIndex === scanCount;
  const upgrading = running === 'build' && (id === 'firewall' || (id === 'switch' && upgradeStep === 1) || (['server', 'users', 'nas'].includes(id) && upgradeStep === 3));
  const confirmed = finding && (defenses.assess || findingIndex < scanCount);
  const name = id === 'server' ? (upgraded ? 'Dedicated Server 1' : 'Windows Desktop / Server 1') : id === 'switch' ? (upgraded ? 'Managed Switch 1' : 'Unmanaged Switch 1') : id === 'nas' ? (upgraded ? 'NAS / Backup 1' : 'External Backup Drive') : LABEL[id];
  const ref = useRef();
  const [hover, setHover] = useState(false);
  const risk = confirmed && !upgraded;
  const failed = id === 'server' && (breached || recovery);
  const protectedDevice = defenses.build && id !== 'internet' && !failed;
  useFrame((_, delta) => ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, hover ? 1.08 : 1, 8, delta)));
  return <Float speed={.55} floatIntensity={.06} rotationIntensity={.015}>
    <group ref={ref} position={POS[id]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <UpgradeModel key={upgraded ? 'after' : 'before'}><C/>{id === 'users' && <EndpointProtection upgraded={defenses.build}/>}</UpgradeModel><FloorRing color={failed || risk ? '#ff456a' : protectedDevice ? '#46e5b4' : COLORS[id]} r={id === 'server' ? 1 : .7}/>
      <Html center position={id === 'nas' && !upgraded ? [-1.9, .3, 0] : [0, id === 'nas' || id === 'internet' ? 1.15 : .82, 0]} distanceFactor={12} zIndexRange={[20, 0]} style={{pointerEvents: 'none'}}>
        <div className={`node-label ${risk || failed ? 'danger' : ''}`} data-device={id} data-model={upgraded ? 'upgraded' : 'baseline'}>{name}{failed && <span>{recovery ? 'ISOLATED / OFFLINE' : 'COMPROMISED'}</span>}{upgrading ? <span className="upgrade-label">{id === 'firewall' ? 'POLICIES STAGED · VALIDATING' : id === 'users' ? 'DEPLOYING EPS + EDR/XDR' : id === 'nas' ? 'PROVISIONING NAS BACKUPS' : 'UPGRADING INFRASTRUCTURE'}</span> : scanning ? <span className="upgrade-label">PRISMSUITE SCANNING</span> : risk ? <span>{id === 'firewall' ? 'POLICY / LOGGING GAPS' : id === 'switch' ? 'NO MANAGED CONTROLS' : id === 'users' ? 'NO MANAGED EDR / XDR' : id === 'nas' ? 'NO CENTRAL BACKUP SCHEDULE' : 'DESKTOP-CLASS WORKLOAD HOST'}</span> : protectedDevice ? <span className="safe-label">{id === 'users' ? 'MANAGED EPS + EDR/XDR' : id === 'nas' ? 'SCHEDULED NETWORK BACKUPS' : defenses.protect ? 'HARDENED · MONITORED' : id === 'firewall' ? 'POLICY RECONFIGURED' : 'HARDENED'}</span> : id === 'firewall' ? <span className="baseline-label">RULES NOT REVIEWED</span> : null}{id === 'users' && !defenses.build && <span className="baseline-label">BASIC AV / WINDOWS DEFENDER</span>}{id === 'nas' && !defenses.build && <span className="baseline-label">USB · MANUAL COPIES</span>}{id === 'users' && defenses.protect && <span className="safe-label">AEGIS SOC MONITORED</span>}</div>
      </Html>
      {(failed || risk) && <Pulse/>}
      {(protectedDevice || scanning || upgrading) && <Pulse color={protectedDevice ? '#46e5b4' : '#43d9ff'}/>}
    </group>
  </Float>;
}

function EndpointProtection({upgraded}) {
  const color = upgraded ? '#46e5b4' : '#e4b46b';
  return <group>{[-.35, .35].map(x => <group key={x} position={[x, 0, .06]}>
    <Line points={[[0, .14, 0], [.12, .09, 0], [.1, -.06, 0], [0, -.14, 0], [-.1, -.06, 0], [-.12, .09, 0], [0, .14, 0]]} color={color} lineWidth={1.8}/>
    <Line points={upgraded ? [[-.055, 0, .01], [-.015, -.045, .01], [.065, .055, .01]] : [[-.055, 0, .01], [.055, 0, .01]]} color={color} lineWidth={1.6}/>
  </group>)}</group>;
}

function UpgradeModel({children}) {
  const ref = useRef();
  useFrame((_, delta) => ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, 1, 7, delta)));
  return <group ref={ref} scale={.05}>{children}</group>;
}

function FlowDot({a, b, offset, color}) {
  const ref = useRef();
  useFrame(({clock}) => ref.current.position.lerpVectors(V(a), V(b), (clock.elapsedTime * .18 + offset) % 1));
  return <mesh ref={ref}><sphereGeometry args={[.04, 8, 8]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>;
}

function NetworkLink({a, b, type, defenses, index, upgradeStep}) {
  // The initial backup disk is attached to the host, not to the network switch.
  if (b === 'nas' && !defenses.build) return <Line points={[POS.server, POS.nas]} color="#b6a07e" dashed dashSize={.09} gapSize={.06} lineWidth={1.5}/>;
  const hasSegments = defenses.build || upgradeStep >= 3;
  const segmented = hasSegments && a === 'switch' && ['server', 'nas'].includes(b);
  const color = !hasSegments ? '#ad8f61' : segmented || defenses.build ? '#46e5b4' : type === 'wifi' ? '#d99324' : type === 'storage' ? '#8664d4' : '#3289b8';
  return <><Line points={[POS[a], POS[b]]} color={color} lineWidth={segmented ? 2 : 1.25} transparent opacity={.6}/>
    {[0, .5].map(offset => <FlowDot key={offset} a={a} b={b} offset={offset + index * .1} color={color}/>)}
    {segmented && <group position={V(a).lerp(V(b), .36)}><mesh><octahedronGeometry args={[.18, 0]}/><meshBasicMaterial color="#46e5b4" wireframe toneMapped={false}/></mesh></group>}
  </>;
}

function ScanPulse({operation}) {
  const ref = useRef();
  useFrame(() => {
    const t = Math.min((performance.now() - operation.started) / durationFor(operation.id), 1);
    const path = [['internet', 0], ['firewall', .16], ['router', .3], ['switch', .44], ['server', .59], ['nas', .86], ['server', .9], ['switch', .93], ['users', 1]];
    const i = Math.min(path.length - 2, path.findIndex((point, index) => index < path.length - 1 && t <= path[index + 1][1]));
    ref.current.position.lerpVectors(V(path[i][0]), V(path[i + 1][0]), (t - path[i][1]) / (path[i + 1][1] - path[i][1]));
  });
  return <mesh ref={ref}><sphereGeometry args={[.27, 16, 12]}/><meshBasicMaterial color="#48dfff" transparent opacity={.65} toneMapped={false}/><pointLight color="#48dfff" intensity={5} distance={2}/></mesh>;
}

function ThreatPacket({attackRef, type}) {
  const ref = useRef();
  const core = useRef();
  const ring = useRef();
  const style = THREAT_STYLES[type];
  useFrame(({clock}) => {
    const frame = attackRef.current;
    ref.current.visible = Boolean(frame);
    if (!frame) return;
    const i = Math.min(Math.floor(frame.position), ATTACK_PATH.length - 2);
    ref.current.position.lerpVectors(V(ATTACK_PATH[i]), V(ATTACK_PATH[i + 1]), frame.position - i);
    ref.current.position.z += .65;
    core.current.rotation.z = type === 'malware' ? clock.elapsedTime * 1.8 : Math.sin(clock.elapsedTime * 3) * .12;
    const stopped = frame.stage === 'contained' || frame.stage === 'blocked';
    // Payloads retain their threat colour; only the interception ring turns green.
    core.current.scale.setScalar(frame.stage === 'blocked' ? 1 - (frame.impact || 0) * .85 : 1 + Math.sin(clock.elapsedTime * 5) * .07);
    ring.current.material.color.set(stopped ? '#46e5b4' : style.color);
    ring.current.scale.setScalar(1 + (Math.sin(clock.elapsedTime * 6) + 1) * .18);
    ring.current.rotation.z = type === 'malware' ? -clock.elapsedTime * .8 : Math.PI / 4;
  });
  return <group ref={ref} visible={false}>
    <group ref={core}>{type === 'ransomware' ? <RansomwarePayload/> : <MalwarePayload/>}</group>
    <mesh ref={ring}><ringGeometry args={[.4, .42, type === 'ransomware' ? 4 : 32, 1, 0, type === 'ransomware' ? Math.PI * 2 : Math.PI * 1.65]}/><meshBasicMaterial color={style.color} transparent opacity={.6} side={THREE.DoubleSide} toneMapped={false}/></mesh>
    <Html center position={[0, .63, 0]} zIndexRange={[24, 0]} style={{pointerEvents: 'none'}}><div className="threat-packet-label" data-threat={type} data-design={style.design} style={{color: style.color}}>{type === 'ransomware' ? <LockKeyhole size={10}/> : <Bug size={10}/>} {style.label}</div></Html>
  </group>;
}

function FirewallBoundary({attackRef, stage}) {
  const impact = useRef();
  const blocked = stage === 'blocked';
  const crossing = stage === 'crossing';
  const bypassed = ['bypassed', 'detected', 'lateral', 'contained', 'breach'].includes(stage);
  useFrame(() => {
    if (!impact.current) return;
    const frame = attackRef.current;
    const progress = frame?.stage === 'blocked' ? frame.impact || 0 : 0;
    impact.current.scale.setScalar(1 + progress * 2);
    impact.current.material.opacity = frame?.stage === 'blocked' ? (1 - progress) * .9 : 0;
  });
  const position = V('internet').lerp(V('firewall'), FIREWALL_STOP);
  position.z += .65;
  return <group position={position}>
    {(blocked || crossing) && <Line points={[[0, .7, 0], [.36, .48, 0], [.3, -.23, 0], [0, -.57, 0], [-.3, -.23, 0], [-.36, .48, 0], [0, .7, 0]]} color={blocked ? '#46e5b4' : '#ffbd68'} lineWidth={2} dashed={crossing} dashSize={.1} gapSize={.08} transparent opacity={.8}/>}
    <mesh ref={impact}><ringGeometry args={[.3, .36, 40]}/><meshBasicMaterial color="#73ffd4" transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
    {(blocked || crossing || bypassed) && <Html center position={[.15, -.85, 0]} zIndexRange={[20, 0]} style={{pointerEvents: 'none'}}><div className={`perimeter-label ${blocked ? 'intercepted' : ''}`} data-stage={stage}>{blocked ? 'BLOCKED AT PERIMETER' : crossing ? 'CROSSING FIREWALL' : 'PERIMETER BYPASSED'}<span>{blocked ? 'Internal network not reached' : 'Simulated bypass drill'}</span></div></Html>}
  </group>;
}

const SOC_POSITION = new THREE.Vector3(3.3, 2.8, .2);

function TelemetryLink({source, offset}) {
  const dot = useRef();
  useFrame(({clock}) => dot.current.position.lerpVectors(V(source), SOC_POSITION, (clock.elapsedTime * .23 + offset) % 1));
  return <><Line points={[V(source), SOC_POSITION]} color="#6acbff" dashed dashSize={.07} gapSize={.1} transparent opacity={.3}/><mesh ref={dot}><sphereGeometry args={[.055, 8, 8]}/><meshBasicMaterial color="#6acbff" toneMapped={false}/></mesh></>;
}

function MonitoringHub() {
  return <group>{['firewall', 'switch', 'server', 'users'].map((source, i) => <TelemetryLink key={source} source={source} offset={i / 4}/>)}<group position={SOC_POSITION}><RoundedBox args={[1.5, .6, .3]} radius={.08}><meshStandardMaterial color="#123e64" emissive="#123854"/></RoundedBox><Html center position={[0, .62, 0]} zIndexRange={[20, 0]} style={{pointerEvents: 'none'}}><div className="node-label soc-label">AEGIS ONE · SOC / NOC<span className="safe-label">TELEMETRY ONLINE</span></div></Html><Pulse color="#6acbff"/></group></group>;
}

function SegmentPlanes() {
  return <group>{[
    {p: [-4.2, .15, -.6], s: [3.7, 4.2], t: 'SERVER / STORAGE', c: '#46e5b4'},
    {p: [-.7, 2.5, -.6], s: [4, 2.5], t: 'WIRELESS', c: '#8b78ff'},
    {p: [-4.4, 3.5, -.6], s: [2.6, 1.5], t: 'ENDPOINTS', c: '#48cfff'},
  ].map(zone => <group key={zone.t} position={zone.p}>
    <mesh><planeGeometry args={zone.s}/><meshBasicMaterial color={zone.c} transparent opacity={.055} side={THREE.DoubleSide} depthWrite={false}/></mesh>
    <Line points={[[-zone.s[0]/2, -zone.s[1]/2, 0], [zone.s[0]/2, -zone.s[1]/2, 0], [zone.s[0]/2, zone.s[1]/2, 0], [-zone.s[0]/2, zone.s[1]/2, 0], [-zone.s[0]/2, -zone.s[1]/2, 0]]} color={zone.c} transparent opacity={.22}/>
    <Html center position={[0, -zone.s[1]/2 + .15, 0]} zIndexRange={[15, 0]} style={{pointerEvents: 'none'}}><div className="vlan">{zone.t}</div></Html>
  </group>)}</group>;
}

function RecoverySite() {
  return <group position={[-2.7, -2.2, 0]}>
    <RoundedBox args={[2.1, .8, .4]} radius={.1}><meshStandardMaterial color="#147a68" emissive="#135245"/></RoundedBox>
    <Html center position={[0, .7, 0]} zIndexRange={[20, 0]}><div className="node-label recovery-label">RECOVERY WORKLOAD <span className="safe-label">ONLINE</span></div></Html>
    <Pulse color="#46e5b4"/>
  </group>;
}

function CameraRig() {
  const {size} = useThree();
  useFrame(({camera, pointer}, delta) => {
    const aspect = size.width / Math.max(1, size.height);
    const distance = Math.max(11.5, 7.2 / (Math.tan(THREE.MathUtils.degToRad(43 / 2)) * aspect));
    camera.position.lerp(new THREE.Vector3(-.25 + pointer.x * .1, .45 + pointer.y * .08, distance), 1 - Math.pow(.002, delta));
    camera.lookAt(-.25, .45, 0);
  });
  return null;
}

const Scene = memo(function Scene({defenses, operation, attackRef, attackStage, attackType, scanCount, upgradeStep}) {
  const breached = attackStage === 'breach';
  const recovery = operation?.id === 'recover' || defenses.recover;
  return <>
    <color attach="background" args={['#050b16']}/>
    <ambientLight intensity={.8}/><hemisphereLight args={['#b3dfff', '#202241', 1.4]}/>
    <directionalLight position={[5, 8, 7]} intensity={3} castShadow/>
    <pointLight position={[-4, 4, 4]} color="#6168ff" intensity={20}/><pointLight position={[4, -2, 4]} color="#13bde8" intensity={18}/>
    <gridHelper args={[30, 50, '#162a45', '#101d30']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.3]}/>
    <CameraRig/>
    {LINKS.map(([a, b, type], index) => <NetworkLink key={`${a}-${b}`} {...{a, b, type, index, defenses, upgradeStep}}/>)}
    {Object.keys(POS).map(id => <Device key={id} {...{id, defenses, breached, recovery, scanCount, upgradeStep}} running={operation?.id}/>)}
    {operation?.id === 'assess' && <ScanPulse operation={operation}/>}
    {defenses.build || upgradeStep >= 3 ? <SegmentPlanes/> : <Html center position={[-1.2, -1.7, -.4]} zIndexRange={[15, 0]} style={{pointerEvents: 'none'}}><div className="flat-network">FLAT NETWORK · NO SEGMENTATION</div></Html>}{defenses.recover && <RecoverySite/>}
    {attackStage && <ThreatPacket key={attackType} attackRef={attackRef} type={attackType}/>}
    <FirewallBoundary attackRef={attackRef} stage={attackStage}/>
    {defenses.protect && <MonitoringHub/>}
    <EffectComposer multisampling={0}><Bloom intensity={.8} luminanceThreshold={.55} mipmapBlur/><Vignette eskil={false} offset={.25} darkness={.45}/></EffectComposer>
  </>;
});

function App() {
  const [selected, setSelected] = useState('discover');
  const [defenses, setDefenses] = useState(EMPTY_DEFENSES);
  const [operation, setOperation] = useState(null);
  const [progress, setProgress] = useState(0);
  const [attackOn, setAttackOn] = useState(true);
  const [attackType, setAttackType] = useState('ransomware');
  const [scenario, setScenario] = useState('journey');
  const [socEvent, setSocEvent] = useState(null);
  const [incidents, setIncidents] = useState(0);
  const [attack, setAttack] = useState(null);
  const [wave, setWave] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({attempts: 0, blocked: 0, breaches: 0});
  const [epoch, setEpoch] = useState(0);
  const [compactViewport, setCompactViewport] = useState(false);
  const attackRef = useRef(null);
  const eventId = useRef(0);
  const operationLock = useRef(false);
  const phase = PHASES.find(item => item.id === selected);
  const activePhase = PHASES.find(item => item.id === operation?.id);
  const score = defenses.protect ? 91 : defenses.build ? 76 : defenses.assess ? 54 : null;
  const scenarioMode = resolveScenario(defenses, scenario);
  const threatStyle = THREAT_STYLES[attackType];
  const scanCount = defenses.assess ? FINDINGS.length : operation?.id === 'assess' ? scanCountAt(progress) : 0;
  const upgradeStep = defenses.build ? 4 : operation?.id === 'build' ? Math.floor(progress * 4) : 0;
  const attackRoute = scenarioMode === 'firewall-block' ? 'Internet → Firewall boundary' : defenses.build ? 'Internet → Firewall bypass → Core containment' : 'Internet → Firewall bypass → Core → Server';

  const addEvent = useCallback((label, message, tone = 'info') => {
    setEvents(previous => [{id: ++eventId.current, time: new Date().toLocaleTimeString('en-GB', {hour12: false}), label, message, tone}, ...previous].slice(0, 40));
  }, []);

  useEffect(() => {
    if (!operation) return;
    let lastStep = -1;
    let lastScanCount = 0;
    let lastUpgradeStep = 0;
    const tick = () => {
      const fraction = Math.min((performance.now() - operation.started) / durationFor(operation.id), 1);
      setProgress(fraction);
      const step = Math.min(3, Math.floor(fraction * 4));
      if (step !== lastStep) {lastStep = step; addEvent(activePhase.label, activePhase.steps[step]);}
      if (operation.id === 'assess') {
        const count = scanCountAt(fraction);
        for (let i = lastScanCount; i < count; i++) addEvent('PrismSuite finding', `${FINDINGS[i].label}: ${FINDINGS[i].issue}.`, 'warning');
        lastScanCount = count;
      }
      if (operation.id === 'build') {
        const upgrade = Math.floor(fraction * 4);
        const messages = ['Firewall policy changes staged; enforcement awaits final validation.', 'Managed switch installed with port controls.', 'Server, wireless and user VLANs created.', 'External USB backups replaced with a NAS and scheduled backup jobs; server migration, firewall activation and endpoint EPS deployment complete.'];
        for (let i = lastUpgradeStep; i < upgrade; i++) addEvent('Project One upgrade', messages[i], 'success');
        lastUpgradeStep = upgrade;
      }
      if (fraction >= 1) {
        clearInterval(timer);
        setDefenses(previous => ({...previous, [operation.id]: true}));
        addEvent(activePhase.label, activePhase.result, 'success');
        setOperation(null);
        operationLock.current = false;
      }
    };
    const timer = setInterval(tick, 80);
    tick();
    return () => clearInterval(timer);
  }, [operation, activePhase, addEvent]);

  useEffect(() => {
    attackRef.current = null;
    setAttack(null);
    setSocEvent(null);
    if (!attackOn) return;
    let started = performance.now();
    let lastStage = '';
    let lastMonitorEvent = '';
    const launch = () => {
      setWave(value => value + 1);
      setStats(value => ({...value, attempts: value.attempts + 1}));
    };
    const tick = () => {
      const now = performance.now();
      if (now - started >= WAVE_DURATION) {started = now; lastStage = ''; lastMonitorEvent = ''; launch();}
      const frame = attackFrame(now - started, defenses, attackType, scenario);
      attackRef.current = frame;
      if (frame.stage !== lastStage) {
        lastStage = frame.stage;
        setAttack(frame);
        addEvent('Threat simulation', frame.message, frame.tone);
        if (frame.stage === 'blocked' || frame.stage === 'contained') setStats(value => ({...value, blocked: value.blocked + 1}));
        if (frame.stage === 'breach') setStats(value => ({...value, breaches: value.breaches + 1}));
      }
      const report = monitoringFrame(now - started, frame, defenses);
      if (report && report.id !== lastMonitorEvent) {
        lastMonitorEvent = report.id;
        setSocEvent(report);
        addEvent('Aegis One · SOC/NOC', report.message, report.tone);
        if (report.phase === 'logged') setIncidents(value => value + 1);
      }
    };
    launch(); tick();
    const timer = setInterval(tick, 50);
    return () => {clearInterval(timer); attackRef.current = null;};
  }, [attackOn, attackType, defenses, scenario, epoch, addEvent]);

  const initiate = id => {
    const target = PHASES.find(item => item.id === id);
    if (operationLock.current || defenses[id] || (target.requires && !defenses[target.requires])) return;
    operationLock.current = true;
    setSelected(id); setProgress(0); setOperation({id, started: performance.now()});
    addEvent(target.label, `${target.label} initiated.`);
  };
  const reset = () => {
    operationLock.current = false;
    setOperation(null); setProgress(0); setDefenses(EMPTY_DEFENSES); setSelected('discover'); setScenario('journey');
    setStats({attempts: 0, blocked: 0, breaches: 0}); setWave(0); setEvents([]); setAttackOn(true); setEpoch(value => value + 1);
    setSocEvent(null); setIncidents(0);
    addEvent('System', 'Demo reset. Starting a fresh baseline attack.');
  };
  const toggleAttack = () => {
    setAttackOn(value => !value);
    addEvent('Simulation', attackOn ? 'Threat stream stopped. Simulated workload state cleared.' : 'Threat stream started. Launching a new attack.');
  };
  const status = !attackOn ? 'Threat stream stopped' : ({entry: 'Threat approaching the firewall', crossing: 'Bypass drill: threat crossing the firewall', bypassed: 'Threat bypassed perimeter defenses', lateral: 'Lateral movement after perimeter bypass', detected: 'PrismSuite detected the bypassed threat', breach: 'Simulated workload compromised', contained: 'Project One contained the bypassed threat', blocked: 'Threat blocked before crossing the firewall'}[attack?.stage] || 'Starting threat stream');

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const sync = () => setCompactViewport(query.matches);
    sync();
    query.addEventListener?.('change', sync);
    return () => query.removeEventListener?.('change', sync);
  }, []);

  return <main>
    <header className="app-header"><img src={LOGOS.discover} alt="ITCraft"/><div className="brand"><b>ITCRAFT <span>ONE</span></b><small>LIVE INFRASTRUCTURE EXPERIENCE</small></div><div className="demo-badge"><span/>INTERACTIVE DEMO</div><button className="reset-button" onClick={reset}><RotateCcw size={14}/><span>Reset demo</span></button></header>
    <div className="workspace">
      <section className="topology-panel" aria-label="Live network topology">
        <div className="topology-heading"><div><span className="eyebrow">NETWORK OPERATIONS</span><h1>One network. Every layer, connected.</h1></div><div className="connection-status"><span/>{defenses.recover || operation?.id === 'recover' || attack?.stage === 'breach' ? 'PRIMARY WORKLOAD OFFLINE' : '9 ASSET GROUPS ONLINE'}</div></div>
        <div className="canvas-area"><Canvas shadows={!compactViewport} dpr={compactViewport ? [1, 1.15] : [1, 1.65]} camera={{position: [-.25, .45, 19], fov: 43, far: 150}} gl={{antialias: true, powerPreference: 'high-performance'}}><Suspense fallback={null}><Scene {...{defenses, operation, attackRef, attackType, scanCount, upgradeStep}} attackStage={attack?.stage}/></Suspense></Canvas></div>
        <div className="topology-legend"><span><i className="traffic"/>Normal traffic</span><span style={{color: threatStyle.color}}>{attackType === 'ransomware' ? <LockKeyhole size={12}/> : <Bug size={12}/>} {threatStyle.label}</span><span><i className="protected"/>Protected boundary</span><span className="legend-hint">Hover to inspect an asset</span></div>
        <div className={`threat-status ${attack?.tone || 'info'}`} role="status"><ShieldAlert size={18}/><div><b>{status}</b><span>{attackOn ? `Attempt ${String(wave).padStart(2, '0')} · ${attackType} · ${attackRoute}` : 'Start the stream to watch an attack travel through the topology.'}</span></div>{attackOn && <span className="signal-bars"><i/><i/><i/><i/></span>}</div>
        <div className="network-metrics"><div><span>DEMO SECURITY POSTURE</span><strong>{score ?? '-'}<small>{score ? '/ 100' : 'Awaiting scan'}</small></strong></div><div><span>ATTEMPTS</span><strong>{String(stats.attempts).padStart(2, '0')}</strong></div><div><span>CONTAINED / BLOCKED</span><strong className="green">{String(stats.blocked).padStart(2, '0')}</strong></div><div><span>REACHED WORKLOAD</span><strong className={stats.breaches ? 'red' : ''}>{String(stats.breaches).padStart(2, '0')}</strong></div></div>
        <SimulatedTelemetry attack={attack} stats={stats} defenses={defenses} operation={operation} scanCount={scanCount}/>
        <section className="transformation-panel" aria-label="Infrastructure transformation"><div className="transformation-heading"><div><span className="eyebrow">{defenses.build ? 'TRANSFORMATION COMPLETE' : operation?.id === 'build' ? 'PROJECT ONE · UPGRADING' : defenses.assess ? 'PRISMSUITE · FINDINGS CONFIRMED' : 'THE STARTING POINT'}</span><h2>{defenses.build ? 'The same network. A stronger foundation.' : 'See exactly what changes.'}</h2></div><span>{scanCount} / {FINDINGS.length} findings scanned</span></div><div className="transformation-grid">{FINDINGS.map(item => {
          const state = findingState(item, defenses, operation?.id, progress);
          return <article key={item.id} className={`transformation-item ${state}`} data-finding={item.id} data-state={state}><div><b>{item.label}</b><span>{state === 'resolved' ? 'UPGRADED' : state === 'upgrading' ? 'IN PROGRESS' : state === 'finding' ? 'FINDING' : 'NOT SCANNED'}</span></div><p className="before-state">{item.before}</p><p className="finding-detail">{state === 'unassessed' ? 'PrismSuite will assess this component.' : item.issue}</p><div className="after-state"><ArrowRight size={13}/><span>{item.after}</span>{state === 'resolved' && <Check size={13}/>}</div></article>;
        })}</div></section>
      </section>
      <aside className="control-panel" aria-label="Simulation controls">
        <div className="control-intro"><span className="eyebrow">TAKE CONTROL</span><h2>Bring your defenses online.</h2><p>Start with visibility. Build resilience. Watch the next attack meet its match.</p></div>
        <div className="attack-control"><div className="section-label"><ShieldAlert size={14}/><b>THREAT SIMULATOR</b><span className={attackOn ? 'stream-live' : ''}>{attackOn ? 'RUNNING' : 'STOPPED'}</span></div><div className="attack-inputs"><label className="select-wrap"><span className="sr-only">Threat type</span><select id="threat-type" value={attackType} onChange={event => {setAttackType(event.target.value); addEvent('Simulation', `Switched to ${event.target.value}. ${attackOn ? 'Starting a new attempt.' : 'Launch the stream to run it.'}`);}}><option value="ransomware">Ransomware</option><option value="malware">Malware</option></select><ChevronDown size={13}/></label><button onClick={toggleAttack} aria-label={attackOn ? 'Stop threat stream' : 'Start threat stream'}>{attackOn ? <Square size={12}/> : <Play size={12}/>} {attackOn ? 'Stop' : 'Launch'}</button></div><div className="threat-design-preview" style={{color: threatStyle.color}}>{attackType === 'ransomware' ? <LockKeyhole size={22}/> : <Bug size={22}/>}<span>{threatStyle.description}</span></div><p>Visual simulation · no real threats or traffic</p></div>
        <div className="scenario-control"><label htmlFor="attack-scenario">ATTACK SCENARIO</label><select id="attack-scenario" value={!defenses.build && scenario === 'firewall-block' ? 'journey' : scenario} onChange={event => {setScenario(event.target.value); addEvent('Simulation', attackOn ? 'Scenario changed. Starting a new attempt.' : 'Scenario changed. Launch the stream to run it.');}}><option value="journey">Follow defense journey</option><option value="firewall-block" disabled={!defenses.build}>{defenses.build ? 'Firewall interception' : 'Firewall interception — complete Project One first'}</option><option value="perimeter-bypass">Perimeter bypass drill</option></select><p>{!defenses.build ? 'Before Project One: the simulated threat crosses the firewall and reaches the server. PrismSuite detects exposure; it does not block the attack.' : scenarioMode === 'firewall-block' ? 'After Project One: the reconfigured firewall blocks the simulated threat before it enters the network.' : 'Bypass drill: deliberately bypass the hardened perimeter to test internal detection and segmentation.'}</p><small>{!defenses.build ? 'Firewall blocking unlocks when Project One finishes reconfiguring the policies.' : 'Aegis One monitors and manages the resulting events through SOC/NOC operations.'}</small></div>
        <div className="defense-actions">{PHASES.slice(1).map((item, index) => {
          const complete = defenses[item.id];
          const running = operation?.id === item.id;
          const locked = item.requires && !defenses[item.requires];
          return <div key={item.id} className={`defense-card ${running ? 'running' : ''} ${complete ? 'complete' : ''}`}>
            <div className="defense-title"><span className="step-number">{complete ? <Check size={14}/> : `0${index + 1}`}</span><div><b>{item.label}</b><span>{['Discover & assess', 'Reconfigure & harden', 'SOC / NOC management', 'Isolate & recover'][index]}</span></div><span className="layer-state">{complete ? 'ONLINE' : running ? 'INITIATING' : 'STANDBY'}</span></div>
            <button className="initiate-button" onClick={() => initiate(item.id)} disabled={Boolean(operation) || complete || Boolean(locked)}>{running ? <><span className="spinner"/>{activePhase.steps[Math.min(3, Math.floor(progress * 4))]}</> : complete ? <><Shield size={14}/>{item.id === 'recover' ? 'Recovery workload online' : `${item.label} active`}</> : <><Zap size={14}/>{item.action}<ArrowRight size={14}/></>}</button>
            {locked && <small className="prerequisite">Complete {PHASES.find(p => p.id === item.requires).label} first</small>}
            {running && <div className="operation-progress"><div role="progressbar" aria-label={`${item.label} progress`} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${progress * 100}%`}}/></div><small>{Math.round(progress * 100)}%</small></div>}
          </div>;
        })}</div>
        {defenses.protect && <section className="soc-panel" aria-label="SOC and NOC monitoring"><div className="section-label"><Activity size={14}/><b>AEGIS ONE · SOC / NOC</b></div><strong>{!attackOn ? 'Monitoring · threat stream stopped' : socEvent?.status || 'Connecting telemetry'}</strong><p>{socEvent?.message || 'Monitoring remains connected. Launch a threat to observe incident handling.'}</p><div><span>Incidents tracked <b>{incidents}</b></span><span>NOC service health <b>{operation?.id === 'recover' ? 'Primary outage · restoring' : defenses.recover ? 'Recovery online · primary isolated' : attack?.stage === 'breach' ? 'Workload outage' : 'Services available'}</b></span></div></section>}
        <section className="feed"><div className="section-label"><Terminal size={14}/><b>LIVE EVENT FEED</b><Activity size={14} className="feed-activity"/></div><div className="feed-events" role="log" aria-label="Simulation event feed" aria-live="polite" aria-relevant="additions"><AnimatePresence initial={false}>{events.slice(0, 8).map(event => <motion.div key={event.id} initial={{opacity: 0, x: 10}} animate={{opacity: 1, x: 0}} className={`feed-event ${event.tone}`}><span className="event-dot"/><div><div className="event-meta"><b>{event.label}</b><time>{event.time}</time></div><p>{event.message}</p></div></motion.div>)}</AnimatePresence></div></section>
      </aside>
    </div>
    <footer className="journey"><nav aria-label="Explore the defense layers">{PHASES.map((item, index) => <button key={item.id} onClick={() => setSelected(item.id)} className={selected === item.id ? 'selected' : ''} aria-pressed={selected === item.id}><span>{defenses[item.id] ? <Check size={12}/> : `0${index}`}</span>{item.label}{operation?.id === item.id && <i className="nav-pulse"/>}</button>)}</nav><div className="phase-context"><img src={LOGOS[phase.id]} alt=""/><div><b>{phase.title}</b><p>{phase.copy}</p></div></div></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
