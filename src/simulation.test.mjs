import test from 'node:test';
import assert from 'node:assert/strict';
import {attackFrame, WAVE_DURATION, FIREWALL_STOP, monitoringFrame} from './simulation.mjs';

test('a bypass drill visibly crosses the firewall before moving internally', () => {
  assert.equal(attackFrame(0, {}).node, 'internet');
  assert.equal(attackFrame(3200, {}).stage, 'crossing');
  const bypass = attackFrame(4000, {});
  assert.equal(bypass.stage, 'bypassed');
  assert.ok(bypass.position > 1, 'Bypass event occurs after crossing the firewall');
  assert.equal(attackFrame(5400, {}).stage, 'lateral');
  assert.equal(attackFrame(WAVE_DURATION, {}).stage, 'breach');
});

test('assessment detects the threat but does not claim to contain it', () => {
  assert.equal(attackFrame(5400, {assess: true}).stage, 'detected');
  assert.equal(attackFrame(WAVE_DURATION, {assess: true}).stage, 'breach');
});

test('segmentation prevents the packet from ever reaching the server', () => {
  for (let elapsed = 7600; elapsed <= WAVE_DURATION + 1000; elapsed += 100) {
    const frame = attackFrame(elapsed, {assess: true, build: true}, 'ransomware', 'perimeter-bypass');
    assert.equal(frame.stage, 'contained');
    assert.equal(frame.node, 'switch');
    assert.equal(frame.position, 3);
  }
});

test('Project One reconfigures the firewall to block without Aegis', () => {
  for (let elapsed = 3200; elapsed <= WAVE_DURATION; elapsed += 100) {
    const frame = attackFrame(elapsed, {assess: true, build: true});
    assert.equal(frame.stage, 'blocked');
    assert.equal(frame.node, 'firewall');
    assert.equal(frame.position, FIREWALL_STOP);
    assert.ok(frame.position < 1, 'Threat must not penetrate the firewall');
    assert.match(frame.message, /reconfigured by Project One/);
  }
});

test('Aegis monitoring never changes firewall enforcement or packet routing', () => {
  for (const build of [false, true]) {
    for (const scenario of ['journey', 'firewall-block', 'perimeter-bypass']) {
      for (let elapsed = 0; elapsed <= WAVE_DURATION; elapsed += 100) {
        const before = attackFrame(elapsed, {build}, 'malware', scenario);
        const after = attackFrame(elapsed, {build, protect: true}, 'malware', scenario);
        assert.deepEqual(after, before);
      }
    }
  }
});

test('Aegis logs, triages and tracks an existing firewall block', () => {
  const defenses = {build: true, protect: true};
  const reportAt = elapsed => monitoringFrame(elapsed, attackFrame(elapsed, defenses), defenses);
  assert.equal(monitoringFrame(2400, attackFrame(2400, {build: true}), {build: true}), null);
  assert.equal(reportAt(0).phase, 'observing');
  assert.equal(reportAt(2400).phase, 'logged');
  assert.equal(reportAt(3300).phase, 'triaged');
  assert.equal(reportAt(4300).phase, 'managed');
  assert.match(reportAt(4300).message, /SOC verified the firewall block/);
});

test('monitoring escalates a workload compromise rather than claiming protection', () => {
  const defenses = {protect: true};
  const frame = attackFrame(WAVE_DURATION, defenses);
  assert.equal(frame.stage, 'breach');
  const report = monitoringFrame(WAVE_DURATION, frame, defenses);
  assert.equal(report.status, 'Escalated');
  assert.match(report.message, /NOC flagged the workload outage/);
});

test('firewall interception works without requiring Aegis activation', () => {
  for (let time = 2300; time <= WAVE_DURATION; time += 100) {
    const frame = attackFrame(time, {build: true}, 'ransomware', 'firewall-block');
    assert.equal(frame.stage, 'blocked');
    assert.ok(frame.position < 1);
    assert.match(frame.message, /reconfigured by Project One/);
    assert.ok(frame.impact >= 0 && frame.impact <= 1);
  }
});

test('all scenario selections breach before Project One completes', () => {
  for (const scenario of ['journey', 'firewall-block', 'perimeter-bypass']) {
    for (const type of ['malware', 'ransomware']) {
      for (const defenses of [{}, {assess: true}, {assess: true, build: false, protect: true}]) {
        for (let time = 0; time <= WAVE_DURATION; time += 100) {
          const frame = attackFrame(time, defenses, type, scenario);
          assert.notEqual(frame.stage, 'blocked', 'A scenario override must not enable early blocking');
          assert.notEqual(frame.stage, 'contained');
        }
        assert.equal(attackFrame(WAVE_DURATION, defenses, type, scenario).stage, 'breach');
      }
    }
  }
});

test('an explicit bypass drill tests internal containment even with Aegis online', () => {
  const defenses = {assess: true, build: true, protect: true};
  assert.equal(attackFrame(3200, defenses, 'malware', 'perimeter-bypass').stage, 'crossing');
  assert.equal(attackFrame(5400, defenses, 'malware', 'perimeter-bypass').stage, 'detected');
  assert.equal(attackFrame(WAVE_DURATION, defenses, 'malware', 'perimeter-bypass').stage, 'contained');
});

test('both threat types produce matching feed descriptions', () => {
  for (const type of ['malware', 'ransomware']) {
    assert.match(attackFrame(0, {}, type).message, new RegExp(type));
    assert.match(attackFrame(WAVE_DURATION, {}, type).message, new RegExp(type));
    assert.match(attackFrame(WAVE_DURATION, {protect: true}, type).message, new RegExp(type));
  }
});
