/* The page's side of analytics and Report a bug, for every app on Cloudflare. Each app's build inlines this file before its own code.
   Runs only on the app's own web address: a file, a preview pane or an artifact sends nothing and shows no notice.
   One row per visit. Nothing links one visit to the next. The collector drops anything it doesn't expect.
   cfg: project, hosts, version, prefix (for its storage keys), act(label, icon, attrs), closeSheet, toast(text), onNewVisit and onRecOn (the app records its screen and what the student has told it).
   Optional: quiet: true sends nothing until the student's first tap, and Off deletes what this visit has sent. number: false gives no running number. */
window.opsPage = function (cfg) {
  const API = '/api/c', VISIT_GAP = 30 * 60 * 1000, OFF_KEY = cfg.prefix + '-record-off', VISIT_KEY = cfg.prefix + '-visit';
  const STRINGS = { analytics: 'Analytics', record: 'We collect analytics to help us improve our app.', recordOff: 'Analytics is off.', bug: 'Report a bug' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ENV = location.hostname === cfg.project + '.pages.dev' || cfg.hosts.indexOf(location.hostname) >= 0 ? 'live' : location.hostname.endsWith('.' + cfg.project + '.pages.dev') ? 'preview' : '';
  const local = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } } };
  /* A visit is this tab, until it has been left for 30 minutes. The next visit starts afresh with its own number and no link to this one, so a student who returns counts again.
     All of it stays in the tab: sessionStorage goes when the tab closes. */
  const freshKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  function loadVisit() {
    try { const v = JSON.parse(sessionStorage.getItem(VISIT_KEY)); if (v && v.k && Date.now() - v.t < VISIT_GAP) return v; } catch (e) { /* private window */ }
    return { k: freshKey(), n: null, e: [], t: Date.now(), a: false, s: false };
  }
  // A browser set to ask sites not to track starts with the record off; the student's own choice wins after that
  let recOff = local.get(OFF_KEY) ? local.get(OFF_KEY) === '1' : navigator.globalPrivacyControl === true;
  const WAS = ENV ? loadVisit() : { k: '', n: null, e: [] };
  // tapped: the student has tapped something this visit (quiet waits for it). sent: a row may exist, so Off has something to delete
  const REC = { visit: WAS.k, visitor: WAS.n, events: WAS.e || [], snap: { mode: '', h2: [], grades: '', gpa_band: '', riasec: '' }, dirty: false, errors: 0, tapped: !!WAS.a, sent: !!WAS.s };
  const recording = () => !!ENV && !recOff;
  function post(o) {
    // Not sendBeacon: with this site's no-referrer rule, Safari's beacon says it comes from nowhere (Origin: null), so the collector refuses it, and the page can't tell
    try { fetch(API, { method: 'POST', body: JSON.stringify(o), keepalive: true }).catch(() => {}); } catch (e) { /* the page must never notice */ }
  }
  function flush() {
    if (!recording() || !REC.dirty || (cfg.quiet && !REC.tapped)) return;
    REC.dirty = false; REC.sent = true;
    post(Object.assign({ op: 'visit', visit: REC.visit, visitor: REC.visitor, version: cfg.version, events: REC.events }, REC.snap));
  }
  function keepVisit() {
    if (!ENV) return;
    try { sessionStorage.setItem(VISIT_KEY, JSON.stringify({ k: REC.visit, n: REC.visitor, e: REC.events, t: Date.now(), a: REC.tapped, s: REC.sent })); } catch (e) { /* private window */ }
  }
  // a tap, not a scroll or a page load: the click a tap or a key makes
  if (cfg.quiet && ENV) document.addEventListener('click', () => { if (!REC.tapped) { REC.tapped = true; keepVisit(); } }, true);
  /* Off deletes this visit's row. Sent twice, in case a row was still on its way; the next visit gets a new key, so nothing links back. */
  function forget() {
    if (!REC.sent) return;
    const o = { op: 'forget', visit: REC.visit };
    post(o); setTimeout(() => post(o), 4000);
    REC.visit = freshKey(); REC.visitor = null; REC.sent = false; keepVisit();
  }
  function askNumber() {
    if (!recording() || REC.visitor || cfg.number === false) return;
    try {
      fetch(API, { method: 'POST', body: JSON.stringify({ op: 'visitor' }) }).then(r => r.json()).then(d => {
        if (d && d.n) { REC.visitor = d.n; REC.dirty = true; flush(); keepVisit(); }
      }).catch(() => {});
    } catch (e) { /* the page must never notice */ }
  }
  function rec(name, value, context) {
    if (!recording() || REC.events.length >= 300) return;
    const e = [name]; if (value != null && value !== '') e.push(value);
    if (context) { if (e.length === 1) e.push(''); e.push(context); }
    REC.events.push(e); REC.dirty = true;
    if (REC.events.length % 25 === 0) flush();
  }
  /* A value that only its latest counts, such as what the student's results are now */
  function recOne(name, value) {
    if (!recording()) return;
    REC.events = REC.events.filter(e => e[0] !== name);
    rec(name, value);
  }
  function setSnap(o) { REC.snap = o; }
  function recError(message, place) {
    if (!recording() || REC.errors >= 5) return;
    REC.errors++;
    post({ op: 'error', version: cfg.version, message: String(message || 'Unknown error'), place: String(place || '') });
  }
  window.addEventListener('error', e => recError(e.message, (e.lineno || 0) + ':' + (e.colno || 0)));
  window.addEventListener('unhandledrejection', e => recError(e.reason && e.reason.message || e.reason, 'promise'));
  let LEFT = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { flush(); keepVisit(); LEFT = Date.now(); return; }
    if (ENV && LEFT && Date.now() - LEFT >= VISIT_GAP) { REC.visit = freshKey(); REC.visitor = null; REC.events = []; REC.tapped = false; REC.sent = false; cfg.onNewVisit(); askNumber(); keepVisit(); }
  });
  window.addEventListener('pagehide', () => { flush(); keepVisit(); });

  /* The filled part is the state it is in now */
  const recHTML = () => {
    const seg = [['on', 'On'], ['off', 'Off']].map(([k, t]) => '<button type="button" class="seg-btn" data-do="rec-set" data-v="' + k + '" aria-pressed="' + ((recOff ? 'off' : 'on') === k) + '">' + t + '</button>').join('');
    return '<div class="urec"><div class="urec-r"><span class="urec-k">' + esc(STRINGS.analytics) + '</span><div class="seg seg-2" role="group" aria-label="' + esc(STRINGS.analytics) + '">' + seg + '</div></div><p class="hint">' + esc(recOff ? STRINGS.recordOff : STRINGS.record) + '</p></div>';
  };
  const bugAct = () => cfg.act(STRINGS.bug, 'edit', 'data-do="bug-open"');
  /* On the first screen only, and only where the page really records. The first tap on that screen's main choice clears it; the Information sheet keeps the same controls. */
  const footHTML = () => ENV ? '<div class="ufoot">' + recHTML() + bugAct() + '</div>' : '';
  function setRec(v) {
    if ((v === 'off') !== recOff) { recOff = v === 'off'; local.set(OFF_KEY, recOff ? '1' : '0'); if (recOff) { REC.events = []; REC.dirty = false; if (cfg.quiet) forget(); } else { cfg.onRecOn(); askNumber(); } }
    document.querySelectorAll('.urec').forEach(x => { x.outerHTML = recHTML(); });
  }
  /* Goes through this page's own address, so a student never leaves the app. Never carries the visit number: a report may hold an email. */
  function bugHTML() {
    return '<label class="q-h" for="bug-msg">What went wrong?</label><textarea id="bug-msg" class="uinp ubug-t" rows="5" maxlength="4000"></textarea>' +
      '<label class="q-h ubug-l" for="bug-mail">Your email, if you’d like a reply</label><input id="bug-mail" class="uinp" type="email" autocomplete="email" maxlength="200">' +
      '<p class="uerr" id="bug-err" role="alert" hidden></p><div class="sheet-acts"><button type="button" class="btn-primary" data-do="bug-send">Send</button></div>';
  }
  function sendBug(btn) {
    const message = document.querySelector('#bug-msg').value.trim(), email = document.querySelector('#bug-mail').value.trim(), err = document.querySelector('#bug-err');
    const say = t => { err.textContent = t; err.hidden = false; btn.disabled = false; };
    if (!message) return say('Please say what went wrong.');
    if (email && !/^[^\s@:<>"]+@[^\s@:<>"]+\.[^\s@:<>"]+$/.test(email)) return say('Please check your email address.');
    err.hidden = true; btn.disabled = true;
    fetch(API, { method: 'POST', body: JSON.stringify({ op: 'report', version: cfg.version, message, email }) })
      .then(r => { if (r.status === 429) return say('We’ve had too many reports today. Please try again tomorrow.'); if (!r.ok) throw new Error(r.status); cfg.closeSheet(); cfg.toast('Thanks, we got your report.'); })
      .catch(() => say('It couldn’t be sent. Please try again in a few minutes.'));
  }
  return { env: ENV, STRINGS, recording, flush, keepVisit, askNumber, rec, recOne, setSnap, recError, recHTML, bugAct, footHTML, setRec, bugHTML, sendBug };
};
