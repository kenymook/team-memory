import scene from './loading-scene.js';
import './loading-screen.css';
import { introMode, loadingFrame, speakingParticipants } from './loading-timeline.js';

const SESSION_KEY = 'team-memory-intro-v1';
const LOAD_TIMEOUT = 20000;
const root = document.getElementById('root');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let seen = false;
try { seen = sessionStorage.getItem(SESSION_KEY) === 'seen'; } catch {}
let mode = introMode({ seen, forced: new URLSearchParams(location.search).get('intro') === '1', reduced: reducedMotion.matches });

document.body.insertAdjacentHTML('beforeend', scene);
document.getElementById('boot-fallback')?.remove();
const loader = document.getElementById('service-loader');
const head = loader.querySelector('[data-loader-head]');
const progressText = loader.querySelector('[data-loader-progress]');
const progressBar = loader.querySelector('[data-loader-progressbar]');
const status = loader.querySelector('[data-loader-status]');
const skip = loader.querySelector('[data-loader-skip]');
const retry = loader.querySelector('[data-loader-retry]');
const participants = [...loader.querySelectorAll('[data-participant]')];
const previousOverflow = document.body.style.overflow;
document.body.style.overflow = 'hidden';
root.inert = true;
root.setAttribute('aria-hidden', 'true');
root.style.visibility = 'hidden';
loader.dataset.mode = mode;

let startedAt = performance.now();
let readyAt = null;
let skipped = false;
let finished = false;
let failed = false;
let frameId = 0;
let timeoutId = 0;
let lastProgress = -1;
let lastStatus = '';
let returnFocusToApp = false;

const say = message => {
  if (lastStatus === message) return;
  lastStatus = message;
  status.textContent = message;
};

function cleanup() {
  cancelAnimationFrame(frameId);
  clearTimeout(timeoutId);
  document.removeEventListener('keydown', onKeyDown);
  reducedMotion.removeEventListener('change', onMotionPreference);
  window.removeEventListener('error', onRuntimeError);
  window.removeEventListener('team-memory:ready', onAppMounted);
}

function finish() {
  if (finished || failed) return;
  finished = true;
  const restoreFocus = returnFocusToApp || loader.contains(document.activeElement);
  cleanup();
  try { sessionStorage.setItem(SESSION_KEY, 'seen'); } catch {}
  root.inert = false;
  root.removeAttribute('aria-hidden');
  root.style.removeProperty('visibility');
  document.documentElement.removeAttribute('data-service-loading');
  document.body.style.overflow = previousOverflow;
  loader.remove();
  if (restoreFocus) root.querySelector('main')?.focus({ preventScroll: true });
}

function fail() {
  if (finished || failed) return;
  failed = true;
  cleanup();
  loader.dataset.stage = 'error';
  participants.forEach(participant => { participant.dataset.speaking = 'false'; });
  say('Не удалось загрузить GigaTeams. Проверьте соединение и попробуйте ещё раз.');
  progressBar?.setAttribute('aria-busy', 'false');
  skip.hidden = true;
  retry.hidden = false;
  if (loader.contains(document.activeElement)) retry.focus({ preventScroll: true });
}

function onRuntimeError(event) {
  if (event.filename?.includes('/app.js')) fail();
}

function onMotionPreference(event) {
  if (event.matches && mode === 'full') {
    mode = 'reduced';
    loader.dataset.mode = mode;
    lastProgress = -1;
  }
}

function requestSkip() {
  if (finished || failed) return;
  skipped = true;
  returnFocusToApp = true;
  if (readyAt !== null) return finish();
  loader.dataset.mode = 'quick';
  skip.hidden = true;
  say('GigaTeams загружается…');
}

function onKeyDown(event) {
  if (event.key !== 'Escape' || failed) return;
  event.preventDefault();
  event.stopPropagation();
  requestSkip();
}

function draw(now) {
  if (finished || failed) return;
  const elapsed = now - startedAt;
  const frame = loadingFrame({ elapsed, readyAt, mode, skipped });
  if (frame.done) return finish();
  if (frame.stage === 'exiting' && loader.dataset.stage !== 'exiting') {
    root.style.removeProperty('visibility');
    document.documentElement.removeAttribute('data-service-loading');
  }
  loader.dataset.stage = frame.stage;
  const hideSkip = skipped || mode === 'quick' || frame.stage !== 'loading';
  if (hideSkip && document.activeElement === skip) returnFocusToApp = true;
  skip.hidden = hideSkip;
  if (lastProgress !== frame.progress) {
    lastProgress = frame.progress;
    progressText.textContent = `${frame.progress}%`;
    progressBar?.setAttribute('aria-valuenow', String(frame.progress));
    const scale = mode === 'full' ? 1 + 1.15 * Math.pow(frame.progress / 100, 1.25) : 1;
    head.setAttribute('transform', `translate(300 290) scale(${scale}) translate(-300 -290)`);
    progressText.setAttribute('y', String(290 - 63 * scale));
    const heat = mode === 'full' ? Math.pow(frame.progress / 100, 1.4) : 0;
    const baseSkin = document.documentElement.dataset.theme === 'dark' ? [232, 223, 206] : [242, 231, 212];
    const hotSkin = [229, 99, 107];
    head.style.setProperty('--intro-skin-live', 'rgb(' + baseSkin.map((value, index) => Math.round(value + (hotSkin[index] - value) * heat)).join(',') + ')');
    head.style.setProperty('--loader-blush', String(heat * 0.78));
  }
  const voices = speakingParticipants(frame.progress, elapsed, skipped ? 'quick' : mode);
  participants.forEach(participant => {
    const voice = voices[Number(participant.dataset.participant)];
    participant.dataset.visible = String(voice?.visible || false);
    participant.dataset.speaking = String(frame.stage === 'loading' && voice?.speaking || false);
  });
  if (skipped || mode === 'quick') say('GigaTeams загружается…');
  else if (frame.stage !== 'loading') say('GigaTeams готов');
  else if (frame.progress === 100) say('Все мысли на месте');
  else if (frame.progress >= 94 && readyAt === null) say('Ещё немного, GigaTeams загружается…');
  else if (frame.progress >= 66) say('Запоминаем главное');
  else if (frame.progress >= 30) say('Собираем мысли');
  else say('Подключаем участников');
  frameId = requestAnimationFrame(draw);
}

let resolveMounted;
const mounted = new Promise(resolve => { resolveMounted = resolve; });
function onAppMounted() { resolveMounted(); }
window.addEventListener('team-memory:ready', onAppMounted, { once: true });
window.addEventListener('error', onRuntimeError);
document.addEventListener('keydown', onKeyDown);
reducedMotion.addEventListener('change', onMotionPreference);
skip.addEventListener('click', requestSkip);
retry.addEventListener('click', () => location.reload());
if (mode === 'quick') skip.hidden = true;
draw(startedAt);

function loadStyles() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/app.css';
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', reject, { once: true });
    document.head.appendChild(link);
  });
}

timeoutId = window.setTimeout(fail, LOAD_TIMEOUT);
Promise.all([loadStyles(), import('/app.js'), mounted]).then(() => {
  if (finished || failed) return;
  clearTimeout(timeoutId);
  readyAt = performance.now() - startedAt;
  if (skipped || mode === 'quick') finish();
}).catch(fail);
