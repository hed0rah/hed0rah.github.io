// hover.js -- the interaction contract for every protocols-fun inspector.
// One controller per page, shared by every widget on it. Load before the
// page's own script: the page calls HOV synchronously.
//
//   HOV.bind(el, show, restore, pin)  a trigger. show/restore paint the
//                                     page's own inspector; pin is optional.
//   HOV.leave(container, restore)     restore when the pointer leaves a block.
//   HOV.esc(fn)                       Escape cleanup, one per widget.
//
// Open 100ms, close 250ms, asymmetric: a pass-through opens nothing, and
// crossing a gap does not dismiss. Inspector writes coalesce into one frame.
// Pointer-type gated, so touch never hovers. Every trigger focusable, with
// Enter/Space to activate and Escape to release.
window.HOV = window.HOV || (function () {
  var OPEN = 100, CLOSE = 250;
  var ot = null, ct = null, fr = null, q = null, cur = null, curRestore = null;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  function flush() { fr = null; var f = q; q = null; if (f) f(); }
  function frame(fn) { q = fn; if (fr) return; fr = requestAnimationFrame(flush); }
  function mouse(e) { return e.pointerType === "mouse" && fine.matches; }

  // one open at a time, across every widget on the page: whatever is showing
  // is restored now rather than after its own close delay
  function swap(el, show, restore) {
    if (cur && cur !== el && curRestore) curRestore();
    cur = el; curRestore = restore; frame(show);
  }
  function open(el, show, restore) {
    clearTimeout(ct); clearTimeout(ot);
    if (cur === el) return;
    ot = setTimeout(function () { swap(el, show, restore); }, OPEN);
  }
  function shut(restore) {
    clearTimeout(ot); clearTimeout(ct);
    ct = setTimeout(function () { cur = null; curRestore = null; frame(restore); }, CLOSE);
  }

  // the focus ring travels with the behaviour, so a page does not have to
  // keep its own list of trigger class names in sync
  var css = "[data-hov]:focus{outline:none}" +
            "[data-hov]:focus-visible{outline:2px solid var(--enum,currentColor);outline-offset:1px}" +
            "@supports not selector(:focus-visible){" +
            "[data-hov]:focus{outline:2px solid var(--enum,currentColor);outline-offset:1px}}";
  var styled = false;
  function style() {
    if (styled) return;
    styled = true;
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  return {
    bind: function (el, show, restore, pin) {
      style();
      if (el.tabIndex < 0) el.tabIndex = 0;
      el.dataset.hov = "";
      el.addEventListener("pointerenter", function (e) { if (mouse(e)) open(el, show, restore); });
      el.addEventListener("pointerleave", function (e) { if (mouse(e)) shut(restore); });
      el.addEventListener("focus", function () {
        clearTimeout(ot); clearTimeout(ct); swap(el, show, restore);
      });
      el.addEventListener("blur", function () { shut(restore); });
      // a trigger with no pin action still needs tap and Enter/Space, or its
      // payload is unreachable on a touch screen and by keyboard
      var act = pin || function () {
        clearTimeout(ot); clearTimeout(ct); swap(el, show, restore);
      };
      el.addEventListener("click", act);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); }
      });
    },

    leave: function (el, restore) {
      el.addEventListener("pointerleave", function (e) { if (mouse(e)) shut(restore); });
    },

    // several widgets each register one of these. the frame queue holds a
    // single callback, so coalescing here would drop every cleanup but the
    // last. Escape is one discrete action: run it now.
    esc: function (fn) {
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        clearTimeout(ot); clearTimeout(ct);
        cur = null; curRestore = null;
        fn();
      });
    }
  };
})();
