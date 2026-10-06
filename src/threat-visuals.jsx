import React from 'react';
import {RoundedBox} from '@react-three/drei';

export const THREAT_STYLES = {
  ransomware: {label: 'Ransomware', color: '#ff456f', design: 'padlock', description: 'Red padlock · simulated encryption payload'},
  malware: {label: 'Malware', color: '#ffb347', design: 'spiked-bug', description: 'Amber spiked bug · simulated malicious payload'},
};

export function RansomwarePayload() {
  const color = THREAT_STYLES.ransomware.color;
  return <group>
    <RoundedBox args={[.38, .3, .16]} position={[0, -.1, 0]} radius={.04}><meshBasicMaterial color={color} toneMapped={false}/></RoundedBox>
    <mesh position={[0, .09, 0]}><torusGeometry args={[.14, .034, 8, 24, Math.PI]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>
    {[-.14, .14].map(x => <mesh key={x} position={[x, .045, 0]}><cylinderGeometry args={[.034, .034, .09, 8]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>)}
    <mesh position={[0, -.075, .086]}><circleGeometry args={[.04, 16]}/><meshBasicMaterial color="#350b20"/></mesh>
    <mesh position={[0, -.13, .086]}><planeGeometry args={[.035, .075]}/><meshBasicMaterial color="#350b20"/></mesh>
  </group>;
}

export function MalwarePayload() {
  const color = THREAT_STYLES.malware.color;
  return <group>
    <mesh><icosahedronGeometry args={[.18, 1]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>
    {Array.from({length: 8}, (_, i) => {
      const angle = i * Math.PI / 4;
      return <mesh key={i} position={[Math.cos(angle) * .23, Math.sin(angle) * .23, 0]} rotation={[0, 0, angle - Math.PI / 2]}><coneGeometry args={[.044, .18, 5]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>;
    })}
    {[-.055, .055].map(x => <mesh key={x} position={[x, .025, .18]}><circleGeometry args={[.027, 12]}/><meshBasicMaterial color="#36220b"/></mesh>)}
  </group>;
}
