// protofun-toggle -- RJ, the protocols-fun / ipv6-fun mascot + 4-theme cycle.
// Click cycles: light -> dark -> amber-CRT -> vaporwave -> light. The two "secret"
// modes (amber/green) light RJ up -- happy eyes + pins racing -- like nibs in acid mode.
// Sets data-theme on <html>; each page's CSS paints the palette. One shared file per repo.
(function () {
  if (customElements.get('protofun-toggle')) return;

  var svg = `<svg viewBox="0 0 200 300" style="display:block;width:100%;height:100%;overflow:visible">
    <rect x="84" y="6" width="32" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="6"/>
    <rect x="60" y="20" width="80" height="58" rx="5" fill="none" stroke="currentColor" stroke-width="8"/>
    <g class="pins" stroke="currentColor" stroke-width="5" stroke-linecap="round">
      <line x1="68" y1="27" x2="68" y2="46"/><line x1="77" y1="27" x2="77" y2="46"/><line x1="86" y1="27" x2="86" y2="46"/><line x1="95" y1="27" x2="95" y2="46"/><line x1="105" y1="27" x2="105" y2="46"/><line x1="114" y1="27" x2="114" y2="46"/><line x1="123" y1="27" x2="123" y2="46"/><line x1="132" y1="27" x2="132" y2="46"/>
    </g>
    <path d="M42,80 L158,80 L158,168 L120,246 L120,290 L80,290 L80,246 L42,168 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>
    <g class="eyes">
      <circle cx="80" cy="130" r="14" fill="currentColor"/><circle cx="120" cy="130" r="14" fill="currentColor"/>
      <circle cx="83" cy="125" r="4.5" fill="var(--paper,#E6EBEE)"/><circle cx="117" cy="125" r="4.5" fill="var(--paper,#E6EBEE)"/>
    </g>
    <g class="eyes-happy">
      <path d="M68,132 Q80,117 92,132" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <path d="M108,132 Q120,117 132,132" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g class="eyes-scowl">
      <line x1="70" y1="126" x2="90" y2="134" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <line x1="110" y1="134" x2="130" y2="126" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </g>
    <path class="mouth" d="M76,156 Q100,174 124,156" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>
    <path class="mouth-frown" d="M78,168 Q100,154 122,168" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <g class="sheath" stroke="currentColor" stroke-width="6" stroke-linecap="round">
      <line x1="66" y1="214" x2="134" y2="214"/><line x1="72" y1="226" x2="128" y2="226"/><line x1="78" y1="238" x2="122" y2="238"/>
    </g>
  </svg>`;

  var css = `
    :host{display:inline-block;line-height:0}
    button{-webkit-appearance:none;appearance:none;background:none;border:0;padding:3px;margin:0;cursor:pointer;color:inherit;border-radius:6px;line-height:0;display:inline-flex}
    button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
    .box{width:var(--protofun-w,30px);height:var(--protofun-h,45px)}
    .eyes-happy,.eyes-scowl,.mouth-frown{display:none}
    /* any non-light theme => happy ^^ eyes */
    :host([data-state="dark"]) .eyes,:host([data-state="amber"]) .eyes,:host([data-state="vapor"]) .eyes{display:none}
    :host([data-state="dark"]) .eyes-happy,:host([data-state="amber"]) .eyes-happy,:host([data-state="vapor"]) .eyes-happy{display:inline}
    /* pins: gentle chase in dark, FAST in the secret amber/green (the rave) */
    :host([data-state="dark"]) .pins line{animation:pf-chase 1.3s ease-in-out infinite}
    :host([data-state="amber"]) .pins line,:host([data-state="vapor"]) .pins line{animation:pf-chase .5s ease-in-out infinite}
    .pins line:nth-child(2){animation-delay:.06s}.pins line:nth-child(3){animation-delay:.12s}
    .pins line:nth-child(4){animation-delay:.18s}.pins line:nth-child(5){animation-delay:.24s}
    .pins line:nth-child(6){animation-delay:.30s}.pins line:nth-child(7){animation-delay:.36s}
    .pins line:nth-child(8){animation-delay:.42s}
    /* ambient blink on the open (light) eyes */
    .eyes{transform-box:fill-box;transform-origin:center;animation:pf-blink 5.5s ease-in-out infinite}
    /* browser offline => scowl */
    :host([data-mood="nolink"]) .eyes,:host([data-mood="nolink"]) .eyes-happy{display:none}
    :host([data-mood="nolink"]) .eyes-scowl,:host([data-mood="nolink"]) .mouth-frown{display:inline}
    :host([data-mood="nolink"]) .mouth{display:none}
    :host([data-mood="nolink"]){color:#d6483b}
    :host([data-mood="nolink"]) .pins line{opacity:.3;animation:none}
    @keyframes pf-chase{0%,70%,100%{opacity:1}35%{opacity:.2}}
    @keyframes pf-blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
    @media (prefers-reduced-motion:reduce){.pins line,.eyes{animation:none}}
  `;

  var STATES = ['light', 'dark', 'amber', 'vapor'];

  class ProtofunToggle extends HTMLElement {
    connectedCallback() {
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + css + '</style><button type="button" aria-label="Cycle theme: light, dark, amber CRT, vaporwave" title="Theme (click to cycle)"><span class="box">' + svg + '</span></button>';
      this._btn = root.querySelector('button');
      this._btn.addEventListener('click', () => this.cycle());
      this._sync = (e) => { if (e.target !== this && e.detail && e.detail.theme) this.apply(e.detail.theme, false); };
      document.addEventListener('protofun-theme', this._sync);
      this._netOff = () => this.setAttribute('data-mood', 'nolink');
      this._netOn = () => this.removeAttribute('data-mood');
      window.addEventListener('offline', this._netOff);
      window.addEventListener('online', this._netOn);
      if (navigator.onLine === false) this.setAttribute('data-mood', 'nolink');
      var saved = null;
      try { saved = localStorage.getItem('protofun-theme'); } catch (e) {}
      var initial = STATES.indexOf(saved) >= 0 ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      this.apply(initial, false);
    }
    disconnectedCallback() {
      document.removeEventListener('protofun-theme', this._sync);
      window.removeEventListener('offline', this._netOff);
      window.removeEventListener('online', this._netOn);
    }
    get state() { return this.getAttribute('data-state') || 'light'; }
    cycle() { this.apply(STATES[(STATES.indexOf(this.state) + 1) % STATES.length], true); }
    apply(state, persist) {
      if (STATES.indexOf(state) < 0) state = 'light';
      this.setAttribute('data-state', state);
      document.documentElement.setAttribute('data-theme', state);
      this._btn.setAttribute('aria-pressed', String(state !== 'light'));
      if (persist) { try { localStorage.setItem('protofun-theme', state); } catch (e) {} }
      this.dispatchEvent(new CustomEvent('protofun-theme', { bubbles: true, composed: true, detail: { theme: state } }));
    }
  }
  customElements.define('protofun-toggle', ProtofunToggle);
})();
