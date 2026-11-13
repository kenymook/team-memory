import test from 'node:test';
import assert from 'node:assert/strict';
import { introMode, loadingFrame, speakingParticipants, LOADING_TIMING } from '../src/loading-timeline.js';

test('the intro cannot reach 100% or reveal an unready application', () => {
  for (const mode of ['full', 'quick', 'reduced']) {
    for (const skipped of [false, true]) {
      const frame = loadingFrame({ elapsed: 30000, readyAt: null, mode, skipped });
      assert.equal(frame.progress, 94);
      assert.equal(frame.stage, 'loading');
      assert.equal(frame.done, false);
    }
  }
});

test('a quick app completes the first-view story in exactly ten seconds', () => {
  const at = elapsed => loadingFrame({ elapsed, readyAt: 200 });
  assert.equal(at(0).progress, 0);
  assert.equal(at(8409).stage, 'loading');
  assert.equal(at(8410).progress, 100);
  assert.equal(at(8560).stage, 'burst');
  assert.equal(at(9040).stage, 'title');
  assert.equal(at(9740).stage, 'exiting');
  assert.equal(at(9999).done, false);
  assert.equal(at(10000).done, true);
});

test('late readiness starts the finale only after app, module and CSS are ready', () => {
  const readyAt = 12000;
  assert.equal(loadingFrame({ elapsed: readyAt - 1, readyAt }).progress, 94);
  assert.equal(loadingFrame({ elapsed: readyAt, readyAt }).progress, 100);
  assert.equal(loadingFrame({ elapsed: readyAt + 150, readyAt }).stage, 'burst');
  assert.equal(loadingFrame({ elapsed: readyAt + 1589, readyAt }).done, false);
  assert.equal(loadingFrame({ elapsed: readyAt + 1590, readyAt }).done, true);
});

test('skip and repeat visits remove artificial delay but keep the readiness gate', () => {
  assert.equal(loadingFrame({ elapsed: 20, readyAt: null, skipped: true }).done, false);
  assert.equal(loadingFrame({ elapsed: 20, readyAt: 20, skipped: true }).done, true);
  assert.equal(loadingFrame({ elapsed: 20, readyAt: 20, mode: 'quick' }).done, true);
  assert.equal(introMode({ seen: true }), 'quick');
  assert.equal(introMode({ seen: true, forced: true }), 'full');
  assert.equal(introMode({ seen: true, forced: true, reduced: true }), 'reduced');
});

test('reduced motion omits the burst and uses only a brief title and fade', () => {
  const readyAt = 30;
  assert.equal(loadingFrame({ elapsed: readyAt, readyAt, mode: 'reduced' }).stage, 'title');
  assert.equal(loadingFrame({ elapsed: readyAt + 140, readyAt, mode: 'reduced' }).stage, 'exiting');
  assert.equal(loadingFrame({ elapsed: readyAt + LOADING_TIMING.reducedTitle + LOADING_TIMING.reducedExit, readyAt, mode: 'reduced' }).done, true);
  assert.ok(speakingParticipants(90, 1500, 'reduced').every(participant => !participant.speaking));
});

test('speakers appear in sequence and build up to three simultaneous voices', () => {
  assert.equal(speakingParticipants(0, 0).filter(p => p.visible).length, 0);
  assert.equal(speakingParticipants(30, 700).filter(p => p.visible).length, 3);
  assert.equal(speakingParticipants(50, 1200).filter(p => p.speaking).length, 1);
  assert.equal(speakingParticipants(80, 2300).filter(p => p.speaking).length, 2);
  assert.equal(speakingParticipants(94, 3300).filter(p => p.speaking).length, 3);
});
