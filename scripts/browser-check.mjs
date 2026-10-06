import {spawn} from 'node:child_process';
import {mkdtemp, readFile, writeFile, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(join(tmpdir(), 'itcraft-browser-'));
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--window-size=1440,1000', 'about:blank',
], {windowsHide: true, stdio: 'ignore'});
let socket;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try {port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break;} catch {await pause(200);}
  }
  assert.ok(port, 'Browser debugging port available');
  const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {socket.onopen = resolve; socket.onerror = reject;});
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.onmessage = ({data}) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
    if (message.id && pending.has(message.id)) {
      const {resolve, reject, timer} = pending.get(message.id);
      clearTimeout(timer); pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
  };
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const current = ++id;
    const timer = setTimeout(() => {pending.delete(current); reject(new Error(`Timeout: ${method}`));}, 20000);
    pending.set(current, {resolve, reject, timer});
    socket.send(JSON.stringify({id: current, method, params}));
  });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', {expression, returnByValue: true});
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async (expression, label, timeout = 18000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {if (await evaluate(expression)) return; await pause(150);}
    throw new Error(`Timed out waiting for ${label}`);
  };
  const click = text => evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes(${JSON.stringify(text)})).click()`);
  const screenshot = async name => {
    const {data} = await command('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false});
    await writeFile(`artifacts/${name}.png`, Buffer.from(data, 'base64'));
  };
  await mkdir('artifacts', {recursive: true});
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', {width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false});
  await command('Page.navigate', {url: process.env.TEST_URL || 'http://127.0.0.1:5173'});
  await until("document.querySelectorAll('.node-label').length === 9", 'rendered topology', 45000);
  const threatType = value => evaluate(`(() => { const select = document.querySelector('#threat-type'); select.value = ${JSON.stringify(value)}; select.dispatchEvent(new Event('change', {bubbles: true})); })()`);
  await until("document.querySelector('.threat-packet-label')?.dataset.design === 'padlock'", 'ransomware padlock');
  await screenshot('ransomware-design');
  await threatType('malware');
  await until("document.querySelector('.threat-packet-label')?.dataset.design === 'spiked-bug'", 'malware design switches live');
  assert.ok(await evaluate("document.querySelector('.threat-design-preview').textContent.includes('Amber spiked bug')"), 'Selector describes the malware design');
  assert.ok(await evaluate("document.querySelector('.topology-legend').textContent.includes('Malware')"), 'Legend follows selected threat');
  await until("document.querySelector('.perimeter-label')?.dataset.stage === 'crossing'", 'malware enters network');
  await screenshot('malware-design');
  await threatType('ransomware');
  await until("document.querySelector('.threat-packet-label')?.dataset.design === 'padlock'", 'ransomware design restored');
  assert.ok(await evaluate("document.querySelector('[data-device=server]').textContent.includes('Windows Desktop')"), 'Baseline uses a desktop as server');
  assert.ok(await evaluate("document.querySelector('[data-device=switch]').textContent.includes('Unmanaged Switch')"), 'Baseline uses an unmanaged switch');
  assert.ok(await evaluate("!!document.querySelector('.flat-network')"), 'Baseline is a flat network');
  assert.equal(await evaluate("document.querySelectorAll('.transformation-item.unassessed').length"), 6, 'Six baseline components await scanning');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('External Backup Drive')"), 'Baseline has external backup storage rather than NAS');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('USB · MANUAL COPIES')"), 'Manual backup connection is labelled');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('BASIC AV / WINDOWS DEFENDER')"), 'Baseline endpoint antivirus is visible');
  assert.equal(await evaluate("document.querySelector('[data-finding=users]').dataset.state"), 'unassessed', 'Endpoint protection awaits assessment');
  const scenario = value => evaluate(`(() => { const select = document.querySelector('#attack-scenario'); select.value = ${JSON.stringify(value)}; select.dispatchEvent(new Event('change', {bubbles: true})); })()`);
  assert.ok(await evaluate("document.querySelector('option[value=\"firewall-block\"]').disabled"), 'Interception locked until Project One completes');
  // Also reproduce a stale or forced selection: engine must still allow the baseline breach.
  await scenario('firewall-block');
  await until("document.querySelector('.perimeter-label')?.dataset.stage === 'crossing'", 'visible firewall crossing');
  await screenshot('firewall-crossing');
  await until("document.querySelector('.perimeter-label')?.dataset.stage === 'bypassed'", 'explicit perimeter bypass');
  await until("document.querySelector('.threat-status').textContent.includes('compromised')", 'bypass reaches workload');
  assert.ok(await evaluate("document.querySelector('.canvas-area').getBoundingClientRect().right <= document.querySelector('.control-panel').getBoundingClientRect().left"), 'Controls do not overlap the canvas');
  await screenshot('desktop-baseline');
  assert.equal(await evaluate("document.querySelector('#attack-scenario').value"), 'journey', 'Unavailable interception selection displays the baseline journey');
  console.log('PASS: interception locked before Project One; even a forced selection breaches');
  await click('Initiate PrismSuite');
  await until("!!document.querySelector('[role=progressbar]')", 'initiation feedback');
  await until("document.querySelectorAll('.transformation-item.finding').length === 1", 'first finding during scan');
  assert.equal(await evaluate("document.querySelectorAll('.transformation-item.resolved').length"), 0, 'Scanning does not upgrade infrastructure');
  await until("document.querySelectorAll('.defense-card.complete').length === 1", 'assessment completion');
  assert.equal(await evaluate("document.querySelectorAll('.transformation-item.finding').length"), 6, 'All six findings confirmed');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('NO CENTRAL BACKUP SCHEDULE')"), 'PrismSuite flags manual backup setup');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('NO MANAGED EDR / XDR')"), 'Assessment flags missing managed EDR/XDR');
  await screenshot('prismsuite-findings');
  await until("document.querySelector('.threat-status').textContent.includes('detected')", 'assessment detects attack');
  await click('Initiate Project One');
  await until("!!document.querySelector('[aria-label=\"Project One progress\"]')", 'Project One reconfiguration in progress');
  assert.ok(await evaluate("document.querySelector('option[value=\"firewall-block\"]').disabled"), 'Initiating alone does not enable interception');
  await until("document.querySelector('[data-device=switch]').dataset.model === 'upgraded'", 'switch upgraded during Project One');
  assert.equal(await evaluate("document.querySelector('[data-device=server]').dataset.model"), 'baseline', 'Server migration follows the switch upgrade');
  await until("document.querySelectorAll('.vlan').length === 3", 'VLANs appear during migration');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('PROVISIONING NAS BACKUPS')"), 'Backup migration is staged during Project One');
  assert.equal(await evaluate("document.querySelector('[data-device=nas]').dataset.model"), 'baseline', 'NAS does not appear before migration completes');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('DEPLOYING EPS + EDR/XDR')"), 'EPS deployment runs during final upgrade stage');
  await until("document.querySelectorAll('.defense-card.complete').length === 2", 'segmentation completion');
  assert.ok(await evaluate("document.querySelector('[data-device=server]').textContent.includes('Dedicated Server')"), 'Desktop replaced with a dedicated server');
  assert.equal(await evaluate("document.querySelectorAll('.transformation-item.resolved').length"), 6, 'All findings resolved');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('NAS / Backup 1')"), 'Project One replaces external drive with NAS');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('SCHEDULED NETWORK BACKUPS')"), 'NAS backup schedule shown');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('MANAGED EPS + EDR/XDR')"), 'Endpoint protection upgrades before Aegis');
  await until("document.querySelector('.threat-status').textContent.includes('blocked')", 'Project One firewall block before Aegis');
  assert.equal(await evaluate("document.querySelector('option[value=\"firewall-block\"]').disabled"), false, 'Interception unlocked after completion');
  assert.equal(await evaluate("document.querySelectorAll('.soc-panel').length"), 0, 'Firewall blocks before SOC/NOC activation');
  await screenshot('project-one-firewall');
  console.log('PASS: initiation progress, assessment detection and Project One firewall enforcement');
  await click('Activate Aegis One');
  await until("document.querySelectorAll('.defense-card.complete').length === 3", 'SOC/NOC activation');
  await until("document.querySelector('.soc-panel')?.textContent.includes('Verified & tracked')", 'SOC incident triage and verification');
  assert.ok(await evaluate("document.querySelector('.threat-status').textContent.includes('blocked')"), 'Project One enforcement continues under Aegis monitoring');
  assert.ok(await evaluate("!!document.querySelector('.soc-label')"), 'SOC/NOC telemetry hub visible');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('AEGIS SOC MONITORED')"), 'Upgraded endpoints connect to SOC monitoring');
  await screenshot('aegis-monitoring');
  await scenario('perimeter-bypass');
  await until("document.querySelector('.threat-status').textContent.includes('contained')", 'forced bypass with all defense layers');
  await until("document.querySelector('.soc-panel')?.textContent.includes('SOC verified the segment containment')", 'SOC observes internal containment');
  await scenario('journey');
  await click('Run recovery drill');
  await until("!!document.querySelector('.recovery-label')", 'recovery workload');
  assert.ok(await evaluate("document.querySelector('.soc-panel').textContent.includes('Recovery online')"), 'NOC reports recovery service health');
  await click('Stop');
  await until("document.querySelector('.threat-status').textContent.includes('stopped')", 'stopped simulation');
  assert.equal(await evaluate("document.querySelectorAll('.threat-packet-label').length"), 0, 'Stopped stream removes the moving threat label');
  await threatType('malware');
  await pause(200);
  assert.equal(await evaluate("document.querySelectorAll('.threat-packet-label').length"), 0, 'Changing design while stopped does not launch a threat');
  await click('Reset demo');
  await click('Initiate PrismSuite');
  await until("!!document.querySelector('[role=progressbar]')", 'restarted operation');
  await click('Reset demo');
  await pause(8500);
  assert.equal(await evaluate("document.querySelectorAll('.defense-card.complete').length"), 0, 'Reset cancels pending operation');
  assert.ok(await evaluate("document.querySelector('option[value=\"firewall-block\"]').disabled"), 'Reset locks interception again');
  assert.equal(await evaluate("document.querySelectorAll('.soc-panel, .soc-label').length"), 0, 'Reset removes SOC/NOC monitoring');
  assert.equal(await evaluate("document.querySelectorAll('.transformation-item.unassessed').length"), 6, 'Reset clears findings and upgrades');
  assert.ok(await evaluate("document.querySelector('[data-device=nas]').textContent.includes('External Backup Drive')"), 'Reset restores external backup disk');
  assert.ok(await evaluate("document.querySelector('[data-device=users]').textContent.includes('BASIC AV / WINDOWS DEFENDER')"), 'Reset restores endpoint baseline');
  assert.equal(await evaluate("document.querySelector('[data-device=server]').dataset.model"), 'baseline', 'Reset restores desktop hardware');
  console.log('PASS: SOC/NOC monitoring, containment alerts, recovery health, stop and reset');
  await command('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
  await pause(1500);
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), 'No mobile horizontal overflow');
  assert.ok(await evaluate("document.querySelector('.control-panel').getBoundingClientRect().top >= document.querySelector('.canvas-area').getBoundingClientRect().bottom"), 'Mobile controls below topology');
  await screenshot('mobile');
  assert.deepEqual(errors, [], 'No browser runtime exceptions');
  console.log('PASS: mobile layout and no browser runtime exceptions');
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({id: 99999, method: 'Browser.close'}));
  socket?.close();
  edge.kill();
}
