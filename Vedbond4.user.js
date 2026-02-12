// ==UserScript==
// @name         Ísland.is – Veðbönd value "Já" -> "Nei" (keep font)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Changes ONLY the Veðbönd value from Já to Nei without affecting Tryggt or typography.
// @match        https://island.is/minarsidur/eignir/okutaeki/min-okutaeki/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const LABEL = 'Veðbönd';
  const FROM = 'Já';
  const TO = 'Nei';

  function normalize(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function findSmallCellFromLabel(labelEl) {
    // Climb a few levels to find a container that contains Veðbönd
    // but does NOT contain Tryggt (so we don’t touch the other column).
    let cur = labelEl;
    for (let i = 0; i < 8 && cur && cur !== document.body; i++) {
      const text = normalize(cur.textContent);
      if (text.includes(LABEL) && !text.includes('Tryggt')) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function changeVedbondValueKeepFont() {
    // Find an element whose visible text is exactly "Veðbönd"
    const labelEls = Array.from(document.querySelectorAll('p, span, div, dt, th, h1, h2, h3, h4, h5'))
      .filter(el => normalize(el.textContent) === LABEL);

    for (const labelEl of labelEls) {
      const cell = findSmallCellFromLabel(labelEl);
      if (!cell) continue;

      // Walk TEXT NODES in this cell, find "Veðbönd", then the next "Já" after it, and replace ONLY that node.
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const t = normalize(node.nodeValue);
          return t ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });

      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);

      const labelIndex = nodes.findIndex(tn => normalize(tn.nodeValue) === LABEL);
      if (labelIndex === -1) continue;

      for (let i = labelIndex + 1; i < nodes.length; i++) {
        if (normalize(nodes[i].nodeValue) === FROM) {
          nodes[i].nodeValue = nodes[i].nodeValue.replace(FROM, TO);
          return; // done
        }
      }
    }
  }

  // React/SPA: keep applying lightly
  setInterval(changeVedbondValueKeepFont, 200);
})();
