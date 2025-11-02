// ==UserScript==
// @name         Ísland.is – Kennitala & Name Fix + Auto Refresh (skip innskra)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Reloads on URL change (except innskra), replaces Kennitala (with/without dash) and name everywhere safely
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  /*** CONFIG — change these values only ***/
  const oldKT = '090603-3720';
  const newKT = '090603-3720';
  const oldName = 'Darri Helgason';
  const newName = 'Tristan Sikora';
  /*** END CONFIG ***/

  const oldKTplain = oldKT.replace('-', '');
  const newKTplain = newKT.replace('-', '');

  /*** AUTO REFRESH ON URL CHANGE (except innskra) ***/
  let lastUrl = location.href;

  function isInnskra(u) {
    try {
      const url = new URL(u, location.href);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();
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
          location.replace(currentUrl); // full reload, no history entry
        }
      }
    }, 300);
  }

  /*** TEXT REPLACEMENT (Kennitala + Name) ***/
  function replaceText() {
    document.querySelectorAll('p, span, div, td, th, li, a, strong, em').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        let txt = el.textContent;
        if (!txt) return;

        // Replace Kennitala (dashed and plain)
        if (txt.includes(oldKT)) txt = txt.replaceAll(oldKT, newKT);
        if (txt.includes(oldKTplain)) txt = txt.replaceAll(oldKTplain, newKTplain);

        // Replace name
        if (txt.includes(oldName)) txt = txt.replaceAll(oldName, newName);

        el.textContent = txt;
      }
    });
  }

  // Run continuously to catch React-rendered text
  setInterval(replaceText, 50);
})();
