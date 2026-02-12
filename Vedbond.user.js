// ==UserScript==
// @name         Ísland.is – Change "Veðbönd: Já" to "Nei"
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Only changes the "Já" value for the "Veðbönd" field to "Nei" on min-okutaeki pages.
// @author       You
// @match        https://island.is/minarsidur/eignir/okutaeki/min-okutaeki/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function setVedbondToNei() {
    // Find elements that exactly match the label "Veðbönd"
    const labelNodes = Array.from(document.querySelectorAll('p, span, div, dt, th, h1, h2, h3, h4'))
      .filter(el => (el.textContent || '').trim() === 'Veðbönd');

    for (const label of labelNodes) {
      // Try to locate the value next to the label.
      // Common layouts: label/value in same parent (two columns) or in a small row container.
      const row =
        label.closest('tr') ||
        label.closest('[role="row"]') ||
        label.parentElement;

      if (!row) continue;

      // Look for a nearby node that is a plain text node with "Já"
      const candidates = Array.from(row.querySelectorAll('p, span, div, dd, td'))
        .filter(el => {
          const t = (el.textContent || '').trim();
          // Must be exactly "Já" (not longer strings)
          return t === 'Já';
        });

      // If the row container is too big, we might catch other "Já".
      // So pick the "Já" that is closest in DOM order to the label.
      if (candidates.length) {
        let best = candidates[0];
        let bestDist = Infinity;

        const all = Array.from(row.querySelectorAll('*'));
        const li = all.indexOf(label);

        for (const c of candidates) {
          const ci = all.indexOf(c);
          if (li !== -1 && ci !== -1) {
            const dist = Math.abs(ci - li);
            if (dist < bestDist) {
              bestDist = dist;
              best = c;
            }
          }
        }

        // Change only that one
        best.textContent = 'Nei';
        return;
      }

      // Fallback: sometimes value is in a sibling container
      const parent = label.parentElement;
      if (parent) {
        const sibs = [parent.nextElementSibling, parent.previousElementSibling].filter(Boolean);
        for (const s of sibs) {
          const v = Array.from(s.querySelectorAll('p, span, div, dd, td'))
            .find(el => (el.textContent || '').trim() === 'Já');
          if (v) {
            v.textContent = 'Nei';
            return;
          }
        }
      }
    }
  }

  // React/SPA: keep applying (lightweight)
  setInterval(setVedbondToNei, 200);
})();
