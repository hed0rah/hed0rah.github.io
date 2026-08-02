(function(){
  if(customElements.get('protofun-toggle')) return;
  var svg = '<svg viewBox="0 0 200 420" style="display:block;width:100%;height:100%;overflow:visible">\n  <path class="body" d="M84,10 L116,10 L116,40 L175,40 L175,260 L140,290 L140,330 L120,350 L120,360 L80,360 L80,350 L60,330 L60,290 L25,260 L25,40 L84,40 Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>\n  <line x1="84" y1="40" x2="116" y2="40" stroke="currentColor" stroke-width="4"/>\n  <line x1="30" y1="95" x2="170" y2="95" stroke="currentColor" stroke-width="4"/>\n  <g class="pins" stroke="currentColor" stroke-width="7" stroke-linecap="round">\n    <line x1="35" y1="50" x2="35" y2="76"/>\n    <line x1="53" y1="50" x2="53" y2="76"/>\n    <line x1="71" y1="50" x2="71" y2="76"/>\n    <line x1="89" y1="50" x2="89" y2="76"/>\n    <line x1="111" y1="50" x2="111" y2="76"/>\n    <line x1="129" y1="50" x2="129" y2="76"/>\n    <line x1="147" y1="50" x2="147" y2="76"/>\n    <line x1="165" y1="50" x2="165" y2="76"/>\n  </g>\n  <path class="brow brow-l" d="M52,120 Q68,109 84,118" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>\n  <path class="brow brow-r" d="M116,118 Q132,109 148,120" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>\n  <g class="eyes">\n    <circle cx="70" cy="148" r="16" fill="currentColor"/>\n    <circle cx="130" cy="148" r="16" fill="currentColor"/>\n    <circle cx="74" cy="143" r="5.5" fill="var(--paper)"/>\n    <circle cx="126" cy="143" r="5.5" fill="var(--paper)"/>\n  </g>\n  <g class="happy-eyes">\n    <path d="M55,149 Q70,133 85,149" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>\n    <path d="M115,149 Q130,133 145,149" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>\n  </g>\n  <path class="mouth" d="M78,192 Q100,208 122,192" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>\n  <g class="grooves" stroke="currentColor" stroke-width="6" stroke-linecap="round">\n    <line x1="70" y1="298" x2="130" y2="298"/>\n    <line x1="70" y1="309" x2="130" y2="309"/>\n    <line x1="70" y1="320" x2="130" y2="320"/>\n  </g>\n  <path class="cable" d="M100,360 C100,375 68,378 63,396 C59,410 76,415 86,406" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>\n</svg>';
  var css = `
    :host{display:inline-block;line-height:0}
    button{-webkit-appearance:none;appearance:none;background:none;border:0;padding:3px;margin:0;cursor:pointer;color:inherit;border-radius:6px;line-height:0;display:inline-flex}
    button:focus-visible{outline:2px solid currentColor;outline-offset:3px}
    .box{width:var(--protofun-w,30px);height:var(--protofun-h,63px)}
    .eyes{transition:opacity .2s}
    .happy-eyes{opacity:0;transition:opacity .2s}
    :host([data-on]) .eyes{opacity:0}
    :host([data-on]) .happy-eyes{opacity:1}
    :host([data-on]) .pins line{animation:pin-chase 1.1s ease-in-out infinite}
    :host([data-on]) .pins line:nth-child(1){animation-delay:0s}
    :host([data-on]) .pins line:nth-child(2){animation-delay:.07s}
    :host([data-on]) .pins line:nth-child(3){animation-delay:.14s}
    :host([data-on]) .pins line:nth-child(4){animation-delay:.21s}
    :host([data-on]) .pins line:nth-child(5){animation-delay:.28s}
    :host([data-on]) .pins line:nth-child(6){animation-delay:.35s}
    :host([data-on]) .pins line:nth-child(7){animation-delay:.42s}
    :host([data-on]) .pins line:nth-child(8){animation-delay:.49s}
    @keyframes pin-chase{0%,70%,100%{opacity:1}35%{opacity:.25}}
    @media (prefers-reduced-motion:reduce){.pins line{animation:none}.eyes,.happy-eyes{transition:none}}
  `;
  class ProtofunToggle extends HTMLElement {
    connectedCallback() {
      var root = this.attachShadow({ mode: 'open' });
      root.innerHTML = '<style>' + css + '</style><button type="button" aria-label="Toggle dark mode" title="Toggle dark mode"><span class="box">' + svg + '</span></button>';
      this._btn = root.querySelector('button');
      this._btn.addEventListener('click', () => this.toggle());
      this._sync = (e) => { if (e.target !== this && e.detail) this.toggleAttribute('data-on', e.detail.dark); };
      document.addEventListener('protofun-theme', this._sync);
      var saved = null;
      try { saved = localStorage.getItem('protofun-theme'); } catch (e) {}
      var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(dark, false);
    }
    disconnectedCallback() { if (this._sync) document.removeEventListener('protofun-theme', this._sync); }
    get isDark() { return this.hasAttribute('data-on'); }
    toggle() { this.apply(!this.isDark, true); }
    apply(dark, persist) {
      this.toggleAttribute('data-on', dark);
      var theme = dark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      if (this._btn) this._btn.setAttribute('aria-pressed', String(dark));
      if (persist) { try { localStorage.setItem('protofun-theme', theme); } catch (e) {} }
      this.dispatchEvent(new CustomEvent('protofun-theme', { bubbles: true, composed: true, detail: { theme: theme, dark: dark } }));
    }
  }
  customElements.define('protofun-toggle', ProtofunToggle);
})();
