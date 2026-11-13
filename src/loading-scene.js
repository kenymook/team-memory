const voices = [
  { initials: 'АК', x: 135, y: 125, color: 'blue', angle: -5 },
  { initials: 'МП', x: 465, y: 125, color: 'peach', angle: 5 },
  { initials: 'ЕС', x: 72, y: 238, color: 'mint', angle: -7 },
  { initials: 'ДВ', x: 528, y: 238, color: 'violet', angle: 6 },
  { initials: 'НА', x: 136, y: 346, color: 'yellow', angle: -4 },
  { initials: 'ИК', x: 464, y: 346, color: 'rose', angle: 4 },
];

const participants = voices.map((person, i) => `
  <g class="loader-participant-position" transform="translate(${person.x} ${person.y})">
    <g class="loader-participant loader-participant--${person.color}" data-participant="${i}" style="--voice-delay:${i * -0.17}s;--tilt:${person.angle}deg">
      <circle class="loader-voice-ring" r="39" />
      <circle class="loader-avatar" r="31" />
      <text class="loader-initials" y="8">${person.initials}</text>
      <g class="loader-voice" transform="translate(0 41)">
        <rect class="loader-voice-pill" x="-19" y="-9" width="38" height="18" rx="9" />
        <path class="loader-voice-bar" d="M-8-3v6" />
        <path class="loader-voice-bar" d="M0-5v10" />
        <path class="loader-voice-bar" d="M8-2v4" />
      </g>
      <g class="loader-speech" transform="translate(${person.x < 300 ? 30 : -68} -37)">
        <path d="M6 0h27a6 6 0 016 6v12a6 6 0 01-6 6H14l-8 6v-6a6 6 0 01-6-6V6a6 6 0 016-6Z" />
        <circle cx="11" cy="12" r="1.4" /><circle cx="19.5" cy="12" r="1.4" /><circle cx="28" cy="12" r="1.4" />
      </g>
    </g>
  </g>`).join('');

const burstPieces = [
  [-137, -103, -30, 'pill'], [-48, -150, 35, 'dot'], [74, -143, 70, 'pill'], [151, -66, 22, 'dot'],
  [147, 54, -45, 'pill'], [69, 114, 20, 'dot'], [-73, 114, -20, 'pill'], [-155, 27, -55, 'dot'],
  [-109, -47, 70, 'line'], [99, -22, -20, 'line'], [20, -123, 80, 'line'], [-18, 119, 20, 'line'],
].map(([x,y,angle,kind], i) => `<g class="loader-confetti" style="--fly-x:${x}px;--fly-y:${y}px;--fly-rotate:${angle}deg;--piece-delay:${i % 3 * 15}ms">${kind === 'dot' ? '<circle r="6" />' : kind === 'pill' ? '<rect x="-6" y="-13" width="12" height="26" rx="6" />' : '<path d="M-5 0h10" />'}</g>`).join('');

export default `
<section id="service-loader" class="service-loader" data-stage="loading" data-mode="full" aria-label="Загрузка Журнала решений">
  <div class="loader-content">
    <div class="loader-stage">
      <div data-loader-scene class="loader-scene">
        <svg id="loader-art" class="loader-art" viewBox="0 0 600 440" fill="none" aria-hidden="true" focusable="false">
          <ellipse class="loader-ground" cx="300" cy="400" rx="104" ry="7" />
          <g class="loader-person-body">
            <path class="loader-shirt" d="M211 385v-30c0-26 17-40 45-47l27-8h34l27 8c28 7 45 21 45 47v30a13 13 0 01-13 13H224a13 13 0 01-13-13Z" />
            <path class="loader-shirt-seam" d="M238 359v34M362 359v34M258 311c8 21 20 32 42 32s34-11 42-32" />
            <path class="loader-neck" d="M280 282v29c0 13 9 23 20 23s20-10 20-23v-29" />
            <path class="loader-collar" d="M272 307c1 20 12 34 28 34s27-14 28-34" />
            <path class="loader-shirt-detail" d="M284 368h32" />
          </g>
          <g class="loader-person-head">
            <g data-loader-head transform="translate(300 290) scale(1) translate(-300 -290)">
              <path class="loader-ear" d="M236 245c-16-8-19 13-11 23 3 4 7 5 12 3M364 245c16-8 19 13 11 23-3 4-7 5-12 3" />
              <path class="loader-head-shape" d="M235 232c0-40 23-65 65-65s65 25 65 65v25c0 31-25 56-65 56s-65-25-65-56Z" />
              <path class="loader-hair" d="M235 232c-8-33 5-61 30-70 17-7 36-5 50-1 21-6 39 1 48 18 10 18 9 36 2 53l-6-25c-24 3-47-3-60-18-14 15-34 20-57 17Z" />
              <path class="loader-hair-line" d="M269 168c14 0 23 5 30 13M324 170c10 3 16 9 20 17" />
              <g class="loader-face">
                <path class="loader-eyebrow loader-eyebrow-left" d="M261 248c6-3 12-3 18 0" />
                <path class="loader-eyebrow loader-eyebrow-right" d="M321 248c6-3 12-3 18 0" />
                <path class="loader-eye" d="M270 260v4M330 260v4" />
                <path class="loader-nose" d="M301 261l-3 13h6" />
                <path class="loader-mouth" d="M289 287c7 4 15 4 22 0" />
                <path class="loader-cheek" d="M251 276h9M340 276h9" />
              </g>
            </g>
            <text data-loader-progress class="loader-percent" x="300" y="227">0%</text>
          </g>
          <g class="loader-burst" transform="translate(300 216)">
            <circle class="loader-burst-ring" r="43" />
            <path class="loader-puff" d="M-76-8C-100-32-79-62-52-54C-55-87-17-100 1-74C20-104 54-84 52-57C84-74 108-42 87-20C118 0 105 37 75 36C88 69 53 93 30 70C9 99-25 83-28 58C-61 77-89 50-72 26C-103 21-111-9-76-8Z" />
            ${burstPieces}
          </g>
          <g class="loader-participants">${participants}</g>
        </svg>
      </div>
      <div data-loader-title class="loader-reveal" aria-hidden="true">
        <span class="loader-brand-mark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M10 23V9m3 13c8-1 10-5 10-12"/><circle cx="10" cy="25" r="4"/><circle cx="10" cy="7" r="4"/><circle cx="23" cy="7" r="4"/></svg></span>
        <h1>Журнал решений</h1>
        <p>Всё важное — вне головы.</p>
      </div>
    </div>
    <div class="loader-caption">
      <p class="loader-caption-main">Все говорят. Мы запоминаем.</p>
      <p class="loader-status" data-loader-status role="status" aria-live="polite" aria-atomic="true">Подключаемся к разговору</p>
    </div>
    <div data-loader-progressbar class="loader-sr-only" role="progressbar" aria-label="Загрузка сервиса" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
  </div>
  <div class="loader-actions">
    <button data-loader-skip class="loader-skip" type="button">Пропустить <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="m7 5 5 5-5 5m7-10v10"/></svg></button>
    <button data-loader-retry class="loader-retry" type="button" hidden>Повторить загрузку</button>
  </div>
</section>`;
