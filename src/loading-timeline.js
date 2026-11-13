// Presentation timing is independent of network transfer. Completion is gated by
// the app's committed first render, its module and its stylesheet being ready.
export const LOADING_TIMING = Object.freeze({
  gather: 3300,
  hold: 150,
  burst: 480,
  title: 700,
  exit: 260,
  reducedTitle: 140,
  reducedExit: 140,
});

export function loadingFrame({ elapsed, readyAt = null, mode = 'full', skipped = false }) {
  const time = Math.max(0, elapsed);
  const ready = Number.isFinite(readyAt) && time >= readyAt;
  const progress = Math.min(94, Math.floor(94 * (1 - Math.pow(1 - Math.min(time / LOADING_TIMING.gather, 1), 1.15))));
  if (!ready) return { stage: 'loading', progress, done: false };
  if (skipped || mode === 'quick') return { stage: 'exiting', progress: 100, done: true };
  if (mode === 'reduced') {
    const phase = time - readyAt;
    if (phase < LOADING_TIMING.reducedTitle) return { stage: 'title', progress: 100, done: false };
    return { stage: 'exiting', progress: 100, done: phase >= LOADING_TIMING.reducedTitle + LOADING_TIMING.reducedExit };
  }
  const phase = time - Math.max(LOADING_TIMING.gather, readyAt);
  if (phase < 0) return { stage: 'loading', progress, done: false };
  if (phase < LOADING_TIMING.hold) return { stage: 'loading', progress: 100, done: false };
  if (phase < LOADING_TIMING.hold + LOADING_TIMING.burst) return { stage: 'burst', progress: 100, done: false };
  if (phase < LOADING_TIMING.hold + LOADING_TIMING.burst + LOADING_TIMING.title) return { stage: 'title', progress: 100, done: false };
  return { stage: 'exiting', progress: 100, done: phase >= LOADING_TIMING.hold + LOADING_TIMING.burst + LOADING_TIMING.title + LOADING_TIMING.exit };
}

export function introMode({ seen, forced = false, reduced = false }) {
  if (seen && !forced) return 'quick';
  return reduced ? 'reduced' : 'full';
}

export function speakingParticipants(progress, elapsed, mode = 'full') {
  const thresholds = [5, 17, 30, 43, 58, 73];
  const visibleCount = thresholds.filter(value => progress >= value).length;
  const firstSpeaker = visibleCount ? Math.floor(elapsed / 430) % visibleCount : -1;
  const speakerCount = progress >= 85 ? 3 : progress >= 70 ? 2 : 1;
  return thresholds.map((threshold, index) => ({
    visible: progress >= threshold,
    speaking: mode === 'full' && index < visibleCount && (index - firstSpeaker + visibleCount) % visibleCount < speakerCount,
  }));
}
