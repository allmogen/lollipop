// ==UserScript==
// @name         Ísland.is – Veðbönd Já -> Nei (by position, keeps font)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Changes only the value under "Veðbönd" from Já to Nei on min-okutaeki pages, without touching "Tryggt" or changing typography.
// @match        https://island.is/minarsidur/eignir/okutaeki/min-okutaeki/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LABEL = 'Veðbönd';
  const FROM = 'Já';
  const TO = 'Nei';

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 &&
      r.top < (window.innerHeight || document.documentElement.clientHeight) &&
      r.left < (window.innerWidth || document.documentElement.clientWidth);
  }

  function textTrim(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function replaceTextNodeOnly(el, from, to) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) {
      if ((n.nodeValue || '').includes(from)) {
        n.nodeValue = n.nodeValue.replace(from, to);
        return true;
      }
    }
    return false;
  }

  function changeVedbondOnly() {
    // 1) Find the "Veðbönd" label element
    const labelEls = Array.from(document.querySelectorAll('p, span, div, dt, th, h1, h2, h3, h4, h5'))
      .filter(el => isVisible(el) && textTrim(el) === LABEL);

    if (!labelEls.length) return;

    for (const labelEl of labelEls) {
      const lr = labelEl.getBoundingClientRect();
      const labelCenterX = lr.left + lr.width / 2;

      // 2) Find all visible elements that are exactly "Já"
      const yesEls = Array.from(document.querySelectorAll('p, span, div, dd, td'))
        .filter(el => isVisible(el) && textTrim(el) === FROM);

      if (!yesEls.length) continue;

      // 3) Choose the "Já" that is:
      //    - below the label
      //    - horizontally closest to the label (same column)
      //    - with smallest distance score
      let best = null;
      let bestScore = Infinity;

      for (const yEl of yesEls) {
        const yr = yEl.getBoundingClientRect();

        // must be below label
        if (yr.top < lr.bottom - 2) continue;

        const yCenterX = yr.left + yr.width / 2;
        const dx = Math.abs(yCenterX - labelCenterX);
        const dy = Math.max(0, yr.top - lr.bottom);

        // Reject candidates that are clearly in the other column:
        // if dx is more than ~40% of screen width, it's probably the right column.
        if (dx > (window.innerWidth * 0.40)) continue;

        // Score: prefer same column (dx) + prefer close below (dy)
        const score = dx * 2 + dy;

        if (score < bestScore) {
          bestScore = score;
          best = yEl;
        }
      }

      if (best) {
        // 4) Replace only the text node so the font/style stays identical
        if (replaceTextNodeOnly(best, FROM, TO)) return;
      }
    }
  }

  // React/SPA: re-apply occasionally
  setInterval(changeVedbondOnly, 200);
})();
