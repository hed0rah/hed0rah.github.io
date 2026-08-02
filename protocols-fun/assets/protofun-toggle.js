// protofun-toggle -- RJ, the protocols-fun / ipv6-fun mascot + light/dark theme toggle.
// One shared component: every page does <script src="assets/protofun-toggle.js"> and gets RJ
// in the header. Theme is light/dark (persisted, synced across toggles on a page). RJ also has
// ambient moods driven by real page state -- no per-page wiring needed:
//   awake (light)  happy ^^ (dark)  transmit (hover: fast pin chase + bounce)
//   sleepy (long idle: droop + Zzz)  no-link (browser offline: red scowl, pins dim)
// Canonical source lives in my-laboratory/reference/rj/; copied file-for-file into each repo's assets/.
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
    <g class="eyes-sleepy">
      <path d="M70,130 Q80,139 90,130" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <path d="M110,130 Q120,139 130,130" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </g>
    <path class="mouth" d="M76,156 Q100,174 124,156" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>
    <path class="mouth-frown" d="M78,168 Q100,154 122,168" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <path class="mouth-sleepy" d="M93,160 Q100,166 107,160" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
    <text class="zzz z1" x="150" y="66" font-size="22" font-weight="600" fill="currentColor">z</text>
    <text class="zzz z2" x="162" y="46" font-size="28" font-weight="600" fill="currentColor">z</text>
    <text class="zzz z3" x="176" y="24" font-size="34" font-weight="600" fill="currentColor">Z</text>
    <g class="sheath" stroke="currentColor" stroke-width="6" stroke-linecap="round">
      <line x1="66" y1="214" x2="134" y2="214"/><line x1="72" y1="226" x2="128" y2="226"/><line x1="78" y1="238" x2="122" y2="238"/>
    </g>
  </svg>`;

  var css = `
    :host{display:inline-block;line-height:0}
    button{-webkit-appearance:none;appearance:none;background:none;border:0;padding:3px;margin:0;cursor:pointer;color:inherit;border-radius:6px;line-height:0;display:inline-flex}
    button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
    .box{width:var(--protofun-w,30px);height:var(--protofun-h,45px)}
    text{font-family:var(--ff,ui-monospace,monospace)}

    /* face state machine: awake by default; alt faces hidden */
    .eyes-happy,.eyes-scowl,.eyes-sleepy,.mouth-frown,.mouth-sleepy,.zzz{display:none}
    /* dark theme = happy */
    :host([data-on]) .eyes{display:none}
    :host([data-on]) .eyes-happy{display:inline}
    /* sleepy overrides theme */
    :host([data-mood="sleepy"]) .eyes,:host([data-mood="sleepy"]) .eyes-happy,:host([data-mood="sleepy"]) .mouth{display:none}
    :host([data-mood="sleepy"]) .eyes-sleepy,:host([data-mood="sleepy"]) .mouth-sleepy,:host([data-mood="sleepy"]) .zzz{display:inline}
    /* no-link overrides everything */
    :host([data-mood="nolink"]){color:#d6483b}
    :host([data-mood="nolink"]) .eyes,:host([data-mood="nolink"]) .eyes-happy,:host([data-mood="nolink"]) .mouth{display:none}
    :host([data-mood="nolink"]) .eyes-scowl,:host([data-mood="nolink"]) .mouth-frown{display:inline}
    :host([data-mood="nolink"]) .pins line{opacity:.3}

    /* ambient blink on open eyes */
    .eyes{transform-box:fill-box;transform-origin:center;animation:pf-blink 5.5s ease-in-out infinite}
    /* pin data-chase: gentle in dark, fast on transmit */
    :host([data-on]) .pins line,:host([data-mood="transmit"]) .pins line{animation:pf-chase 1.3s ease-in-out infinite}
    :host([data-mood="transmit"]) .pins line{animation-duration:.45s}
    .pins line:nth-child(2){animation-delay:.06s}
    .pins line:nth-child(3){animation-delay:.12s}
    .pins line:nth-child(4){animation-delay:.18s}
    .pins line:nth-child(5){animation-delay:.24s}
    .pins line:nth-child(6){animation-delay:.30s}
    .pins line:nth-child(7){animation-delay:.36s}
    .pins line:nth-child(8){animation-delay:.42s}
    /* hover bounce */
    :host([data-mood="transmit"]) .box{animation:pf-bounce .5s ease-in-out}
    /* zzz drift */
    .zzz{transform-box:fill-box;transform-origin:center}
    :host([data-mood="sleepy"]) .zzz{animation:pf-zfloat 3s ease-in-out infinite}
    :host([data-mood="sleepy"]) .z2{animation-delay:.7s}
    :host([data-mood="sleepy"]) .z3{animation-delay:1.4s}

    @keyframes pf-blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
    @keyframes pf-chase{0%,70%,100%{opacity:1}35%{opacity:.2}}
    @keyframes pf-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-8%)}}
    @keyframes pf-zfloat{0%{opacity:0;transform:translateY(8px)}30%{opacity:.85}70%{opacity:.85}100%{opacity:0;transform:translateY(-16px)}}
    @media (prefers-reduced-motion:reduce){
      .eyes,.pins line,.box,.zzz{animation:none}
      :host([data-mood="sleepy"]) .zzz{opacity:.7}
    }
  `;

  var IDLE_MS = 45000;

  class ProtofunToggle extends HTMLElement {
    connectedCallback() {
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + css + '</style><button type="button" aria-label="Toggle dark mode" title="Toggle dark mode"><span class="box">' + svg + '</span></button>';
      this._btn = root.querySelector('button');
      this._hover = false; this._idle = false; this._offline = false;

      this._btn.addEventListener('click', () => this.toggle());
      this._btn.addEventListener('mouseenter', () => { this._hover = true; this.refreshMood(); });
      this._btn.addEventListener('mouseleave', () => { this._hover = false; this.refreshMood(); });

      // long-idle -> sleepy; any activity wakes him
      this._wake = () => {
        if (this._idle) { this._idle = false; this.refreshMood(); }
        clearTimeout(this._idleT);
        this._idleT = setTimeout(() => { this._idle = true; this.refreshMood(); }, IDLE_MS);
      };
      ['pointermove', 'keydown', 'pointerdown', 'scroll'].forEach((e) =>
        document.addEventListener(e, this._wake, { passive: true }));
      this._wake();

      // browser offline -> no-link scowl
      this._netA = () => { this._offline = false; this.refreshMood(); };
      this._netB = () => { this._offline = true; this.refreshMood(); };
      window.addEventListener('online', this._netA);
      window.addEventListener('offline', this._netB);
      this._offline = (navigator.onLine === false);

      // keep multiple toggles on a page in sync
      this._sync = (e) => { if (e.target !== this && e.detail) this.toggleAttribute('data-on', e.detail.dark); };
      document.addEventListener('protofun-theme', this._sync);

      var saved = null;
      try { saved = localStorage.getItem('protofun-theme'); } catch (e) {}
      var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(dark, false);
      this.refreshMood();
    }

    disconnectedCallback() {
      document.removeEventListener('protofun-theme', this._sync);
      ['pointermove', 'keydown', 'pointerdown', 'scroll'].forEach((e) => document.removeEventListener(e, this._wake));
      window.removeEventListener('online', this._netA);
      window.removeEventListener('offline', this._netB);
      clearTimeout(this._idleT);
    }

    // mood priority: no-link (offline) > sleepy (idle) > transmit (hover) > none
    refreshMood() {
      var m = this._offline ? 'nolink' : this._hover ? 'transmit' : this._idle ? 'sleepy' : '';
      if (m) this.setAttribute('data-mood', m); else this.removeAttribute('data-mood');
    }

    get isDark() { return this.hasAttribute('data-on'); }
    toggle() { this.apply(!this.isDark, true); }
    apply(dark, persist) {
      this.toggleAttribute('data-on', dark);
      var theme = dark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      this._btn.setAttribute('aria-pressed', String(dark));
      if (persist) { try { localStorage.setItem('protofun-theme', theme); } catch (e) {} }
      this.dispatchEvent(new CustomEvent('protofun-theme', { bubbles: true, composed: true, detail: { theme: theme, dark: dark } }));
    }
  }
  customElements.define('protofun-toggle', ProtofunToggle);
})();
