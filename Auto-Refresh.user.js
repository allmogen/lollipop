// ==UserScript==
// @name         Auto Full Refresh on URL Change (skip innskra.island.is)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Reload on SPA URL changes except on innskra login pages
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let lastUrl = location.href;

  function isInnskra(u) {
    try {
      const url = new URL(u, location.href);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();
      // Skip if on innskra.island.is OR any path containing 'innskra'
      return host === 'innskra.island.is' || host.endsWith('.innskra.island.is') || path.includes('innskra');
    } catch {
      // Fallback: plain substring check
      return String(u).toLowerCase().includes('innskra');
    }
  }

  // If we are already on innskra, do nothing at all.
  if (isInnskra(location.href)) return;

  setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // If the NEW URL is an innskra login, do not reload.
      if (!isInnskra(currentUrl)) {
        // Full reload (use replace to avoid stacking history entries)
        location.replace(currentUrl);
      }
    }
  }, 300);
})();