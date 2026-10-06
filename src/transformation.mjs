export const FINDINGS = [
  {id: 'firewall', label: 'Firewall configuration', before: 'Unreviewed firewall rules', issue: 'Overly broad access rules; logging gaps', after: 'Reviewed rules + security logging', scanAt: .16, startAt: 0, finishAt: 1},
  {id: 'switch', label: 'Network switch', before: 'Basic unmanaged switch', issue: 'No managed port controls or VLAN support', after: 'Managed switch + port controls', scanAt: .44, startAt: .25, finishAt: .5},
  {id: 'server', label: 'Application host', before: 'Windows desktop acting as a server', issue: 'Desktop-class host for a business workload', after: 'Dedicated server infrastructure', scanAt: .59, startAt: .75, finishAt: 1},
  {id: 'segmentation', label: 'Network architecture', before: 'One flat network', issue: 'Users, workloads and Wi-Fi share access', after: 'Separate user, server and wireless VLANs', scanAt: .74, startAt: .5, finishAt: .75},
  {id: 'nas', label: 'Backup storage', before: 'External USB drive; manual backup copies', issue: 'Manual backups; no centralized backup schedule', after: 'NAS with scheduled network backups', scanAt: .86, startAt: .75, finishAt: 1},
  {id: 'users', label: 'Endpoint protection', before: 'Basic antivirus / Windows Defender', issue: 'Standalone AV; no centrally managed EDR/XDR', after: 'Managed EPS with EDR/XDR', scanAt: .94, startAt: .75, finishAt: 1},
];

export const durationFor = id => id === 'build' ? 12000 : id === 'assess' ? 8000 : 6400;
export const scanCountAt = progress => FINDINGS.filter(item => progress >= item.scanAt).length;
export function findingState(item, defenses, operation, progress) {
  if (defenses.build) return 'resolved';
  if (operation === 'build') {
    if (progress >= item.finishAt) return 'resolved';
    if (progress >= item.startAt) return 'upgrading';
  }
  if (defenses.assess || (operation === 'assess' && progress >= item.scanAt)) return 'finding';
  return 'unassessed';
}
