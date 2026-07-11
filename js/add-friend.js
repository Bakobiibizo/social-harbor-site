/**
 * add-friend.js
 *
 * Responsibilities:
 *  1. Extract the contact string from the URL path (/add-friend/<contactString>)
 *  2. Decode base64 → JSON → extract displayName and peerId
 *  3. Show State A (valid) or State B (invalid)
 *  4. Handle "Open in Harbor" click with deep link + fallback timeout
 *  5. Highlight the correct download button for the user's platform
 */

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.initialize(root);
})(typeof window !== 'undefined' ? window : undefined, function () {
  'use strict';

  const MAX_CONTACT_LENGTH = 8192;

  function contactStringFromLocation(location) {
    const prefix = '/add-friend/';
    const index = location.pathname.indexOf(prefix);
    let value = index >= 0 ? location.pathname.slice(index + prefix.length) : '';
    try { value = decodeURIComponent(value); } catch (_) { return ''; }
    if (value.includes('.') || value.includes('/')) value = '';
    if (!value) {
      const match = location.search.match(/[?&]c=([^&]*)/);
      try { value = match ? decodeURIComponent(match[1]) : ''; } catch (_) { return ''; }
    }
    return value;
  }

  // ── 1. Extract contact string from URL path ──────────────────────────────
  //
  // URL format: https://social-harbor.com/add-friend/<contactString>
  // window.location.pathname is something like: /add-friend/eyJtdWx0aWFkZHIi...
  // We split on '/add-friend/' and take everything after it.

  function decodeContactString(contactString, decodeBase64) {
    try {
      if (!contactString || contactString.length > MAX_CONTACT_LENGTH ||
          !/^[A-Za-z0-9_-]+$/.test(contactString)) return null;
      const b64 = contactString.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      const bytes = decodeBase64(padded);
      const json = typeof TextDecoder === 'undefined'
        ? decodeURIComponent(Array.from(bytes, c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''))
        : new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes, c => c.charCodeAt(0)));
      const bundle = JSON.parse(json);
      if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle) ||
          typeof bundle.displayName !== 'string' || !bundle.displayName.trim() || bundle.displayName.length > 120 ||
          typeof bundle.multiaddr !== 'string' || bundle.multiaddr.length > 2048) return null;
      const peerMatch = bundle.multiaddr.match(/\/p2p\/([^/]+)$/);
      if (!peerMatch || !/^[A-Za-z0-9]+$/.test(peerMatch[1])) return null;
      return { displayName: bundle.displayName.trim(), peerId: peerMatch[1], raw: contactString };
    } catch (_) { return null; }
  }

  function initialize(window) {
  const rawContactString = contactStringFromLocation(window.location);

  // Discard if the pathname gave us a filename instead of a contact string.
  // This happens in local testing where the URL is /add-friend/index.html?c=...
  // and split('/add-friend/') captures 'index.html' instead of a base64 string.


  // LOCAL TESTING ONLY: query parameter fallback.
  // Python's static server can't route /add-friend/<contactString> to this file,
  // so during local development use ?c=<contactString> instead:
  //   http://localhost:8080/add-friend/index.html?c=eyJ...
  // This fallback is never triggered in production because Vercel's rewrite
  // rule serves this file for any /add-friend/* path, making pathname work.
  //
  // Note: we use a regex + decodeURIComponent instead of URLSearchParams.get()
  // because URLSearchParams converts + to spaces (form encoding), which would
  // corrupt base64 strings that contain + characters before atob() can decode them.


  // ── 2. Decode the contact string ─────────────────────────────────────────
  //
  // The contact string is URL-safe base64 (no padding) encoding a JSON object.
  // Harbor's Rust backend uses URL_SAFE_NO_PAD (from the base64 crate), which:
  //   - Replaces + with -
  //   - Replaces / with _
  //   - Omits = padding
  //
  // To decode in JS we must reverse those substitutions before calling atob().

  const contact = decodeContactString(rawContactString, window.atob.bind(window));

  // ── 3. Show the correct state ────────────────────────────────────────────

  const stateValid   = document.getElementById('state-valid');
  const stateInvalid = document.getElementById('state-invalid');

  if (contact) {
    // Populate the valid state UI
    document.getElementById('contact-name').textContent = contact.displayName;
    document.getElementById('peer-id').textContent = contact.peerId;

    // Update page title and OG title with the real contact name
    document.title = contact.displayName + ' wants to connect | Harbor';

    // Show valid state
    stateValid.classList.remove('hidden');

  } else {
    // Show invalid state
    stateInvalid.classList.remove('hidden');
  }

  // ── 4. "Open in Harbor" deep link + fallback ─────────────────────────────
  //
  // When clicked, we navigate to harbor://add-friend/<contactString>.
  // If the app is installed, the OS intercepts this and opens Harbor.
  // If the app is NOT installed, the browser silently ignores the protocol
  // and the page stays visible. We detect this case with a 3-second timeout:
  // if the page is still visible after 3s, the app probably didn't open.

  const openBtn = document.getElementById('open-in-harbor');
  const fallbackMsg = document.getElementById('fallback-message');

  if (openBtn && contact) {
    openBtn.addEventListener('click', function () {
      // Construct the deep link URL
      const deepLink = 'harbor://add-friend/' + contact.raw;

      // Navigate to the deep link. If Harbor is installed, the OS handles it.
      window.location.href = deepLink;

      // Start the fallback timer
      const fallbackTimer = setTimeout(function () {
        // The page is still visible, so Harbor likely is not installed.
        if (!document.hidden) {
          fallbackMsg.style.display = 'block';
        }
      }, 3000);

      // If the user switches away (app opened), cancel the fallback
      document.addEventListener('visibilitychange', function onVisChange() {
        if (document.hidden) {
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', onVisChange);
        }
      });
    });
  }
  }

  return { MAX_CONTACT_LENGTH, contactStringFromLocation, decodeContactString, initialize };
});
