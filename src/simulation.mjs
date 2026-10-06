export const WAVE_DURATION = 12000;
export const ATTACK_PATH = ['internet', 'firewall', 'router', 'switch', 'server'];
// Stop outside the firewall chassis, on the incoming internet link.
export const FIREWALL_STOP = .58;

export function resolveScenario(defenses, scenario = 'journey') {
  // No scenario may skip the baseline breach before Project One completes.
  if (!defenses.build) return 'perimeter-bypass';
  return scenario === 'journey' ? 'firewall-block' : scenario;
}

// The packet animation and event feed read this same simulation clock.
export function attackFrame(elapsed, defenses, type = 'ransomware', scenario = 'journey') {
  const time = Math.max(0, Math.min(elapsed, WAVE_DURATION));
  const position = Math.max(0, Math.min((time - 1000) / 2200, 4));
  const mode = resolveScenario(defenses, scenario);
  if (mode === 'firewall-block' && position >= FIREWALL_STOP) {
    return {position: FIREWALL_STOP, impact: Math.min(1, (position - FIREWALL_STOP) * 3), stage: 'blocked', node: 'firewall', tone: 'success', message: `Firewall policy reconfigured by Project One blocked the simulated ${type} before it crossed the perimeter.`};
  }
  if (defenses.build && position >= 3) {
    return {position: 3, stage: 'contained', node: 'switch', tone: 'success', message: 'Project One segmentation denied the server route. Threat contained.'};
  }
  if (position >= 4) {
    return {position: 4, stage: 'breach', node: 'server', tone: 'danger', message: type === 'ransomware' ? 'Simulated ransomware reached Server 1. Workload disrupted.' : 'Simulated malware reached Server 1. Workload compromised.'};
  }
  if (position >= 2) {
    return {position, stage: defenses.assess ? 'detected' : 'lateral', node: 'router', tone: 'danger', message: defenses.assess ? `PrismSuite detected ${type} moving toward the core. Containment is needed.` : 'Suspicious traffic moving laterally toward the server segment.'};
  }
  if (position >= 1.3) {
    return {position, stage: 'bypassed', node: 'firewall', tone: 'danger', message: 'Threat bypassed perimeter defenses in this drill. It is now inside the network; testing internal containment.'};
  }
  if (position >= FIREWALL_STOP) {
    return {position, stage: 'crossing', node: 'firewall', tone: 'warning', message: 'Perimeter bypass drill: simulating a threat crossing the firewall through an allowed connection.'};
  }
  return {position, stage: 'entry', node: 'internet', tone: 'danger', message: `Simulated ${type} approaching the firewall. Scenario: ${mode === 'firewall-block' ? 'firewall interception' : 'perimeter bypass drill'}.`};
}

// Monitoring observes the enforcement result; it never changes the packet route.
export function monitoringFrame(elapsed, attack, defenses) {
  if (!defenses.protect) return null;
  const terminalAt = {blocked: 1000 + FIREWALL_STOP * 2200, contained: 7600, breach: 9800}[attack.stage];
  if (terminalAt === undefined) {
    return {id: 'observing', phase: 'observing', status: 'Monitoring', message: 'SOC/NOC telemetry connected. Watching security events and asset availability.', tone: 'info'};
  }
  const age = elapsed - terminalAt;
  const phase = age < 900 ? 'logged' : age < 1800 ? 'triaged' : 'managed';
  const outcome = attack.stage === 'blocked' ? 'firewall block' : attack.stage === 'contained' ? 'segment containment' : 'workload compromise';
  const details = {
    logged: ['Alert received', `SOC received the ${outcome} event. A simulated incident was opened.`, 'warning'],
    triaged: ['Incident triaged', `SOC correlated the ${outcome} with ${attack.node} telemetry and reviewed the affected asset.`, 'info'],
    managed: attack.stage === 'breach'
      ? ['Escalated', 'SOC escalated the incident for response. NOC flagged the workload outage; recovery is required.', 'danger']
      : ['Verified & tracked', `SOC verified the ${outcome} and tracked the incident. NOC continues monitoring service availability.`, 'success'],
  }[phase];
  return {id: `${attack.stage}:${phase}`, phase, status: details[0], message: details[1], tone: details[2]};
}
