// nav.js -- getting back out of a long page.
//
// These pages run thousands of pixels with the only exit in the footer, so a
// reader deep in a tab has to scroll past everything to leave. This adds a
// small sticky breadcrumb that appears once the masthead is gone, and makes
// the masthead's own "PROTOCOLS-FUN ." prefix a real link while it is visible.
//
// Set data-nav-root on the script tag to point at the map from this page's
// depth, e.g. <script src="../assets/nav.js" data-nav-root=".."></script>
(function () {
  var me = document.currentScript;
  var root = (me && me.getAttribute('data-nav-root')) || '.';
  var map = root.replace(/\/$/, '') + '/index.html';

  // the masthead prefix is already a breadcrumb, it just was not a link
  var sys = document.querySelector('.head .sysmark');
  if (sys) {
    var txt = sys.textContent;
    var dot = txt.indexOf('.');
    if (dot > 0) {
      var head = txt.slice(0, dot).trim();
      var rest = txt.slice(dot);
      sys.textContent = '';
      var a = document.createElement('a');
      a.href = map;
      a.textContent = head;
      a.className = 'crumb';
      sys.appendChild(a);
      sys.appendChild(document.createTextNode(' ' + rest));
    }
  }

  var css = '.head .sysmark a.crumb{color:inherit;text-decoration:none;' +
            'border-bottom:1px solid var(--line)}' +
            '.head .sysmark a.crumb:hover{color:var(--enum);border-color:var(--enum)}' +
            // visibility is display, never opacity: if a transition does not run,
            // an opacity-hidden link is invisible and still clickable
            '#navback{position:fixed;left:14px;bottom:14px;z-index:60;display:none;' +
            'align-items:center;gap:7px;' +
            'font-family:var(--ff);font-size:0.62rem;letter-spacing:0.16em;' +
            'text-transform:uppercase;text-decoration:none;' +
            'color:var(--soft);background:var(--panel);' +
            'border:1px solid var(--line);border-radius:2px;padding:7px 11px;' +
            'transition:border-color .12s,color .12s}' +
            '#navback.on{display:inline-flex;animation:navin .15s ease-out}' +
            '@keyframes navin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
            '#navback:hover{color:var(--enum);border-color:var(--enum)}' +
            '#navback:focus-visible{outline:2px solid var(--enum);outline-offset:2px}' +
            '@media(prefers-reduced-motion:reduce){#navback{transition:none}#navback.on{animation:none}}' +
            '@media print{#navback{display:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var back = document.createElement('a');
  back.id = 'navback';
  back.href = map;
  back.innerHTML = '<span aria-hidden="true">&#9666;</span> the map';
  document.body.appendChild(back);

  // show it once the masthead has scrolled away, so it never competes with
  // the breadcrumb that is already on screen
  var head = document.querySelector('.head');
  var trigger = function () {
    var gone = head ? head.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
    back.classList.toggle('on', gone);
  };
  var frame = null;
  addEventListener('scroll', function () {
    if (frame) return;
    frame = requestAnimationFrame(function () { frame = null; trigger(); });
  }, { passive: true });
  trigger();
})();
