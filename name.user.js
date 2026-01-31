// ==UserScript==
// @name         Ísland.is – Kennitala & Name Fix + Auto Refresh (skip innskra)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Reloads on SPA URL change (except innskra) and replaces Kennitala + name on island.is pages
// @author       You
// @match        https://island.is/*
// @grant        none
// ==/UserScript==
(function () {
  'use strict';

  /*** CONFIG — change these values only ***/
  const oldKT = '090600-3720';          // old Kennitala (with dash)
  const newKT = '160302-3130';          // new Kennitala (with dash)
  const oldName = 'Hilmir Gauti Bjarnason';     // name to replace
  const newName = 'Almar Aðalsteinsson';     // new name
  /*** END CONFIG ***/

  const oldKTplain = oldKT.replace('-', '');
  const newKTplain = newKT.replace('-', '');

  /*** AUTO REFRESH ON URL CHANGE (skip innskra) ***/
  let lastUrl = location.href;

  function isInnskra(u) {
    try {
      const url = new URL(u, location.href);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();
      return host === 'innskra.island.is' || path.includes('innskra');
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
          location.replace(currentUrl); // full reload, no new history entry
        }
      }
    }, 300);
  }

  /*** TEXT REPLACEMENT (Kennitala + Name) ***/
  function replaceText() {
    document.querySelectorAll('p, span, div, td, th, li, a, strong, em, h1, h2, h3, h4, h5').forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        let txt = el.textContent;
        if (!txt) return;

        // Replace Kennitala (with dash and plain)
        txt = txt.replaceAll(oldKT, newKT);
        txt = txt.replaceAll(oldKTplain, newKTplain);

        // Replace name
        txt = txt.replaceAll(oldName, newName);

        el.textContent = txt;
      }
    });
  }

  // Keep checking to catch SPA-rendered content
  setInterval(replaceText, 100);
})()
