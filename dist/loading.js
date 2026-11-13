(()=>{var K=Object.create;var $=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var V=Object.getOwnPropertyNames;var J=Object.getPrototypeOf,Q=Object.prototype.hasOwnProperty;var W=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,a)=>(typeof require<"u"?require:t)[a]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var X=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of V(t))!Q.call(e,r)&&r!==a&&$(e,r,{get:()=>t[r],enumerable:!(n=R(t,r))||n.enumerable});return e};var ee=(e,t,a)=>(a=e!=null?K(J(e)):{},X(t||!e||!e.__esModule?$(a,"default",{value:e,enumerable:!0}):a,e));var ae=[{initials:"\u0410\u041A",x:135,y:125,color:"blue",angle:-5},{initials:"\u041C\u041F",x:465,y:125,color:"peach",angle:5},{initials:"\u0415\u0421",x:72,y:238,color:"mint",angle:-7},{initials:"\u0414\u0412",x:528,y:238,color:"violet",angle:6},{initials:"\u041D\u0410",x:136,y:346,color:"yellow",angle:-4},{initials:"\u0418\u041A",x:464,y:346,color:"rose",angle:4}],te=ae.map((e,t)=>`
  <g class="loader-participant-position" transform="translate(${e.x} ${e.y})">
    <g class="loader-participant loader-participant--${e.color}" data-participant="${t}" style="--voice-delay:${t*-.17}s;--tilt:${e.angle}deg">
      <circle class="loader-voice-ring" r="39" />
      <circle class="loader-avatar" r="31" />
      <text class="loader-initials" y="8">${e.initials}</text>
      <g class="loader-voice" transform="translate(0 41)">
        <rect class="loader-voice-pill" x="-19" y="-9" width="38" height="18" rx="9" />
        <path class="loader-voice-bar" d="M-8-3v6" />
        <path class="loader-voice-bar" d="M0-5v10" />
        <path class="loader-voice-bar" d="M8-2v4" />
      </g>
      <g class="loader-speech" transform="translate(${e.x<300?30:-68} -37)">
        <path d="M6 0h27a6 6 0 016 6v12a6 6 0 01-6 6H14l-8 6v-6a6 6 0 01-6-6V6a6 6 0 016-6Z" />
        <circle cx="11" cy="12" r="1.4" /><circle cx="19.5" cy="12" r="1.4" /><circle cx="28" cy="12" r="1.4" />
      </g>
    </g>
  </g>`).join(""),re=[[-137,-103,-30,"pill"],[-48,-150,35,"dot"],[74,-143,70,"pill"],[151,-66,22,"dot"],[147,54,-45,"pill"],[69,114,20,"dot"],[-73,114,-20,"pill"],[-155,27,-55,"dot"],[-109,-47,70,"line"],[99,-22,-20,"line"],[20,-123,80,"line"],[-18,119,20,"line"]].map(([e,t,a,n],r)=>`<g class="loader-confetti" style="--fly-x:${e}px;--fly-y:${t}px;--fly-rotate:${a}deg;--piece-delay:${r%3*15}ms">${n==="dot"?'<circle r="6" />':n==="pill"?'<rect x="-6" y="-13" width="12" height="26" rx="6" />':'<path d="M-5 0h10" />'}</g>`).join(""),z=`
<section id="service-loader" class="service-loader" data-stage="loading" data-mode="full" aria-label="\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0416\u0443\u0440\u043D\u0430\u043B\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u0439">
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
            ${re}
          </g>
          <g class="loader-participants">${te}</g>
        </svg>
      </div>
      <div data-loader-title class="loader-reveal" aria-hidden="true">
        <span class="loader-brand-mark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M10 23V9m3 13c8-1 10-5 10-12"/><circle cx="10" cy="25" r="4"/><circle cx="10" cy="7" r="4"/><circle cx="23" cy="7" r="4"/></svg></span>
        <h1>\u0416\u0443\u0440\u043D\u0430\u043B \u0440\u0435\u0448\u0435\u043D\u0438\u0439</h1>
        <p>\u0412\u0441\u0451 \u0432\u0430\u0436\u043D\u043E\u0435 \u2014 \u0432\u043D\u0435 \u0433\u043E\u043B\u043E\u0432\u044B.</p>
      </div>
    </div>
    <div class="loader-caption">
      <p class="loader-caption-main">\u0412\u0441\u0435 \u0433\u043E\u0432\u043E\u0440\u044F\u0442. \u041C\u044B \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C.</p>
      <p class="loader-status" data-loader-status role="status" aria-live="polite" aria-atomic="true">\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u043C\u0441\u044F \u043A \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0443</p>
    </div>
    <div data-loader-progressbar class="loader-sr-only" role="progressbar" aria-label="\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u0435\u0440\u0432\u0438\u0441\u0430" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
  </div>
  <div class="loader-actions">
    <button data-loader-skip class="loader-skip" type="button">\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="m7 5 5 5-5 5m7-10v10"/></svg></button>
    <button data-loader-retry class="loader-retry" type="button" hidden>\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0443</button>
  </div>
</section>`;var i=Object.freeze({gather:8410,hold:150,burst:480,title:700,exit:260,reducedTitle:140,reducedExit:140});function C({elapsed:e,readyAt:t=null,mode:a="full",skipped:n=!1}){let r=Math.max(0,e),l=Number.isFinite(t)&&r>=t,u=Math.min(94,Math.floor(94*(1-Math.pow(1-Math.min(r/i.gather,1),1.15))));if(!l)return{stage:"loading",progress:u,done:!1};if(n||a==="quick")return{stage:"exiting",progress:100,done:!0};if(a==="reduced"){let h=r-t;return h<i.reducedTitle?{stage:"title",progress:100,done:!1}:{stage:"exiting",progress:100,done:h>=i.reducedTitle+i.reducedExit}}let d=r-Math.max(i.gather,t);return d<0?{stage:"loading",progress:u,done:!1}:d<i.hold?{stage:"loading",progress:100,done:!1}:d<i.hold+i.burst?{stage:"burst",progress:100,done:!1}:d<i.hold+i.burst+i.title?{stage:"title",progress:100,done:!1}:{stage:"exiting",progress:100,done:d>=i.hold+i.burst+i.title+i.exit}}function L({seen:e,forced:t=!1,reduced:a=!1}){return e&&!t?"quick":a?"reduced":"full"}function A(e,t,a="full"){let n=[5,17,30,43,58,73],r=n.filter(d=>e>=d).length,l=r?Math.floor(t/430)%r:-1,u=e>=85?3:e>=70?2:1;return n.map((d,h)=>({visible:e>=d,speaking:a==="full"&&h<r&&(h-l+r)%r<u}))}var P="team-memory-intro-v1",oe=2e4,p=document.getElementById("root"),k=window.matchMedia("(prefers-reduced-motion: reduce)"),T=!1;try{T=sessionStorage.getItem(P)==="seen"}catch{}var s=L({seen:T,forced:new URLSearchParams(location.search).get("intro")==="1",reduced:k.matches});document.body.insertAdjacentHTML("beforeend",z);document.getElementById("boot-fallback")?.remove();var o=document.getElementById("service-loader"),ie=o.querySelector("[data-loader-head]"),I=o.querySelector("[data-loader-progress]"),B=o.querySelector("[data-loader-progressbar]"),ne=o.querySelector("[data-loader-status]"),v=o.querySelector("[data-loader-skip]"),b=o.querySelector("[data-loader-retry]"),F=[...o.querySelectorAll("[data-participant]")],se=document.body.style.overflow;document.body.style.overflow="hidden";p.inert=!0;p.setAttribute("aria-hidden","true");p.style.visibility="hidden";o.dataset.mode=s;var w=performance.now(),y=null,f=!1,g=!1,m=!1,O=0,M=0,x=-1,j="",E=!1,c=e=>{j!==e&&(j=e,ne.textContent=e)};function Y(){cancelAnimationFrame(O),clearTimeout(M),document.removeEventListener("keydown",H),k.removeEventListener("change",Z),window.removeEventListener("error",N),window.removeEventListener("team-memory:ready",G)}function S(){if(g||m)return;g=!0;let e=E||o.contains(document.activeElement);Y();try{sessionStorage.setItem(P,"seen")}catch{}p.inert=!1,p.removeAttribute("aria-hidden"),p.style.removeProperty("visibility"),document.documentElement.removeAttribute("data-service-loading"),document.body.style.overflow=se,o.remove(),e&&p.querySelector("main")?.focus({preventScroll:!0})}function q(){g||m||(m=!0,Y(),o.dataset.stage="error",F.forEach(e=>{e.dataset.speaking="false"}),c("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."),B?.setAttribute("aria-busy","false"),v.hidden=!0,b.hidden=!1,o.contains(document.activeElement)&&b.focus({preventScroll:!0}))}function N(e){e.filename?.includes("/app.js")&&q()}function Z(e){e.matches&&s==="full"&&(s="reduced",o.dataset.mode=s,x=-1)}function D(){if(!(g||m)){if(f=!0,E=!0,y!==null)return S();o.dataset.mode="quick",v.hidden=!0,c("\u0416\u0443\u0440\u043D\u0430\u043B \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F\u2026")}}function H(e){e.key!=="Escape"||m||(e.preventDefault(),e.stopPropagation(),D())}function U(e){if(g||m)return;let t=e-w,a=C({elapsed:t,readyAt:y,mode:s,skipped:f});if(a.done)return S();a.stage==="exiting"&&o.dataset.stage!=="exiting"&&(p.style.removeProperty("visibility"),document.documentElement.removeAttribute("data-service-loading")),o.dataset.stage=a.stage;let n=f||s==="quick"||a.stage!=="loading";if(n&&document.activeElement===v&&(E=!0),v.hidden=n,x!==a.progress){x=a.progress,I.textContent=`${a.progress}%`,B?.setAttribute("aria-valuenow",String(a.progress));let l=s==="full"?1+.6*a.progress/100:1;ie.setAttribute("transform",`translate(300 290) scale(${l}) translate(-300 -290)`),I.setAttribute("y",String(290-63*l))}let r=A(a.progress,t,f?"quick":s);F.forEach(l=>{let u=r[Number(l.dataset.participant)];l.dataset.visible=String(u?.visible||!1),l.dataset.speaking=String(a.stage==="loading"&&u?.speaking||!1)}),f||s==="quick"?c("\u0416\u0443\u0440\u043D\u0430\u043B \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F\u2026"):a.stage!=="loading"?c("\u0416\u0443\u0440\u043D\u0430\u043B \u0433\u043E\u0442\u043E\u0432"):a.progress===100?c("\u0412\u0441\u0435 \u043C\u044B\u0441\u043B\u0438 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435"):a.progress>=94&&y===null?c("\u0415\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E, \u0436\u0443\u0440\u043D\u0430\u043B \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F\u2026"):a.progress>=66?c("\u0417\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u0433\u043B\u0430\u0432\u043D\u043E\u0435"):a.progress>=30?c("\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u043C\u044B\u0441\u043B\u0438"):c("\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u043C \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432"),O=requestAnimationFrame(U)}var _,le=new Promise(e=>{_=e});function G(){_()}window.addEventListener("team-memory:ready",G,{once:!0});window.addEventListener("error",N);document.addEventListener("keydown",H);k.addEventListener("change",Z);v.addEventListener("click",D);b.addEventListener("click",()=>location.reload());s==="quick"&&(v.hidden=!0);U(w);function de(){return new Promise((e,t)=>{let a=document.createElement("link");a.rel="stylesheet",a.href="/app.css",a.addEventListener("load",e,{once:!0}),a.addEventListener("error",t,{once:!0}),document.head.appendChild(a)})}M=window.setTimeout(q,oe);Promise.all([de(),import("/app.js"),le]).then(()=>{g||m||(clearTimeout(M),y=performance.now()-w,(f||s==="quick")&&S())}).catch(q);})();
