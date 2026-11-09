/* Blend Buddies – Final /ks/. A friendly S slides from the right along K's arm, they link arms and make the final /ks/.
   Minimal pairs are part of the round when leaving the final /s/ still makes a real word (book to books).
   Words spelled with x (fox) use the letter x for /ks/; the buddies are still K and S.
   The listen slides ask the child to pick which word they heard.
   Original code, characters, pictures (pictures.js) and sounds. No dependencies, no cookies, no storage, no tracking.
   The word list is embedded in words.js so the page works when opened as a file (no fetch).
   Sounds are synthesized at run time with the Web Audio API.
   Optional add-ons (tally.js) plug in through hook() below; without them every hook is a no-op. */
(function () {
  'use strict';

  /* ================= sound (Web Audio, generated; never throws) ================= */
  var Sound = (function () {
    var AC = window.AudioContext || window.webkitAudioContext || null;
    var ctx = null, master = null, on = true, noise = null, wh = null, dead = !AC;
    function safe(f) { return function () { try { return f.apply(null, arguments); } catch (e) { return null; } }; }
    var ensure = safe(function () {
      if (dead) return null;
      if (!ctx) {
        try { ctx = new AC(); } catch (e) { dead = true; ctx = null; return null; }
        master = ctx.createGain(); master.gain.value = on ? 0.8 : 0; master.connect(ctx.destination);
      }
      return ctx;
    });
    var unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    var unlock = safe(function () {
      var c = ensure(); if (!c) { stopListening(); return; }
      if (c.state !== 'running' && c.resume) { var p = c.resume(); if (p && p.catch) p.catch(function () {}); }
      // iOS Safari: play one silent sample inside the gesture to open the audio route
      var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
      if (c.state === 'running') stopListening();
    });
    function stopListening() { unlockEvents.forEach(function (t) { document.removeEventListener(t, unlock, true); }); }
    unlockEvents.forEach(function (t) { document.addEventListener(t, unlock, true); });

    function ready() { return on && ensure() && ctx.state !== 'closed' ? ctx : null; }
    function noiseBuf(c) {
      if (noise) return noise;
      var n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return (noise = b);
    }
    function env(g, t, a, peak, dec) {
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
    }
    function tone(type, f0, f1, t, a, peak, dec) {
      var c = ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + a + dec);
      env(g, t, a, peak, dec); o.connect(g); g.connect(master); o.start(t); o.stop(t + a + dec + 0.05);
    }
    return {
      available: function () { return !dead; },
      isOn: function () { return on; },
      setOn: safe(function (v) {
        on = !!v;
        if (master && ctx) master.gain.setTargetAtTime(on ? 0.8 : 0, ctx.currentTime, 0.02);
        if (!on) this.whooshStop();
      }),
      /* soft airy whoosh while S travels; louder and brighter when moving faster */
      whoosh: safe(function (speed) {
        var c = ready(); if (!c) return;
        var now = c.currentTime, sp = Math.min(3, Math.max(0, speed || 0));
        if (!wh) {
          var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
          src.buffer = noiseBuf(c); src.loop = true; f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.value = 900;
          g.gain.value = 0.0001; src.connect(f); f.connect(g); g.connect(master); src.start(now);
          wh = { src: src, f: f, g: g };
        }
        wh.g.gain.setTargetAtTime(0.02 + sp * 0.05, now, 0.05);
        wh.f.frequency.setTargetAtTime(700 + sp * 1000, now, 0.06);
      }),
      whooshStop: safe(function () {
        if (!wh || !ctx) return;
        var w = wh, now = ctx.currentTime; wh = null;
        w.g.gain.cancelScheduledValues(now); w.g.gain.setTargetAtTime(0.0001, now, 0.05);
        w.src.stop(now + 0.3);
      }),
      /* pop when the arms link */
      pop: safe(function () {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.01;
        tone('sine', 600, 200, t, 0.006, 0.3, 0.14); tone('triangle', 1200, 420, t, 0.004, 0.07, 0.08);
      }),
      /* tap at the "wrist" = the second sound */
      tap: safe(function () {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.01;
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = noiseBuf(c); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 2.2;
        env(g, t, 0.003, 0.28, 0.05); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.09);
        tone('triangle', 980, 700, t, 0.003, 0.13, 0.06);
      }),
      /* bright little chime when the word is complete */
      chime: safe(function (soft) {
        var c = ready(); if (!c) return; var t = c.currentTime + 0.02, k = soft ? 0.6 : 1;
        [784, 988, 1175, 1568].forEach(function (f, i) {
          tone('sine', f, f, t + i * 0.08, 0.01, 0.13 * k, soft ? 0.55 : 0.8); tone('sine', f * 2, f * 2, t + i * 0.08, 0.008, 0.025 * k, 0.3);
        });
      })
    };
  })();

  /* ================= spoken word (Web Speech API; optional, never throws) ================= */
  var Speech = (function () {
    var synth = null, voice = null, primed = false;
    try { synth = window.speechSynthesis || null; } catch (e) { synth = null; }
    var U = window.SpeechSynthesisUtterance || null;
    function ok() { return !!(synth && U && typeof synth.speak === 'function'); }
    function pick() {
      try {
        var vs = (synth.getVoices && synth.getVoices()) || [], best = null, score = -1;
        vs.forEach(function (v) {
          var l = String(v.lang || '').replace('_', '-').toLowerCase(), n = String(v.name || ''), sc = -1;
          if (l === 'en-us') sc = 3; else if (l.indexOf('en') === 0) sc = 2;
          if (sc < 0) return;
          if (v.localService === true) sc += 2;            // on-device voice: the word is not sent to a speech service
          if (/samantha|allison|ava|susan|zira|jenny|aria/i.test(n)) sc += 1;
          if (/novelty|whisper|bad news|bells|boing|bubbles|cellos|zarvox|trinoids|albert|jester|organ|superstar|wobble|hysterical|grandma|grandpa/i.test(n)) sc -= 3;
          if (sc > score) { score = sc; best = v; }
        });
        if (best) voice = best;
      } catch (e) { /* ignore */ }
    }
    if (ok()) {
      pick();
      try { if (synth.addEventListener) synth.addEventListener('voiceschanged', pick); else synth.onvoiceschanged = pick; } catch (e) { /* ignore */ }
    }
    function utter(text, vol) {
      var u = new U(text);
      u.lang = (voice && voice.lang) || 'en-US'; if (voice) u.voice = voice;
      u.rate = 0.85; u.pitch = 1.1; u.volume = vol;
      return u;
    }
    // iOS Safari only lets speech start from a user gesture: speak one silent, empty utterance on the first touch
    var prime = function () {
      if (primed || !ok()) return; primed = true;
      try { synth.speak(utter('', 0)); } catch (e) { /* ignore */ }
      ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (t) { document.removeEventListener(t, prime, true); });
    };
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (t) { document.addEventListener(t, prime, true); });
    return {
      available: ok,
      cancel: function () { try { if (ok() && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) { /* ignore */ } },
      say: function (text) {
        if (!text || !ok() || !Sound.isOn()) return false;
        try {
          if (synth.speaking || synth.pending) synth.cancel();
          if (synth.paused && synth.resume) synth.resume();
          if (!voice) pick();
          synth.speak(utter(String(text), 1));
          return true;
        } catch (e) { return false; }
      }
    };
  })();

  /* ================= data + elements ================= */
  var DATA, WORDS, GROUPS = {}, LET = {}, FR, PAIRS = [];
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var app = $('app'), stage = $('stage'), wrap = $('stageWrap'), mover = $('mover'), track = $('track'), handle = $('handle');
  var el = {
    buddies: $('buddies'), armLayer: $('armLayer'), ribbon: $('ribbon'), clip: $('ribbonClipRect'), right: $('rightChain'),
    tapRing: $('tapRing'), tapCircle: $('tapCircle'), wordRow: $('wordRow'), burst: $('burst'), blendG: $('blendG'), restG: $('restG'),
    without: $('withoutText'), caption: $('caption'), say: $('sayIt'), secLabel: $('secLabel'), fill2: $('trackFill'),
    hear: $('btnHear'), live: $('liveMsg'), stageArea: $('stageArea'),
    picCard: $('picCard'), picA: $('picA'), picB: $('picB'), cmp: $('compareRow'), cmpA: $('cmpA'), cmpB: $('cmpB'),
    listen: $('listenView'), listenQ: $('listenQ'), cards: $('listenCards'), cardL: $('cardL'), cardR: $('cardR'),
    play: $('btnPlayWord'), playLabel: $('playLabel'), extra: $('listenExtra')
  };
  var H = 440;
  var st = { idx: -1, pair: -1, mode: 'drag', pos: 0, link: 0, done: false, locking: false, say: false, G: null, timers: [], raf: 0,
    pairFlow: false, pic: 'b', target: null, targetSrc: '', order: [] };

  /* ---------- add-on hooks (the only connection to optional modules such as tally.js) ---------- */
  function hook(name, data) {
    var hs = window.BlendBuddiesHooks;
    if (!hs || typeof hs[name] !== 'function') return undefined;
    try { return hs[name](data); } catch (e) { return undefined; }
  }

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function norm(s) { return String(s || '').toLowerCase().trim().replace(/[\s_+\-]+/g, '-').replace(/[^a-z-]/g, ''); }
  function findWord(w) {
    var k = norm(w), k2 = k.replace(/-/g, '');
    for (var i = 0; i < WORDS.length; i++) if (WORDS[i].id === k || norm(WORDS[i].word) === k) return i;
    for (var j = 0; j < WORDS.length; j++) if (norm(WORDS[j].word).replace(/-/g, '') === k2) return j;   // "skate board" -> skateboard
    return -1;
  }
  function findPair(q) {
    var k = norm(q).replace(/^pair-/, '');
    for (var i = 0; i < PAIRS.length; i++) { var w = WORDS[PAIRS[i]]; if (w.id === k || norm(w.without) === k) return i; }
    return -1;
  }
  function mk(tag, attrs, parent, cls) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (cls) n.setAttribute('class', cls);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function shade(hex, amt) {   // amt < 0 darker, > 0 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = amt < 0 ? 0 : 255, a = Math.abs(amt);
    var f = function (c) { return Math.round(c + (t - c) * a); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function letterStyle(ch) { return LET[ch] || { color: '#7A7F99', ink: '#FFFFFF' }; }
  function later(fn, ms) { st.timers.push(setTimeout(fn, ms)); }
  function clearTimers() { st.timers.forEach(clearTimeout); st.timers = []; stopTween(); }
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }
  function stopTween() { st.tok = (st.tok || 0) + 1; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; if (st.tweenFallback) clearTimeout(st.tweenFallback); }
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function tween(from, to, ms, apply, then, ease) {
    stopTween();
    var tok = st.tok, t0 = null, fin = false;
    ease = ease || easeOut;
    ms = reduced() ? 1 : ms;
    function finish() { if (fin || tok !== st.tok) return; fin = true; st.raf = 0; clearTimeout(st.tweenFallback); apply(to); if (then && tok === st.tok) then(); }
    function f(now) {
      if (fin || tok !== st.tok) return;
      if (t0 === null) t0 = now;
      var t = clamp((now - t0) / ms, 0, 1);
      if (t >= 1) { finish(); return; }
      apply(lerp(from, to, ease(t)));
      if (tok === st.tok) st.raf = requestAnimationFrame(f);
    }
    st.raf = requestAnimationFrame(f);
    st.tweenFallback = setTimeout(finish, ms + 250);   // still finishes if animation frames are paused
  }
  // which letters are on which side; the friendly letter (S) can be configured to the right for future L-/R-blend pages
  function fromRight() { return !!(FR && FR.side === 'right'); }
  function partnerLetters(w) { return String(w.partner || '').split(''); }
  function friendLetters(w) { return String(w.s || (FR && FR.letters) || 's').split(''); }
  function sides(w) {
    var friendLeft = !fromRight();
    return { left: (friendLeft ? w.s : w.partner).split(''), right: (friendLeft ? w.partner : w.s).split('') };
  }
  function wordSegs(w) {
    var segs = [];
    if (w.pre) segs.push({ t: w.pre, color: null, kind: 'pre' });
    if (w.spell) {
      segs.push({ t: w.spell, color: letterStyle('x').color, kind: 'blend', sSeg: true });
    } else {
      segs.push({ t: w.partner, color: letterStyle(w.partner).color, kind: 'blend' });
      if (w.mid) segs.push({ t: w.mid, color: null, kind: 'mid' });
      segs.push({ t: w.s, color: letterStyle(w.s).color, kind: 'blend', sSeg: true });
    }
    if (w.rest && w.rest !== w.mid) segs.push({ t: w.rest, color: null, kind: 'rest' });
    return segs;
  }
  function markKs(node, text, isTarget) {
    node.textContent = '';
    var w = WORDS[st.idx], mark = (w && w.spell) ? w.spell : (w && w.s) || 's';
    if (isTarget && mark && text.length > mark.length && text.slice(-mark.length).toLowerCase() === String(mark).toLowerCase()) {
      node.appendChild(document.createTextNode(text.slice(0, text.length - mark.length)));
      var b = document.createElement('b'); b.className = 'chip-s'; b.textContent = text.slice(-mark.length); node.appendChild(b);
    } else node.appendChild(document.createTextNode(text));
  }

  function measure(node, txt, size) { node.textContent = txt; node.style.fontSize = size + 'px'; return txt ? node.getComputedTextLength() : 0; }
  function announce(t) { el.live.textContent = ''; later(function () { el.live.textContent = t; }, 30); }

  /* ---------- characters ---------- */
  function buildBuddy(parent, ch, cx, CY, R) {
    var c = letterStyle(ch), g = mk('g', { 'data-letter': ch }, parent, 'buddy');
    g.style.animationDelay = (-((cx * 7) % 37) / 10).toFixed(1) + 's';     // idle breathing, out of step with the neighbours
    var bodyG = mk('g', {}, g, 'buddy-body');
    mk('circle', { cx: cx, cy: CY, r: R, fill: c.color, filter: 'url(#soft)' }, bodyG, 'body');
    mk('ellipse', { cx: cx - R * 0.38, cy: CY - R * 0.52, rx: R * 0.22, ry: R * 0.13, transform: 'rotate(-30 ' + (cx - R * 0.38) + ' ' + (CY - R * 0.52) + ')' }, bodyG, 'shine');
    var eyesG = mk('g', {}, bodyG, 'eyes');
    eyesG.style.animationDelay = (-((cx * 13) % 53) / 10).toFixed(1) + 's';  // blink now and then
    [-1, 1].forEach(function (s) {
      mk('ellipse', { cx: cx + s * R * 0.58, cy: CY + R * 0.42, rx: R * 0.14, ry: R * 0.09 }, bodyG, 'cheek');
      mk('circle', { cx: cx + s * R * 0.3, cy: CY - R * 0.5, r: R * 0.165 }, eyesG, 'eye-white');
      mk('circle', { cx: cx + s * R * 0.3 + R * 0.03, cy: CY - R * 0.47, r: R * 0.085 }, eyesG, 'pupil');
      mk('circle', { cx: cx + s * R * 0.3 + R * 0.06, cy: CY - R * 0.52, r: R * 0.03 }, eyesG, 'glint');
    });
    var t = mk('text', { x: cx, y: CY + R * 0.1, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: c.ink }, bodyG, 'letter');
    t.textContent = ch; t.style.fontSize = (R * 0.98) + 'px';
    var mouth = mk('path', { d: '' }, bodyG, 'mouth');
    return { g: g, cx: cx, mouth: mouth, color: c.color, dark: shade(c.color, -0.28) };
  }
  function arm(parent, color) {
    var g = mk('g', {}, parent, 'arm');
    var p = mk('path', { d: '', stroke: color }, g, 'arm-line');
    var h = mk('circle', { cx: 0, cy: 0, r: 0, fill: color }, g, 'hand');
    return { g: g, p: p, h: h };
  }
  function setArm(a, A, B, bulge, R, handR) {
    var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var cx = mx - dy / L * bulge, cy = my + dx / L * bulge;
    a.p.setAttribute('d', 'M' + A[0].toFixed(1) + ' ' + A[1].toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + B[0].toFixed(1) + ' ' + B[1].toFixed(1));
    a.p.style.strokeWidth = (R * 0.17).toFixed(1) + 'px';
    a.h.setAttribute('cx', B[0].toFixed(1)); a.h.setAttribute('cy', B[1].toFixed(1)); a.h.setAttribute('r', (R * (handR || 0.15)).toFixed(1));
  }
  function setMouth(b, CY, R, m) {   // m: -1 frown, 1 smile, 2 big open smile
    var hw = R * (m > 0 ? 0.2 + 0.07 * m : 0.18), y = CY + R * (m < 0 ? 0.7 : 0.58), d = R * 0.12 * m, x = b.cx;
    var open = m > 1.05;
    b.mouth.setAttribute('d', 'M' + (x - hw).toFixed(1) + ' ' + y.toFixed(1) + 'Q' + x.toFixed(1) + ' ' + (y + 2 * d).toFixed(1) + ' ' + (x + hw).toFixed(1) + ' ' + y.toFixed(1) + (open ? 'Z' : ''));
    b.mouth.classList.toggle('open', open);
  }

  /* ---------- layout (SVG units; recomputed on resize) ---------- */
  function layout() {
    var w = WORDS[st.idx]; if (!w) return;
    var r0 = wrap.getBoundingClientRect();
    var aspect = r0.height > 0 ? r0.width / r0.height : 2;
    var W = Math.round(clamp(H * aspect, 640, 1200));
    stage.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var right = fromRight(), Plets = partnerLetters(w), Flets = friendLetters(w);
    var nP = Plets.length, nF = Flets.length;
    var M = 16, R = W >= 900 ? 64 : 58, CY = 196, HOLD = 2 * R + 46, LINK = 2 * R + 66, LIFT = 40, WY = 364;
    var rx = [], fx = [], lead0, leadEnd, snapPos;
    if (!right) {
      rx[nP - 1] = W - M - R * 1.25;
      for (var i = nP - 2; i >= 0; i--) rx[i] = rx[i + 1] - HOLD;
      lead0 = M + R * 1.3 + (nF - 1) * HOLD;
      leadEnd = rx[0] - LINK;
      snapPos = leadEnd - lead0;
      for (var q = 0; q < nF; q++) fx[q] = lead0 - (nF - 1 - q) * HOLD;
    } else {
      rx[0] = M + R * 1.25;
      for (var i2 = 1; i2 < nP; i2++) rx[i2] = rx[i2 - 1] + HOLD;
      lead0 = W - M - R * 1.3;
      leadEnd = rx[nP - 1] + LINK;
      snapPos = lead0 - leadEnd;
      for (var q2 = 0; q2 < nF; q2++) fx[q2] = lead0 + q2 * HOLD;
    }
    var yA = CY + R * 0.42;
    var closeP = right ? nP - 1 : 0;
    var dir = right ? -1 : 1;
    clear(el.armLayer); clear(el.ribbon); clear(el.right); clear(mover); clear(el.blendG); clear(el.restG); clear(el.burst);
    var G = { W: W, R: R, CY: CY, yA: yA, lead0: lead0, leadEnd: leadEnd, snapPos: snapPos, rx: rx, fx: fx, nP: nP, nF: nF, LIFT: LIFT, fromRight: right, dir: dir, closeP: closeP };
    app.classList.toggle('friend-right', right);
    document.documentElement.classList.toggle('friend-right', right);
    G.goal = mk('circle', { cx: leadEnd.toFixed(1), cy: CY, r: R, stroke: letterStyle(Flets[right ? 0 : nF - 1]).color }, el.armLayer, 'goal');
    var first = buildBuddyPlaceholder(Plets[closeP]);
    G.longArm = arm(el.armLayer, first.dark); G.longArm.g.classList.add('long-arm');
    G.longA = [rx[closeP] - dir * R * 0.84, CY + R * 0.28];
    G.longB = [lead0 + dir * R * 1.28, yA];
    G.meet = [(leadEnd + rx[closeP]) / 2, CY + R * 0.02];
    var hold = (FR && FR.hold) || 's', rc = letterStyle(Flets[right ? 0 : nF - 1]).color;
    var xs = right ? leadEnd - R * 0.4 : lead0 - R * 0.2, xe = right ? lead0 + R * 0.2 : leadEnd + R * 0.4, amp = R * 0.1, dd = '';
    for (var k = 0; k <= 80; k++) { var x = lerp(xs, xe, k / 80); dd += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (yA + amp * Math.sin((x - xs) / (R * 0.55))).toFixed(1); }
    var e1 = mk('path', { d: dd, stroke: rc }, el.ribbon, 'ribbon-edge'); e1.style.strokeWidth = (R * 0.56) + 'px';
    var e2 = mk('path', { d: dd, stroke: shade(rc, 0.72) }, el.ribbon, 'ribbon-fill'); e2.style.strokeWidth = (R * 0.56 - 8) + 'px';
    for (var xx = xs + R * 0.25; xx < xe; xx += R * 0.4) {
      var tt = mk('text', { x: xx.toFixed(1), y: (yA + amp * Math.sin((xx - xs) / (R * 0.55))).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: shade(rc, -0.15) }, el.ribbon, 'ribbon-s');
      tt.textContent = hold; tt.style.fontSize = (R * 0.42) + 'px';
    }
    el.clip.setAttribute('x', lead0.toFixed(1)); el.clip.setAttribute('y', 0); el.clip.setAttribute('height', H); el.clip.setAttribute('width', '0');
    G.rightB = Plets.map(function (ch, j) { return buildBuddy(el.right, ch, rx[j], CY, R); });
    G.rightB[closeP].g.classList.add('tap-target');
    for (var j = 0; j + 1 < nP; j++) {
      var a1 = arm(el.right, G.rightB[j].dark), a2 = arm(el.right, G.rightB[j + 1].dark);
      el.right.insertBefore(a1.g, el.right.firstChild); el.right.insertBefore(a2.g, el.right.firstChild);
      var midp = (rx[j] + rx[j + 1]) / 2;
      setArm(a1, [rx[j] + R * 0.84, CY + R * 0.28], [midp - 5, CY + R * 0.5], 7, R);
      setArm(a2, [rx[j + 1] - R * 0.84, CY + R * 0.28], [midp + 5, CY + R * 0.5], -7, R);
    }
    var pOuterIdx = right ? 0 : nP - 1, pSign = right ? -1 : 1;
    G.pOuterIdx = pOuterIdx; G.pSign = pSign;
    G.rightOuter = arm(el.right, G.rightB[pOuterIdx].dark); el.right.insertBefore(G.rightOuter.g, el.right.firstChild);
    var hitX = right ? lead0 - R * 1.6 : lead0 - (nF - 1) * HOLD - R * 1.6;
    mk('rect', { x: hitX, y: CY - R * 1.6, width: (nF - 1) * HOLD + R * 3.2, height: R * 3.2, rx: R * 1.2 }, mover, 'hit');
    G.leftB = Flets.map(function (ch, qi) { return buildBuddy(mover, ch, fx[qi], CY, R); });
    G.leftB[right ? 0 : nF - 1].g.classList.add('lead');
    G.leadArm = arm(mover, G.leftB[right ? 0 : nF - 1].dark); mover.insertBefore(G.leadArm.g, mover.firstChild);
    var fOuterIdx = right ? nF - 1 : 0, fSign = right ? 1 : -1;
    G.fOuterIdx = fOuterIdx; G.fSign = fSign;
    G.leftOuter = arm(mover, G.leftB[fOuterIdx].dark); mover.insertBefore(G.leftOuter.g, mover.firstChild);
    for (var q3 = 0; q3 + 1 < nF; q3++) {
      var b1 = arm(mover, G.leftB[q3].dark), b2 = arm(mover, G.leftB[q3 + 1].dark), m2 = (fx[q3] + fx[q3 + 1]) / 2;
      mover.insertBefore(b1.g, mover.firstChild); mover.insertBefore(b2.g, mover.firstChild);
      setArm(b1, [fx[q3] + R * 0.84, CY + R * 0.28], [m2 - 5, CY + R * 0.5], 7, R);
      setArm(b2, [fx[q3 + 1] - R * 0.84, CY + R * 0.28], [m2 + 5, CY + R * 0.5], -7, R);
    }
    G.heart = mk('path', { d: heartPath(G.meet[0], G.meet[1] - R * 0.62, R * 0.2) }, el.armLayer, 'heart');
    el.tapCircle.setAttribute('cx', rx[closeP]); el.tapCircle.setAttribute('cy', CY); el.tapCircle.setAttribute('r', R + 8);
    el.tapCircle.setAttribute('stroke', letterStyle(Plets[closeP]).color);
    var leftEdge, rightEdge;
    if (!right) {
      leftEdge = fx[0] + snapPos - R * 1.3; rightEdge = rx[nP - 1] + R * 1.3;
    } else {
      leftEdge = rx[0] - R * 1.3; rightEdge = fx[nF - 1] - snapPos + R * 1.3;
    }
    G.shiftDone = W / 2 - (leftEdge + rightEdge) / 2;
    var Fsz = W >= 900 ? 112 : 100, segs = wordSegs(w);
    var bar = mk('rect', { x: 0, y: 0, width: 0, height: 0 }, el.blendG, 'link-bar');
    var nodes = segs.map(function (s) {
      var n = mk('text', { x: 0, y: WY, 'dominant-baseline': 'central' }, (s.color || s.kind === 'blend') ? el.blendG : el.restG, 'word-text seg' + (s.color || s.kind === 'blend' ? ' blend' : ' rest') + (s.sSeg ? ' s-seg' : ''));
      if (s.color) n.style.setProperty('--c', shade(s.color, -0.12));
      return n;
    });
    var widths, total, tries = 0;
    for (;;) {
      widths = segs.map(function (s, i3) { return measure(nodes[i3], s.t, Fsz); });
      total = widths.reduce(function (a, b) { return a + b; }, 0);
      if (total <= W - 2 * M - 40 || tries++ > 6) break;
      Fsz = Math.floor(Fsz * (W - 2 * M - 40) / total);
    }
    var x0 = W / 2 - total / 2, xcur = x0;
    nodes.forEach(function (n, i4) { n.setAttribute('x', xcur.toFixed(1)); xcur += widths[i4]; });
    var i0 = -1, i1 = -1, xB = x0;
    segs.forEach(function (s, i5) {
      if (s.kind === 'blend' || s.kind === 'mid' || s.color) { if (i0 < 0) { i0 = i5; xB = x0 + widths.slice(0, i5).reduce(function (a, b) { return a + b; }, 0); } i1 = i5; }
    });
    var bw = 0; if (i0 >= 0) { for (var i6 = i0; i6 <= i1; i6++) bw += widths[i6]; }
    bar.setAttribute('x', (xB + 2).toFixed(1)); bar.setAttribute('width', Math.max(0, bw - 4).toFixed(1));
    bar.setAttribute('y', (WY + Fsz * 0.44).toFixed(1)); bar.setAttribute('height', (Fsz * 0.09).toFixed(1)); bar.setAttribute('rx', (Fsz * 0.045).toFixed(1));
    bar.setAttribute('fill', letterStyle((FR && FR.letters) || 's').color);
    var wW = measure(el.without, w.without || '', Fsz), startX = W / 2 - wW / 2;
    var slides = !!w.without && w.word === w.without + (w.s || 's');
    var endX = slides ? x0 : startX;
    el.without.setAttribute('x', endX.toFixed(1)); el.without.setAttribute('y', WY); el.without.setAttribute('text-anchor', 'start');
    el.without.style.setProperty('--mx', (startX - endX).toFixed(1) + 'px');
    stage.classList.toggle('morph-slide', slides);
    var rxB = total / 2 + 46, ryB = Fsz * 0.58 + 6, cxB = W / 2;
    for (var b = 0; b < 10; b++) {
      var ang = -Math.PI / 2 + b * Math.PI * 2 / 10 + 0.3, fx2 = clamp(cxB + rxB * Math.cos(ang), 24, W - 24), fy = clamp(WY + ryB * Math.sin(ang), WY - ryB, H - 18);
      var sp = mk('path', { d: starPath(cxB, WY, b % 2 ? 11 : 16) }, el.burst, 'burst-star' + (b % 3 === 0 ? ' alt' : ''));
      sp.style.setProperty('--dx', (fx2 - cxB).toFixed(1) + 'px');
      sp.style.setProperty('--dy', (fy - WY).toFixed(1) + 'px');
      sp.style.animationDelay = (b * 0.03).toFixed(2) + 's';
    }
    el.caption.setAttribute('x', W / 2); el.caption.setAttribute('y', 34);
    G.wordBox = { x: x0, w: total, y: WY - Fsz * 0.6, h: Fsz * 1.2 };
    G.F = Fsz;
    st.G = G;
    render();
  }

  function buildBuddyPlaceholder(ch) { var c = letterStyle(ch); return { dark: shade(c.color, -0.28) }; }
  function starPath(cx, cy, R1) {
    var R2 = R1 * 0.45, s = '';
    for (var j = 0; j < 10; j++) { var a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? R2 : R1; s += (j ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }
    return s + 'Z';
  }
  function heartPath(x, y, s) {
    return 'M' + x + ' ' + (y + s * 0.9) + 'C' + (x - s * 1.6) + ' ' + (y - s * 0.2) + ' ' + (x - s * 0.7) + ' ' + (y - s * 1.3) + ' ' + x + ' ' + (y - s * 0.45) +
      'C' + (x + s * 0.7) + ' ' + (y - s * 1.3) + ' ' + (x + s * 1.6) + ' ' + (y - s * 0.2) + ' ' + x + ' ' + (y + s * 0.9) + 'Z';
  }

  /* ---------- pictures (pictures.js) ---------- */
  function picInto(svg, word) {
    var P = window.BBPictures, markup = P && P.has(word) ? P.svg(word) : '';
    clear(svg); svg.setAttribute('data-word', word || '');
    if (markup) svg.insertAdjacentHTML('beforeend', markup);   // our own markup (pictures.js), no user input
  }
  function popIn(node, cls) { cls = cls || 'pop-in'; node.classList.remove(cls); void node.getBoundingClientRect(); node.classList.add(cls); }
  function showPic(which) {   // 'a' = the no-S word's picture, 'b' = the S word's picture
    if (st.pic === which) return;
    st.pic = which; el.picCard.classList.toggle('show-a', which === 'a'); el.picCard.dataset.pic = which;
    popIn(which === 'a' ? el.picA : el.picB);
  }
  function chipLabel(btn, text, isTarget) {
    btn.textContent = '';
    var ic = document.createElementNS(NS, 'svg'); ic.setAttribute('viewBox', '0 0 200 200'); ic.setAttribute('class', 'pic chip-pic'); ic.setAttribute('aria-hidden', 'true');
    picInto(ic, text); btn.appendChild(ic);
    var s = document.createElement('span'); s.className = 'chip-word';
    markKs(s, text, isTarget);
    btn.appendChild(s);
    var sp = document.createElementNS(NS, 'svg'); sp.setAttribute('viewBox', '0 0 24 24'); sp.setAttribute('aria-hidden', 'true'); sp.setAttribute('class', 'chip-spk');
    mk('path', { d: 'M4 9v6h4l5 4V5L8 9z' }, sp); mk('path', { d: 'M16 8.5a5 5 0 0 1 0 7' }, sp);
    btn.appendChild(sp); btn.setAttribute('aria-label', 'Hear “' + text + '”'); btn.dataset.word = text;
  }

  /* ---------- state -> view ---------- */
  function shownWord() { var w = WORDS[st.idx]; return !w ? '' : st.pairFlow && !st.done ? w.without : w.word; }
  function render() {
    var G = st.G, w = WORDS[st.idx]; if (!G || !w) return;
    var R = G.R, CY = G.CY, pos = st.pos, L = st.link, p = G.snapPos > 0 ? pos / G.snapPos : 1, dir = G.dir || 1, right = !!G.fromRight;
    mover.style.transform = 'translate(' + (dir * pos).toFixed(1) + 'px,0px)';
    if (right) el.clip.setAttribute('x', (G.lead0 - pos).toFixed(1));
    el.clip.setAttribute('width', Math.max(0, pos).toFixed(1));
    setArm(G.longArm, G.longA, [lerp(G.longB[0], G.meet[0] - 7 * dir, L), lerp(G.longB[1], G.meet[1], L)], lerp(8, -24, L) * dir, R, lerp(0.21, 0.15, L));
    var lead = G.fx[right ? 0 : G.nF - 1], sh = [lead + dir * R * 0.84, CY + R * 0.28];
    var handPlay = [lead + dir * R * 1.22, G.yA - 2], handLink = [G.meet[0] + 7 * dir - dir * G.snapPos, G.meet[1]];
    setArm(G.leadArm, sh, [lerp(handPlay[0], handLink[0], L), lerp(handPlay[1], handLink[1], L)], lerp(-6, 24, L) * dir, R);
    var fX = G.fx[G.fOuterIdx], fS = G.fSign;
    setArm(G.leftOuter, [fX + fS * R * 0.84, CY + R * 0.28], [fX + fS * R * lerp(1.18, 1.2, L), CY + R * lerp(0.78, -0.5, L)], lerp(-8, 10, L) * fS, R);
    var cheer = st.done ? 1 : 0, pX = G.rx[G.pOuterIdx], pS = G.pSign;
    setArm(G.rightOuter, [pX + pS * R * 0.84, CY + R * 0.28], [pX + pS * R * lerp(1.18, 1.2, cheer || L), CY + R * lerp(0.78, -0.5, cheer || L)], lerp(8, -10, cheer || L) * pS, R);
    // in a pair word the buddy starts out alone and a bit sad, and cheers up as S comes closer
    var smile = st.pairFlow && L === 0 ? lerp(-1, 1, clamp(p * 1.6, 0, 1)) : 1 + L;
    G.leftB.forEach(function (b) { setMouth(b, CY, R, 1 + L); });
    G.rightB.forEach(function (b) { setMouth(b, CY, R, smile); });
    stage.classList.toggle('done', st.done);
    stage.classList.toggle('pairflow', st.pairFlow);
    stage.classList.toggle('alone', st.pairFlow && pos < 0.5 && !st.locking && !st.done);
    stage.classList.toggle('linked', L > 0.98);
    stage.classList.toggle('moving', pos > 0.5 || st.locking);
    var shift = st.done ? G.shiftDone : 0, lift = st.done ? -G.LIFT : 0;
    el.buddies.style.transform = 'translate(' + shift.toFixed(1) + 'px,' + lift + 'px)';
    var pct = Math.round(clamp(st.done ? 1 : p, 0, 1) * 100);
    handle.style.left = (G.fromRight ? (100 - pct) : pct) + '%'; el.fill2.style.width = pct + '%';
    mover.setAttribute('aria-valuenow', pct); track.setAttribute('aria-valuenow', pct);
    el.caption.textContent = !st.pairFlow ? '' : st.done ? FR.name + ' made a new word!' : 'Can ' + FR.name + ' make a new word?';
    app.dataset.progress = pct; app.dataset.done = st.done ? '1' : '0'; app.dataset.word = w.id;
    app.dataset.view = st.done ? 'done' : 'play';
    app.dataset.flow = st.pairFlow ? 'pair' : 'single';
    app.dataset.shown = shownWord();
    app.dataset.link = L.toFixed(2);
    app.classList.toggle('hint', !st.done && !st.locking && pct === 0);
    // compare chips: space is always kept on pair words, they become visible once S has made the new word
    el.cmp.hidden = !st.pairFlow; el.cmp.classList.toggle('shown', st.pairFlow && st.done);
    el.cmpA.disabled = el.cmpB.disabled = !(st.pairFlow && st.done);
    el.hear.hidden = !(st.done || st.pairFlow);
    el.hear.setAttribute('aria-label', 'Hear “' + shownWord() + '” again');
    renderSay();
  }
  function renderSay() {
    var w = WORDS[st.idx];
    if (!st.say || !w) { el.say.hidden = true; return; }
    el.say.hidden = false; el.say.textContent = '';
    var b = document.createElement('b');
    if (st.done) { el.say.appendChild(document.createTextNode('Say it! ')); b.textContent = w.word; el.say.appendChild(b); }
    else { el.say.appendChild(document.createTextNode('Hold “' + w.partner + '”, then “' + new Array(6).join(FR.hold || 's') + '”: ')); b.textContent = w.word; el.say.appendChild(b); }
  }
  function speakShown() { Speech.say(shownWord()); }
  function setPos(pos) {
    var G = st.G; if (!G || st.done || st.locking) return;
    st.pos = clamp(pos, 0, G.snapPos);
    render();
    if (st.pos >= G.snapPos * 0.985) complete();
  }
  function complete() {
    if (st.done || st.locking || !st.G) return;
    st.locking = true; Sound.whooshStop(); app.classList.add('anim');
    var G = st.G, from = st.pos, idx = st.idx;
    tween(from, G.snapPos, 120 + 260 * (1 - from / G.snapPos), function (v) { st.pos = v; render(); }, function () {   // 1) S slides the last bit
      tween(0, 1, 480, function (v) { st.link = v; render(); }, function () {                                     // 2) arms swing in and link
        Sound.pop(); stage.classList.add('popped');
        later(function () { stage.classList.add('tapped'); Sound.tap(); }, 140);                                      // 3) tap-pop on the second sound
        later(function () {                                                                                            // 4) blend letters light up + star burst
          st.locking = false; st.done = true; render();
          if (st.pairFlow) showPic('b');                                                                              //    pin's picture turns into spin's
          var word = WORDS[idx].word;
          mover.setAttribute('aria-label', FR.name + ' linked arms. The word is ' + word + '.');
          announce('Linked! ' + word);
          Sound.chime(Speech.available());
          later(function () { if (st.done && st.idx === idx) Speech.say(word); }, 520);               // 5) say the word, after the chime's attack
        }, 420);
      }, easeInOut);
    });
  }
  function resetView() {
    clearTimers(); Sound.whooshStop(); Speech.cancel();
    stage.classList.remove('popped', 'tapped');
    st.locking = false; st.done = false; st.link = 0;
    mover.setAttribute('aria-label', FR.name + ' character. Drag along the arm to link arms.');
  }
  function reset() {
    var from = st.pos; resetView(); if (st.pairFlow) showPic('a'); render();
    tween(from, 0, 320, function (v) { st.pos = v; render(); });
  }
  /* ---------- word / mode / picker ---------- */
  function setURL(q) { try { history.replaceState(null, '', location.pathname + q); } catch (e) { /* ignore */ } }
  function updateURL() {
    var w = WORDS[st.idx], q = !w ? '' : st.pair >= 0 ? '?mp=' + encodeURIComponent(w.id) : '?w=' + encodeURIComponent(w.word);
    if (st.mode === 'slide') q += (q ? '&' : '?') + 'm=slider';
    setURL(q + urlExtra(q));
  }
  function urlExtra(q) { var x = [st.motionOn === false ? 'motion=off' : '', hook('urlExtra')].filter(Boolean).join('&'); return x ? (q ? '&' : '?') + x : ''; }
  function setLabel(chipText, bg, ink, rest) {
    el.secLabel.textContent = '';
    var chip = document.createElement('b'); chip.textContent = chipText; chip.style.background = bg; chip.style.color = ink;
    el.secLabel.appendChild(chip); el.secLabel.appendChild(document.createTextNode('  ' + rest));
  }
  function loadWord(i) {
    Speech.cancel(); leaveListen();
    st.idx = (i + WORDS.length) % WORDS.length; st.pair = -1;
    var w = WORDS[st.idx], g = GROUPS[w.group];
    var list = WORDS.filter(function (x) { return x.group === w.group; });
    setLabel(g.name, g.color, g.ink, 'word ' + (list.indexOf(w) + 1) + ' of ' + list.length);
    app.style.setProperty('--gbg', g.bg); app.style.setProperty('--gc', g.color);
    app.classList.remove('listen-mode');
    st.pairFlow = !!w.without;
    picInto(el.picB, w.word); picInto(el.picA, w.without || '');
    st.pic = ''; showPic(st.pairFlow ? 'a' : 'b');
    el.picCard.setAttribute('aria-label', 'Picture: ' + (st.pairFlow ? w.without : w.word) + '. Tap to hear it.');
    if (st.pairFlow) { chipLabel(el.cmpA, w.without, false); chipLabel(el.cmpB, w.word, true); }
    stage.setAttribute('aria-label', st.pairFlow ? 'The word is ' + w.without + '. Can ' + FR.name + ' make a new word?' : FR.name + ' and ' + w.partner.toUpperCase() + ' link arms to make ' + w.word);
    $('picker').hidden = true; $('play').hidden = false; el.listen.hidden = true; el.stageArea.hidden = false;
    resetView(); st.pos = 0; app.classList.remove('anim');
    layout(); updateURL();
    popIn(el.stageArea, 'fade-in');
    requestAnimationFrame(function () { requestAnimationFrame(function () { app.classList.add('anim'); }); });
  }

  /* ---------- listen slides: which word did you hear? (one set per blend section) ---------- */
  function setOf(k) {   // the pairs of the same section, in list order
    var gid = WORDS[PAIRS[k]].group, ks = [];
    PAIRS.forEach(function (wi, j) { if (WORDS[wi].group === gid) ks.push(j); });
    return { group: gid, name: GROUPS[gid].name, ks: ks, pos: ks.indexOf(k) };
  }
  function pairName(w) { return w.without + '/' + w.word; }
  function setTarget(word, src) {
    st.target = word || null; st.targetSrc = word ? src : '';
    app.dataset.target = st.target || ''; app.dataset.targetSrc = st.targetSrc;
    el.playLabel.textContent = st.target && st.targetSrc === 'play' ? 'Hear it again' : 'Play a word';
    el.listenQ.textContent = st.target ? 'Which one did you hear?' : 'Tap a picture to hear it.';
    hook('target', { word: st.target, source: st.targetSrc });
  }
  function slideCtx() {
    var w = WORDS[st.idx], so = setOf(st.pair);
    return { pair: pairName(w), words: [w.without, w.word], set: so.group, setName: so.name, index: so.pos, count: so.ks.length,
      slot: el.extra, overlayHost: el.cards, setTarget: function (word) { if (word === w.word || word === w.without || !word) setTarget(word, 'adult'); },
      next: function () { goPair(st.pair + 1); }, refreshURL: updateURL };
  }
  function loadPair(k) {
    k = (k + PAIRS.length) % PAIRS.length;
    resetView();
    st.pair = k; st.idx = PAIRS[k]; st.pairFlow = false;
    var w = WORDS[st.idx], g = GROUPS[w.group], so = setOf(k);
    setLabel('listen', '#5236C4', '#FFFFFF', g.name + ' · ' + (so.pos + 1) + ' of ' + so.ks.length);
    app.style.setProperty('--gbg', g.bg); app.style.setProperty('--gc', g.color);
    app.classList.add('listen-mode');
    $('picker').hidden = true; $('play').hidden = false; el.stageArea.hidden = true; el.cmp.hidden = true; el.listen.hidden = false;
    el.say.hidden = true; el.hear.hidden = true;
    st.order = Math.random() < 0.5 ? [w.without, w.word] : [w.word, w.without];
    [el.cardL, el.cardR].forEach(function (c, j) {
      var word = st.order[j]; c.classList.remove('right', 'wrong', 'reveal');
      c.dataset.word = word; c.setAttribute('aria-label', word);
      picInto(c.querySelector('svg'), word);
      var lab = c.querySelector('.card-word'); lab.textContent = '';
      markKs(lab, word, word === w.word);
      popIn(c);
    });
    setTarget(null, '');
    app.dataset.word = w.id; app.dataset.view = 'listen'; app.dataset.done = '0'; app.dataset.flow = 'listen'; app.dataset.shown = '';
    app.dataset.set = so.group; app.dataset.pair = pairName(w);
    updateURL();
    hook('slide', slideCtx());
  }
  function leaveListen() { if (st.pair >= 0) hook('leave'); st.target = null; }
  function goPair(k) { loadPair(k); }
  function answer(card) {
    var w = WORDS[st.idx], word = card.dataset.word; if (!w || st.pair < 0) return;
    if (!st.target) { Speech.say(word); flash(card); return; }   // nothing asked yet: tapping a picture just says its word
    var target = st.target, ok = word === target, other = card === el.cardL ? el.cardR : el.cardL;
    hook('answer', { pair: pairName(w), set: setOf(st.pair).group, target: target, tapped: word, correct: ok, source: st.targetSrc });
    [el.cardL, el.cardR].forEach(function (c) { c.classList.remove('right', 'wrong', 'reveal'); void c.getBoundingClientRect(); });
    if (ok) { card.classList.add('right'); Sound.chime(true); announce('Yes! ' + target); }
    else { card.classList.add('wrong'); other.classList.add('reveal'); announce('That was ' + target); }
    app.dataset.last = (ok ? 'right:' : 'wrong:') + word;
    setTarget(null, '');
  }

  function step(d) {
    if (st.pair >= 0) {
      var so = setOf(st.pair);
      if (d > 0 && so.pos === so.ks.length - 1 && hook('setEnd', { set: so.group, setName: so.name, ctx: slideCtx() }) === true) return;   // e.g. tally summary first
      loadPair(st.pair + d);
    } else loadWord(st.idx + d);
  }
  function flash(node) { node.classList.remove('flash'); void node.getBoundingClientRect(); node.classList.add('flash'); later(function () { node.classList.remove('flash'); }, 700); }
  function setMode(m) {
    st.mode = m === 'slide' ? 'slide' : 'drag';
    var slide = st.mode === 'slide';
    $('modeDrag').setAttribute('aria-checked', String(!slide)); $('modeSlide').setAttribute('aria-checked', String(slide));
    document.querySelector('.mode').classList.toggle('slide', slide);
    $('sliderRow').hidden = !slide; mover.classList.toggle('no-drag', slide);
    mover.setAttribute('tabindex', slide ? '-1' : '0');
    app.dataset.mode = st.mode;
    if (st.idx >= 0 && st.pair < 0) { resetView(); st.pos = 0; if (st.pairFlow) showPic('a'); layout(); updateURL(); }
    else if (st.pair >= 0) updateURL();
  }
  function blendSpan(parent, w) {
    wordSegs(w).forEach(function (seg) {
      if (seg.color) { var s = document.createElement('span'); s.className = 'bl'; s.textContent = seg.t; s.style.color = shade(seg.color, -0.12); parent.appendChild(s); }
      else parent.appendChild(document.createTextNode(seg.t));
    });
  }
  function groupBox(id, name, sub, bg, color, ink) {
    var box = document.createElement('div'); box.className = 'group'; box.id = 'grp-' + id;
    box.style.setProperty('--gbg', bg); box.style.setProperty('--gc', color);
    var h = document.createElement('h2'), chip = document.createElement('span');
    chip.className = 'chip'; chip.textContent = name; chip.style.background = color; chip.style.color = ink; h.appendChild(chip);
    if (sub) { var sm = document.createElement('small'); sm.textContent = sub; h.appendChild(sm); }
    box.appendChild(h);
    var grid = document.createElement('div'); grid.className = 'word-grid'; box.appendChild(grid);
    return { box: box, grid: grid };
  }
  function buildPicker() {
    var groups = $('groups');
    DATA.groups.forEach(function (g) {
      var gb = groupBox(g.id, g.name, g.sub, g.bg, g.color, g.ink);
      WORDS.forEach(function (w, i) {
        if (w.group !== g.id) return;
        var a = document.createElement('a'); a.className = 'word-btn'; a.href = '?w=' + encodeURIComponent(w.word);
        a.dataset.w = w.id;
        var ic = document.createElementNS(NS, 'svg'); ic.setAttribute('viewBox', '0 0 200 200'); ic.setAttribute('class', 'pic btn-pic'); ic.setAttribute('aria-hidden', 'true');
        picInto(ic, w.word); a.appendChild(ic);
        var t = document.createElement('span'); t.className = 'btn-word'; blendSpan(t, w); a.appendChild(t);
        a.addEventListener('click', function (e) { e.preventDefault(); loadWord(i); });
        gb.grid.appendChild(a);
      });
      groups.appendChild(gb.box);
    });
    if (PAIRS.length) {
      var pb = groupBox('pairs', 'listen', 'which one did you hear? one set per blend', '#F4F1FF', '#5236C4', '#FFFFFF');
      pb.box.classList.add('group-pairs');
      PAIRS.forEach(function (wi, k) {
        var w = WORDS[wi], a = document.createElement('a'); a.className = 'word-btn pair-btn'; a.href = '?mp=' + encodeURIComponent(w.id);
        a.dataset.mp = w.id; blendSpan(a, w);
        var vs = document.createElement('span'); vs.className = 'vs'; vs.textContent = '·'; a.appendChild(vs);
        a.appendChild(document.createTextNode(w.without));
        a.addEventListener('click', function (e) { e.preventDefault(); loadPair(k); });
        pb.grid.appendChild(a);
      });
      groups.appendChild(pb.box);
    }
  }
  function showPicker(gid, missing) {
    leaveListen(); resetView(); app.classList.remove('listen-mode');
    $('play').hidden = true; $('picker').hidden = false;
    var nf = $('notFound');
    if (missing) { nf.hidden = false; nf.textContent = 'Couldn’t find “' + missing + '”. Pick one below.'; } else nf.hidden = true;
    document.querySelectorAll('.group').forEach(function (g) { g.classList.toggle('hl', g.id === 'grp-' + gid); });
    var target = gid && $('grp-' + gid);
    if (target) target.scrollIntoView({ block: 'start' }); else $('picker').scrollTop = 0;
    st.idx = -1; st.pair = -1; app.dataset.word = ''; app.dataset.view = 'picker';
    var q = gid && (GROUPS[gid] || gid === 'pairs') ? '?g=' + gid : '';
    if (st.mode === 'slide') q += (q ? '&' : '?') + 'm=slider';
    setURL(q + urlExtra(q));
  }

  /* ---------- input: drag mode (Pointer Events on S) ---------- */
  var drag = null;
  function svgScale() { var m = stage.getScreenCTM(); return m ? m.a : 1; }
  mover.addEventListener('pointerdown', function (e) {
    if (st.mode !== 'drag' || st.done || st.locking || drag) return;
    e.preventDefault();
    try { mover.setPointerCapture(e.pointerId); } catch (x) {}
    stopTween();
    drag = { id: e.pointerId, x: e.clientX, pos: st.pos, k: svgScale(), lx: e.clientX, lt: performance.now() };
    app.classList.remove('anim', 'hint'); mover.classList.add('dragging');
  });
  function speedOf(o, x) {   // screen px per ms, smoothed
    var now = performance.now(), dt = Math.max(8, now - o.lt), v = Math.abs(x - o.lx) / dt;
    o.v = o.v === undefined ? v : o.v * 0.6 + v * 0.4; o.lx = x; o.lt = now; return o.v;
  }
  mover.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    e.preventDefault();
    var before = st.pos;
    setPos(drag.pos + ((e.clientX - drag.x) / drag.k) * (st.G && st.G.fromRight ? -1 : 1));
    if (drag && st.pos !== before) Sound.whoosh(speedOf(drag, e.clientX));
    if (st.done || st.locking) endDrag(e);
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    try { mover.releasePointerCapture(drag.id); } catch (x) {}
    drag = null; mover.classList.remove('dragging'); Sound.whooshStop();
    if (!st.done && !st.locking && st.G && st.pos >= st.G.snapPos * 0.93) complete();   // nearly there: snap in
    // otherwise S stays exactly where it was let go (no snapping back)
  }
  mover.addEventListener('pointerup', endDrag);
  mover.addEventListener('pointercancel', endDrag);
  mover.addEventListener('lostpointercapture', endDrag);

  /* ---------- input: slider mode ---------- */
  var sl = null;
  function slideTo(clientX) {
    var r = track.getBoundingClientRect(); if (!r.width || !st.G) return;
    var t = clamp((clientX - r.left) / r.width, 0, 1);
    setPos((st.G.fromRight ? 1 - t : t) * st.G.snapPos);
  }
  track.addEventListener('pointerdown', function (e) {
    if (st.done || st.locking || sl) return;
    e.preventDefault();
    try { track.setPointerCapture(e.pointerId); } catch (x) {}
    stopTween();
    app.classList.remove('anim', 'hint'); track.classList.add('dragging');
    var hr = handle.getBoundingClientRect(), onHandle = e.clientX >= hr.left && e.clientX <= hr.right;
    sl = { id: e.pointerId, off: onHandle ? e.clientX - (hr.left + hr.width / 2) : 0, lx: e.clientX, lt: performance.now() };
    if (!onHandle) slideTo(e.clientX);
  });
  track.addEventListener('pointermove', function (e) {
    if (!sl || e.pointerId !== sl.id) return;
    e.preventDefault(); var before = st.pos; slideTo(e.clientX - sl.off);
    if (sl && st.pos !== before) Sound.whoosh(speedOf(sl, e.clientX));
    if (st.done || st.locking) endSlide(e);
  });
  function endSlide(e) {
    if (!sl || (e && e.pointerId !== sl.id)) return;
    try { track.releasePointerCapture(sl.id); } catch (x) {}
    sl = null; track.classList.remove('dragging'); Sound.whooshStop();
    if (!st.done && !st.locking && st.G && st.pos >= st.G.snapPos * 0.95) complete();
  }
  track.addEventListener('pointerup', endSlide);
  track.addEventListener('pointercancel', endSlide);
  track.addEventListener('lostpointercapture', endSlide);

  /* keyboard: arrows move S / the handle, End finishes, PageDown/PageUp = next/prev (presentation clickers) */
  function keyStep(e) {
    if (!st.G || st.done || st.locking || st.pair >= 0) return;
    var step0 = st.G.snapPos / 20, target = null;
    var kdir = (st.G && st.G.fromRight) ? -1 : 1;
    if (e.key === 'ArrowRight') target = st.pos + step0 * kdir;
    else if (e.key === 'ArrowLeft') target = st.pos - step0 * kdir;
    else if (e.key === 'End') { e.preventDefault(); complete(); return; }
    else if (e.key === 'Home') target = 0;
    if (target === null) return;
    e.preventDefault();
    var from = st.pos, to = clamp(target, 0, st.G.snapPos);
    if (to >= st.G.snapPos * 0.985) { complete(); return; }
    tween(from, to, 160, function (v) { setPos(v); });
  }
  mover.addEventListener('keydown', keyStep); track.addEventListener('keydown', keyStep);
  document.addEventListener('keydown', function (e) {
    if ($('play').hidden || st.idx < 0) return;
    if (e.key === 'PageDown') { e.preventDefault(); step(1); }
    else if (e.key === 'PageUp') { e.preventDefault(); step(-1); }
  });

  /* stop page scroll, bounce and pinch-zoom while touching the play area (iOS Safari) */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (t) { document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false }); });
  $('play').addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (!$('play').hidden) e.preventDefault(); });

  /* ---------- buttons ---------- */
  $('btnPrev').addEventListener('click', function () { step(-1); });
  $('btnNext').addEventListener('click', function () { step(1); });
  $('btnReset').addEventListener('click', reset);
  el.hear.addEventListener('click', function () { speakShown(); flash(wrap); });
  el.wordRow.addEventListener('click', function () { if (!st.locking) speakShown(); });   // tap the word to hear it
  $('btnWords').addEventListener('click', function () { var w = WORDS[st.idx]; showPicker(st.pair >= 0 ? 'pairs' : w ? w.group : null); });
  $('btnSay').addEventListener('click', function () {
    st.say = !st.say; $('btnSay').setAttribute('aria-pressed', String(st.say)); renderSay();
    if (st.say) { var w = WORDS[st.idx]; if (w) Speech.say(w.word); }   // always the target word (spin), also before S has linked
  });
  // picture card: hear the word it shows. Compare chips (pair words, after the link): hear each word, show its picture
  function hearPic() { var w = WORDS[st.idx]; if (!w || st.pair >= 0) return; Speech.say(st.pic === 'a' ? w.without : w.word); flash(el.picCard); }
  el.picCard.addEventListener('click', hearPic);
  el.picCard.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hearPic(); } });
  [el.cmpA, el.cmpB].forEach(function (b) {
    b.addEventListener('click', function () {
      if (!st.done || !st.pairFlow) return;
      Speech.say(b.dataset.word); flash(b); showPic(b === el.cmpA ? 'a' : 'b');
      el.cmpA.setAttribute('aria-pressed', String(b === el.cmpA)); el.cmpB.setAttribute('aria-pressed', String(b === el.cmpB));
    });
  });
  el.play.addEventListener('click', function () {
    var w = WORDS[st.idx]; if (!w || st.pair < 0) return;
    if (!st.target || st.targetSrc !== 'play') setTarget(Math.random() < 0.5 ? w.word : w.without, 'play');
    Speech.say(st.target); flash(el.play);
  });
  [el.cardL, el.cardR].forEach(function (c) { c.addEventListener('click', function () { answer(c); }); });
  $('modeDrag').addEventListener('click', function () { setMode('drag'); });
  $('modeSlide').addEventListener('click', function () { setMode('slide'); });
  function renderSound() {
    var on = Sound.isOn(), b = $('btnSound');
    b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    b.classList.toggle('muted', !on); app.dataset.sound = on ? 'on' : 'off';
  }
  /* motion pause: stops the picture and idle animations (pictures stay, as still images); kept only in the link (?motion=off) */
  function renderMotion() {
    var on = st.motionOn !== false, b = $('btnMotion');
    b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Motion on. Tap to pause the moving pictures.' : 'Motion paused. Tap to play the moving pictures.');
    b.title = on ? 'Pause motion' : 'Play motion';
    b.classList.toggle('muted', !on); document.documentElement.classList.toggle('still', !on); app.dataset.motion = on ? 'on' : 'off';
  }
  $('btnMotion').addEventListener('click', function () { st.motionOn = st.motionOn === false; renderMotion(); if (app.dataset.ready === '1') { if ($('picker').hidden) updateURL(); else { var q = location.search.replace(/[?&]motion=off/g, '').replace(/^&/, '?'); if (q === '?') q = ''; setURL(q + urlExtra(q)); } } });
  $('btnSound').addEventListener('click', function () { Sound.setOn(!Sound.isOn()); if (!Sound.isOn()) Speech.cancel(); renderSound(); });   // not remembered: always starts ON

  /* ---------- start ---------- */
  function start(data) {
    DATA = data; WORDS = DATA.words; FR = DATA.friend || { letters: 's', side: 'left', name: 'S', hold: 's' };
    DATA.groups.forEach(function (g) { GROUPS[g.id] = g; });
    LET = DATA.letters || {};
    PAIRS = (DATA.pairs || []).map(function (id) { return findWord(id); }).filter(function (i) { return i >= 0 && WORDS[i].without; });
    document.title = (DATA.title || 'Blend Buddies') + ' – ' + (DATA.subtitle || '');
    buildPicker(); renderSound();
    var q0 = new URLSearchParams(location.search);
    st.motionOn = !(norm(q0.get('motion')) === 'off' || (mq && mq.matches)); renderMotion();
    var relayout = function () { if (st.idx >= 0 && st.pair < 0) layout(); };
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(wrap); else window.addEventListener('resize', relayout);
    var q = new URLSearchParams(location.search);
    var m = norm(q.get('m') || q.get('mode'));
    setMode(m === 'slider' || m === 'slide' || m === 'b' ? 'slide' : 'drag');
    if (q.get('say') === '1') { st.say = true; $('btnSay').setAttribute('aria-pressed', 'true'); }
    var w = q.get('w'), mp = q.get('mp'), g = norm(q.get('g')).replace(/-/g, '');
    if (!mp && w && /^pair-/i.test(norm(w))) mp = w;
    var gOk = GROUPS[g] || g === 'pairs' ? g : null;
    if (mp) { var k = findPair(mp); if (k >= 0) loadPair(k); else showPicker('pairs', mp); }
    else if (w) { var i = findWord(w); if (i >= 0) loadWord(i); else showPicker(gOk, w); }
    else showPicker(gOk);
    app.dataset.ready = '1';
  }
  var fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('600 100px Fredoka'), document.fonts.load('700 30px Fredoka')]).catch(function () {})
    : Promise.resolve();
  var wordsReady = Promise.resolve(window.BLEND_BUDDIES_DATA);
  Promise.all([wordsReady, fontsReady]).then(function (v) {
    if (!v[0] || !v[0].words) throw new Error('words');
    start(v[0]);
  }, function () {
    app.textContent = '';
    var p = document.createElement('p'); p.className = 'load-error';
    p.textContent = 'The word list could not load.';
    app.appendChild(p); app.dataset.ready = 'error';
  });
})();
