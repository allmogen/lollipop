// ==UserScript==
// @name         Ísland.is
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Reloads the page on URL change (except innskra) and replaces Kennitala (dashed & plain)
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  const oldKT = '150807-2470';
  const newKT = '150804-2470';
  const oldKTplain = oldKT.replace('-', '');
  const newKTplain = newKT.replace('-', '');

  let lastUrl = location.href;

  function isInnskra(u) {
    try {
      const url = new URL(u, location.href);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();
      // skip if on innskra.island.is or any path containing 'innskra'
      return host === 'innskra.island.is' || host.endsWith('.innskra.island.is') || path.includes('innskra');
    } catch {
      return String(u).toLowerCase().includes('innskra');
    }
  }

  if (!isInnskra(location.href)) {
    setInterval(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (!isInnskra(currentUrl)) {
          // full reload without adding history entry
          location.replace(currentUrl);
        }
      }
    }, 300);
  }

  function replaceKennitala() {
    document.querySelectorAll('p, span, div, td, th, li, a, strong, em').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        const txt = el.textContent;
        if (!txt) return;
        if (txt.includes(oldKT)) el.textContent = txt.replaceAll(oldKT, newKT);
        else if (txt.includes(oldKTplain)) el.textContent = txt.replaceAll(oldKTplain, newKTplain);
      }
    });
  }

  setInterval(replaceKennitala, 10);
})();
