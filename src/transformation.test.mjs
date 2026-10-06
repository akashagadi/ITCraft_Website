import test from 'node:test';
import assert from 'node:assert/strict';
import {FINDINGS, findingState, scanCountAt, durationFor} from './transformation.mjs';

test('findings appear sequentially during assessment, without repairing equipment', () => {
  assert.equal(scanCountAt(0), 0);
  assert.equal(scanCountAt(.2), 1);
  assert.equal(scanCountAt(.5), 2);
  assert.equal(scanCountAt(.65), 3);
  assert.equal(scanCountAt(.8), 4);
  assert.equal(scanCountAt(.9), 5);
  assert.equal(scanCountAt(1), 6);
  for (const item of FINDINGS) {
    assert.equal(findingState(item, {}, null, 0), 'unassessed');
    assert.equal(findingState(item, {}, 'assess', item.scanAt - .01), 'unassessed');
    assert.equal(findingState(item, {}, 'assess', item.scanAt), 'finding');
    assert.equal(findingState(item, {assess: true}, null, 0), 'finding');
  }
});

test('Project One upgrades switch and VLANs in order, validating firewall last', () => {
  const at = (id, progress) => findingState(FINDINGS.find(item => item.id === id), {assess: true}, 'build', progress);
  assert.equal(at('firewall', .1), 'upgrading');
  assert.equal(at('switch', .1), 'finding');
  assert.equal(at('switch', .3), 'upgrading');
  assert.equal(at('switch', .5), 'resolved');
  assert.equal(at('segmentation', .5), 'upgrading');
  assert.equal(at('segmentation', .75), 'resolved');
  assert.equal(at('server', .8), 'upgrading');
  assert.equal(at('users', .7), 'finding');
  assert.equal(at('users', .8), 'upgrading');
  assert.equal(at('users', .99), 'upgrading');
  assert.equal(at('nas', .7), 'finding');
  assert.equal(at('nas', .8), 'upgrading');
  assert.equal(at('nas', .99), 'upgrading');
  assert.equal(at('firewall', .99), 'upgrading');
  for (const item of FINDINGS) assert.equal(at(item.id, 1), 'resolved');
});

test('completed upgrades persist and reset restores the unassessed baseline', () => {
  for (const item of FINDINGS) {
    assert.equal(findingState(item, {assess: true, build: true}, null, 0), 'resolved');
    assert.equal(findingState(item, {}, null, 0), 'unassessed');
  }
  assert.equal(durationFor('assess'), 8000);
  assert.equal(durationFor('build'), 12000);
});
