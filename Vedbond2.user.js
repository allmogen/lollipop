// ==UserScript==
// @name         Ísland.is – Change only "Veðbönd: Já" to "Nei"
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Only changes the value under the label "Veðbönd" (won't touch "Tryggt") on min-okutaeki pages.
// @author       You
// @match        https://island.is/minarsidur/eignir/okutaeki/min-okutaeki/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function textEquals(el, s) {
    return (el.textContent || '').trim() === s;
  }

  // Find the smallest ancestor "cell" that:
  // - contains label "Veðbönd"
  // - contains a value "Já"
  // - does NOT contain label "Tryggt"
  function findVedbondCell(labelEl) {
    let cur = labelEl;
    let best = null;

    while (cur && cur !== document.body) {
      const hasVedbond = Array.from(cur.querySelectorAll('*')).some(n => textEquals(n, 'Veðbönd'));
      if (!hasVedbond) { cur = cur.parentElement; continue; }

      const hasTryggt = Array.from(cur.querySelectorAll('*')).some(n => textEquals(n, 'Tryggt'));
      if (hasTryggt) { cur = cur.parentElement; continue; }

      const hasJa = Array.from(cur.querySelectorAll('*')).some(n => textEquals(n, 'Já'));
      if (hasJa) best = cur; // keep going upward to find smaller? (we want smallest, so store & continue upward? actually smallest is closest, so store first and break)
      if (best) break;

      cur = cur.parentElement;
    }

    return best;
  }

  function changeVedbondJaToNei() {
    // Find label node(s) exactly "Veðbönd"
    const labels = Array.from(document.querySelectorAll('p, span, div, dt, th, h1, h2, h3, h4, h5'))
      .filter(el => textEquals(el, 'Veðbönd'));

    for (const label of labels) {
      const cell = findVedbondCell(label);
      if (!cell) continue;

      // Change only the "Já" inside this cell (should be the Veðbönd value)
      const jaNode = Array.from(cell.querySelectorAll('p, span, div, dd, td'))
        .find(el => textEquals(el, 'Já'));

      if (jaNode) {
        jaNode.textContent = 'Nei';
        return;
      }
    }
  }

  // React/SPA: apply repeatedly
  setInterval(changeVedbondJaToNei, 200);
})();
