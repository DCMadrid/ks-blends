/* Blend Buddies – word pictures. Every picture is original and drawn here in code as inline SVG (200 x 200 units):
   flat shapes, thick rounded outlines and the page's calm palette. No images, clip art, icon sets, emoji or files.
   Gentle motion comes from CSS classes in style.css (a-spin, a-fall, ...); Reduce Motion turns it all off.
   API: window.BBPictures.has(word), .svg(word) -> inner SVG markup, .list() -> all words with a picture. */
(function () {
  'use strict';
  var Y = '#FFD45C', AM = '#F2A33A', RD = '#E85D5D', PK = '#F7A1C0', PU = '#8E6CFF', TE = '#14A3A3', BL = '#5DA9FF', LB = '#D6ECFF',
    GN = '#2CB67D', LG = '#A6DE8E', BR = '#B07A4F', TN = '#E8C192', GY = '#C6CAD8', WH = '#FFFFFF', SK = '#F6CBA8', DK = '#3B3D52',
    OR = '#F28B3C', WA = '#7DBBF2', CR = '#FFF4D6', FX = '#E39A4A';
  function at(o) { var s = ''; for (var k in o) if (o[k] !== undefined && o[k] !== null && o[k] !== '') s += ' ' + k + '="' + o[k] + '"'; return s; }
  function C(cx, cy, r, f, cl, tr) { return '<circle' + at({ cx: cx, cy: cy, r: r, fill: f || 'none', 'class': cl || 'o', transform: tr }) + '/>'; }
  function E(cx, cy, rx, ry, f, cl, tr) { return '<ellipse' + at({ cx: cx, cy: cy, rx: rx, ry: ry, fill: f || 'none', 'class': cl || 'o', transform: tr }) + '/>'; }
  function R(x, y, w, h, rx, f, cl, tr) { return '<rect' + at({ x: x, y: y, width: w, height: h, rx: rx, fill: f || 'none', 'class': cl || 'o', transform: tr }) + '/>'; }
  function P(d, f, cl, tr) { return '<path' + at({ d: d, fill: f || 'none', 'class': cl || 'o', transform: tr }) + '/>'; }
  function L(d, cl, tr) { return '<path' + at({ d: d, 'class': cl || 'ln', transform: tr }) + '/>'; }
  function LC(d, color, w, cl, extra) { return '<path' + at({ d: d, stroke: color, 'stroke-width': w, 'class': 'lc' + (cl ? ' ' + cl : '') }) + (extra || '') + '/>'; }
  function T(x, y, size, txt, f, cl) { return '<text' + at({ x: x, y: y, 'font-size': size, fill: f || DK, 'class': 'ptx' + (cl ? ' ' + cl : '') }) + '>' + txt + '</text>'; }
  function G(cl, inner, tr) { if (cl && tr && /\ba-/.test(cl)) return '<g' + at({ 'class': cl }) + '><g' + at({ transform: tr }) + '>' + inner + '</g></g>'; return '<g' + at({ 'class': cl, transform: tr }) + '>' + inner + '</g>'; }
  function tube(d, color, w) { return '<path' + at({ d: d, 'class': 'tbo', 'stroke-width': w + 9 }) + '/>' + '<path' + at({ d: d, 'class': 'tbi', stroke: color, 'stroke-width': w }) + '/>'; }
  function tubes(list, color) {
    return list.map(function (t) { return '<path' + at({ d: t[0], 'class': 'tbo', 'stroke-width': t[1] + 9 }) + '/>'; }).join('') +
      list.map(function (t) { return '<path' + at({ d: t[0], 'class': 'tbi', stroke: t[2] || color, 'stroke-width': t[1] }) + '/>'; }).join('');
  }
  function SH(rx, cy) { return E(100, cy || 186, rx || 56, 7, DK, 'sh'); }
  function n1(v) { return Math.round(v * 10) / 10; }
  function starD(cx, cy, R1, R2, n) {
    var s = '';
    for (var j = 0; j < n * 2; j++) { var a = -Math.PI / 2 + j * Math.PI / n, r = j % 2 ? R2 : R1; s += (j ? 'L' : 'M') + n1(cx + r * Math.cos(a)) + ' ' + n1(cy + r * Math.sin(a)); }
    return s + 'Z';
  }
  function sparkle(cx, cy, s, cl) { return G('a-twinkle' + (cl ? ' ' + cl : ''), P(starD(cx, cy, s, s * 0.36, 4), Y, 'ot')); }
  function eyes(x1, x2, y, r) { return C(x1, y, r, DK, 'nf') + C(x2, y, r, DK, 'nf') + C(x1 + r * 0.32, y - r * 0.36, r * 0.34, WH, 'nf') + C(x2 + r * 0.32, y - r * 0.36, r * 0.34, WH, 'nf'); }
  function shut(x, y, w) { return L('M' + (x - w) + ' ' + y + 'Q' + x + ' ' + (y + w * 0.8) + ' ' + (x + w) + ' ' + y, 'lt'); }
  function smileD(x, y, w, d) { return 'M' + (x - w) + ' ' + y + 'Q' + x + ' ' + (y + d) + ' ' + (x + w) + ' ' + y; }
  function rise(inner, d) { return G('a-rise' + (d ? ' ' + d : ''), inner); }
  function steam(x, y) { return rise(LC('M' + x + ' ' + y + 'q-7 -9 0 -18 t0 -18', GY, 5), 'd1') + rise(LC('M' + (x + 20) + ' ' + (y - 4) + 'q-7 -9 0 -18 t0 -18', GY, 5), 'd3'); }
  function face(cx, cy, r, cheek) {
    return C(cx, cy, r, SK) + eyes(cx - r * 0.32, cx + r * 0.32, cy - r * 0.12, r * 0.1) +
      (cheek ? C(cx - r * 0.45, cy + r * 0.18, r * 0.14, PK, 'nf') + C(cx + r * 0.45, cy + r * 0.18, r * 0.14, PK, 'nf') : '') +
      LC(smileD(cx, cy + r * 0.28, r * 0.28, r * 0.2), DK, 4);
  }
  function book(x, y, w, h, color, slant) {
    return G('', R(x, y, w, h, 4, color) + L('M' + (x + 8) + ' ' + (y + 10) + ' H' + (x + w - 8) + ' M' + (x + 8) + ' ' + (y + 22) + ' H' + (x + w - 16), 'lt') + R(x, y, 8, h, 2, shadeBook(color)), slant ? 'rotate(' + slant + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')' : '');
  }
  function shadeBook(c) { return c === RD ? '#C44747' : c === BL ? '#3B86D0' : c === GN ? '#1F8A5C' : c === Y ? '#E0B430' : c === PU ? '#6B50D0' : '#8A5A32'; }
  function cakeTier(cx, cy, w, h, color, icing) {
    return R(cx - w / 2, cy, w, h, 8, color) + P('M' + (cx - w / 2) + ' ' + (cy + 6) + ' Q' + cx + ' ' + (cy - 8) + ' ' + (cx + w / 2) + ' ' + (cy + 6) + ' V' + (cy + 16) + ' Q' + cx + ' ' + (cy + 4) + ' ' + (cx - w / 2) + ' ' + (cy + 16) + ' Z', icing);
  }
  function flame(x, y) { return G('a-glow', P('M' + x + ' ' + y + ' C' + (x - 6) + ' ' + (y - 10) + ' ' + (x - 2) + ' ' + (y - 20) + ' ' + x + ' ' + (y - 26) + ' C' + (x + 2) + ' ' + (y - 20) + ' ' + (x + 6) + ' ' + (y - 10) + ' ' + x + ' ' + y + 'Z', OR) + E(x, y - 8, 3, 5, Y, 'nf')); }

  var P0 = {
    /* ----- x words ----- */
    fox: SH(58) + G('a-wiggle', P('M40 150 Q36 96 70 70 Q88 48 100 52 Q112 48 130 70 Q164 96 160 150 Q150 176 100 178 Q50 176 40 150Z', OR) +
      P('M70 70 L58 28 L92 58Z', OR) + P('M130 70 L142 28 L108 58Z', OR) + P('M64 56 L58 32 L84 58Z', WH, 'ot') + P('M136 56 L142 32 L116 58Z', WH, 'ot') +
      eyes(84, 116, 100, 6) + C(86, 122, 4, PK, 'nf') + C(114, 122, 4, PK, 'nf') + E(100, 138, 10, 7, DK, 'nf') + LC(smileD(100, 148, 16, 8), DK, 4)),
    box: SH(70) + G('a-wiggle', P('M36 86 L100 58 L164 86 L164 154 L100 182 L36 154Z', TN) + P('M36 86 L100 114 L164 86 L100 58Z', '#F3D7A8') + L('M100 114 V182 M36 86 L100 114 L164 86', 'ln')),
    fix: SH(50) + G('a-wiggle', G('', R(86, 40, 28, 110, 8, GY) + P('M70 36 H130 L122 58 H78Z', GY) + C(100, 28, 16, GY) + L('M88 28 H112', 'ln'), 'rotate(-35 100 100)')) +
      G('a-wiggle d2', tubes([['M48 150 L152 86', 12]], AM) + C(48, 150, 10, AM) + C(152, 86, 10, AM)),
    six: SH(40) + G('a-pop', C(100, 100, 72, PU) + C(100, 100, 58, WH, 'nf') + T(100, 104, 86, '6', PU)),
    wax: SH(36, 184) + R(86, 86, 28, 98, 8, RD) + R(78, 170, 44, 16, 6, RD) + flame(100, 86) +
      G('a-wiggle', R(36, 120, 14, 56, 4, Y) + C(43, 118, 10, Y) + R(34, 128, 18, 10, 3, AM, 'nf') + R(150, 108, 16, 70, 5, BL) + C(158, 106, 11, BL) + R(148, 122, 20, 10, 3, '#3B86D0', 'nf')),
    ax: SH(70) + G('a-wiggle', tubes([['M58 40 L150 176', 14]], BR) + P('M40 28 L86 58 L70 90 L18 70Z', GY) + L('M48 42 L70 72', 'lt')),
    mix: steam(86, 46) + E(100, 150, 74, 28, TE) + E(100, 148, 62, 20, '#B8E6E2', 'nf') + P( 'M40 150 Q40 92 100 90 Q160 92 160 150 Q160 176 100 176 Q40 176 40 150Z', TE) +
      G('a-wiggle', tubes([['M84 48 L70 130', 8]], GY) + E(92, 42, 22, 10, GY, 'o', 'rotate(-30 92 42)')),
    lynx: SH(60) + G('a-wiggle', P('M44 150 Q40 100 72 78 Q92 50 100 54 Q108 50 128 78 Q160 100 156 150 Q148 178 100 180 Q52 178 44 150Z', AM) +
      P('M72 78 L62 22 L96 68Z', AM) + P('M128 78 L138 22 L104 68Z', AM) + L('M64 36 V18 M70 34 V14 M136 36 V18 M130 34 V14', 'ln') +
      P('M80 70 L92 50 L100 72', WH, 'ot') + P('M120 70 L108 50 L100 72', WH, 'ot') +
      eyes(84, 116, 104, 6) + C(100, 128, 5, DK, 'nf') + LC(smileD(100, 142, 14, 7), DK, 4) + E(100, 168, 22, 8, Y, 'nf')),

    /* ----- ks words ----- */
    book: SH(64) + G('a-wiggle', R(50, 44, 100, 128, 6, RD) + R(50, 44, 12, 128, 4, '#C44747') + L('M74 64 H136 M74 82 H128 M74 100 H136', 'lt')),
    books: SH(70) + G('a-wiggle', R(36, 70, 18, 110, 3, BL) + R(56, 58, 20, 122, 3, RD) + R(78, 48, 24, 132, 4, GN) + R(104, 62, 20, 118, 3, Y) + R(126, 52, 22, 128, 4, PU)),
    kick: SH(60) + C(70, 168, 16, DK) + C(70, 168, 7, GY, 'nf') + G('a-hop', C(148, 118, 16, DK) + C(148, 118, 7, GY, 'nf') + P('M70 160 L84 110 L70 86 Q62 70 78 66 Q96 64 100 84 L110 120 L148 110', SK) +
      C(90, 52, 20, SK) + eyes(84, 96, 50, 3.5) + LC(smileD(90, 58, 6, 4), DK, 3) + R(78, 86, 28, 36, 8, BL)),
    kicks: SH(70) + C(48, 168, 14, DK) + C(48, 168, 6, GY, 'nf') + G('a-hop', C(150, 86, 16, DK) + C(150, 86, 7, GY, 'nf') + P('M48 160 L70 112 L58 86 Q52 68 70 64 Q88 62 94 84 L108 116 L150 80', SK) +
      C(80, 50, 18, SK) + eyes(74, 86, 48, 3.2) + R(66, 84, 26, 34, 8, RD) + C(118, 150, 22, Y) + C(118, 150, 14, WH, 'nf') + C(118, 150, 8, AM, 'nf')),
    lick: SH(40, 184) + G('a-bob', E(100, 86, 40, 46, WH) + E(100, 86, 30, 34, PK, 'nf') + C(100, 40, 14, RD) + R(86, 128, 28, 20, 8, TN) +
      P('M100 150 Q108 170 100 186 Q90 170 100 150Z', PK)),
    licks: SH(50, 184) + G('a-bob', E(78, 80, 28, 34, WH) + E(78, 80, 20, 24, PK, 'nf') + C(78, 44, 10, RD) + R(68, 114, 20, 16, 6, TN) +
      E(132, 90, 30, 36, WH) + E(132, 90, 22, 26, BL, 'nf') + C(132, 52, 11, AM) + R(122, 126, 20, 16, 6, TN) +
      P('M78 130 Q86 150 78 166 Q68 150 78 130Z', PK) + P('M132 142 Q140 162 132 178 Q122 162 132 142Z', PK)),
    look: SH(40) + G('a-bob', C(100, 100, 64, WH) + C(100, 100, 40, BL, 'nf') + C(100, 100, 18, DK, 'nf') + C(110, 90, 7, WH, 'nf')),
    looks: SH(50) + G('a-bob', C(70, 100, 52, WH) + C(70, 100, 32, BL, 'nf') + C(70, 100, 14, DK, 'nf') + C(78, 92, 5, WH, 'nf') +
      C(136, 100, 52, WH) + C(136, 100, 32, GN, 'nf') + C(136, 100, 14, DK, 'nf') + C(144, 92, 5, WH, 'nf')),
    fork: SH(30, 184) + G('a-wiggle', R(90, 86, 20, 100, 8, GY) + P('M70 28 H86 V86 H70Z', GY) + P('M90 28 H106 V86 H90Z', GY) + P('M110 28 H126 V86 H110Z', GY) + P('M70 78 H126 V96 Q126 108 100 108 Q74 108 74 96Z', GY)),
    forks: SH(40, 184) + G('a-wiggle', G('', R(52, 90, 16, 94, 7, GY) + P('M38 36 H50 V90 H38Z', GY) + P('M54 36 H66 V90 H54Z', GY) + P('M70 36 H82 V90 H70Z', GY) + P('M38 82 H82 V98 Q82 108 60 108 Q38 108 38 98Z', GY), 'rotate(-16 60 120)') +
      G('', R(132, 90, 16, 94, 7, GY) + P('M118 36 H130 V90 H118Z', GY) + P('M134 36 H146 V90 H134Z', GY) + P('M150 36 H162 V90 H150Z', GY) + P('M118 82 H162 V98 Q162 108 140 108 Q118 108 118 98Z', GY), 'rotate(16 140 120)')),
    rake: SH(60, 184) + G('a-wiggle', tubes([['M46 28 L150 170', 12]], BR) + L('M28 40 L64 22 M24 54 L62 34 M22 70 L64 48 M26 86 L68 62 M34 100 L74 74', 'ln') + LC('M28 40 L34 100', BR, 8)),
    rakes: SH(70, 184) + G('a-wiggle', tubes([['M30 36 L100 170', 11]], BR) + L('M16 50 L48 30 M14 66 L50 44 M16 84 L54 60 M22 100 L60 76', 'ln') + LC('M16 50 L22 100', BR, 7)) +
      G('a-wiggle d2', tubes([['M110 30 L170 160', 11]], TN) + L('M96 46 L130 24 M94 62 L132 38 M96 80 L136 54 M102 96 L140 70', 'ln') + LC('M96 46 L102 96', TN, 7)),
    walk: P('M0 168 H200 V200 H0Z', LG) + G('a-hop', E(70, 150, 22, 10, DK) + E(78, 142, 10, 18, DK, 'o', 'rotate(-20 78 142)')) + E(130, 156, 22, 10, BR) + E(138, 148, 10, 18, BR, 'o', 'rotate(-20 138 148)'),
    walks: P('M0 168 H200 V200 H0Z', LG) + G('a-hop', E(44, 150, 18, 8, DK) + E(50, 144, 8, 15, DK, 'o', 'rotate(-20 50 144)') + E(86, 148, 18, 8, BR) + E(92, 142, 8, 15, BR, 'o', 'rotate(-20 92 142)')) +
      E(128, 152, 18, 8, DK) + E(134, 146, 8, 15, DK, 'o', 'rotate(-20 134 146)') + E(164, 156, 18, 8, BR) + E(170, 150, 8, 15, BR, 'o', 'rotate(-20 170 150)'),
    pack: SH(54, 184) + P('M56 70 H144 L154 170 H46Z', TE) + R(70, 42, 60, 36, 10, TE) + L('M100 70 V150', 'ln') + R(90, 96, 20, 16, 4, AM) + C(64, 86, 6, AM, 'nf') + C(136, 86, 6, AM, 'nf'),
    packs: SH(64, 184) + P('M28 86 H92 L98 172 H22Z', TE) + R(40, 62, 44, 28, 8, TE) + L('M60 86 V150', 'lt') +
      P('M110 70 H172 L180 168 H102Z', PU) + R(124, 46, 46, 28, 8, PU) + L('M142 70 V146', 'lt') + R(132, 96, 16, 14, 3, Y),
    snack: SH(50, 184) + G('a-wiggle', C(100, 108, 62, AM) + C(100, 108, 48, CR, 'nf') + L('M100 60 V156 M60 86 Q100 108 140 86 M62 130 Q100 108 138 130', 'lt')),
    snacks: SH(60, 184) + G('a-wiggle', C(70, 96, 44, AM) + C(70, 96, 33, CR, 'nf') + L('M70 63 V129 M44 80 Q70 96 96 80 M46 112 Q70 96 94 112', 'lt') +
      E(142, 128, 30, 18, RD, 'o', 'rotate(-20 142 128)') + E(142, 128, 18, 10, Y, 'nf', 'rotate(-20 142 128)') + C(128, 86, 16, LG) + C(128, 86, 10, '#7CC242', 'nf') + L('M128 70 V78', 'lt')),
    lock: SH(40, 184) + G('a-jiggle', R(56, 96, 88, 78, 14, AM) + C(100, 96, 40, 'none') + P('M64 96 V70 A36 36 0 0 1 136 70 V96', 'none', 'o thick') + C(100, 132, 10, DK, 'nf') + R(96, 132, 8, 22, 3, DK, 'nf')),
    locks: SH(50, 184) + G('a-jiggle', R(28, 108, 64, 62, 12, AM) + P('M36 108 V88 A24 24 0 0 1 84 88 V108', 'none', 'o') + C(60, 136, 7, DK, 'nf') +
      R(108, 100, 64, 70, 12, GY) + P('M116 100 V80 A24 24 0 0 1 164 80 V100', 'none', 'o') + C(140, 132, 7, DK, 'nf')),
    bake: steam(86, 50) + P('M30 116 H170 L156 168 H44Z', TN) + E(100, 116, 70, 16, AM) + L('M50 112 L70 128 M86 104 L108 128 M122 104 L144 124', 'lt') + L('M36 124 Q100 140 164 124', 'lt'),
    bakes: steam(86, 44) + P('M22 124 H100 L92 170 H30Z', TN) + E(61, 124, 40, 12, AM) + P('M108 118 H180 L172 166 H116Z', RD) + E(144, 118, 36, 12, PK) +
      L('M36 122 L50 136 M70 114 L84 136', 'lt') + L('M122 116 L136 130 M150 110 L164 128', 'lt'),
    cook: steam(86, 52) + R(14, 96, 24, 12, 6, DK) + R(162, 96, 24, 12, 6, DK) + P('M40 90 H160 V148 Q160 172 136 172 H64 Q40 172 40 148 Z', TE) + R(30, 80, 140, 16, 8, TE) + E(70, 120, 7, 16, WH, 'hl'),
    cooks: steam(54, 48) + steam(118, 44) + P('M20 100 H96 V156 Q96 176 76 176 H40 Q20 176 20 156Z', TE) + R(14, 90, 88, 14, 7, TE) + R(8, 104, 16, 10, 4, DK) +
      P('M112 96 H184 V154 Q184 174 166 174 H130 Q112 174 112 154Z', RD) + R(106, 86, 84, 14, 7, RD) + R(176, 100, 16, 10, 4, DK),
    shake: SH(36, 184) + E(100, 168, 28, 10, GY) + R(78, 86, 44, 84, 10, LB) + G('a-bob', P('M82 90 Q76 50 100 46 Q124 50 118 90Z', WH) + C(92, 64, 5, PK, 'nf') + C(110, 58, 4, PK, 'nf')) + R(72, 86, 56, 12, 6, AM) + R(92, 118, 16, 52, 6, AM),
    shakes: SH(50, 184) + R(40, 96, 36, 76, 8, LB) + G('a-bob', P('M44 100 Q40 64 58 60 Q76 64 72 100Z', WH)) + R(36, 96, 44, 10, 5, AM) +
      R(124, 90, 36, 82, 8, PK) + G('a-bob d2', P('M128 94 Q124 56 142 52 Q160 56 156 94Z', WH)) + R(120, 90, 44, 10, 5, RD) + R(136, 118, 12, 48, 5, RD),
    blink: face(100, 108, 70, false).replace(eyes(100 - 70 * 0.32, 100 + 70 * 0.32, 108 - 70 * 0.12, 70 * 0.1), G('a-toggle', eyes(100 - 70 * 0.32, 100 + 70 * 0.32, 108 - 70 * 0.12, 70 * 0.1)) ),
    blinks: C(70, 100, 54, SK) + G('a-toggle', eyes(54, 86, 92, 7)) + C(54, 118, 8, PK, 'nf') + C(86, 118, 8, PK, 'nf') + LC(smileD(70, 124, 16, 8), DK, 4) +
      C(140, 100, 54, SK) + G('a-toggle d2', eyes(124, 156, 92, 7)) + C(124, 118, 8, PK, 'nf') + C(156, 118, 8, PK, 'nf') + LC(smileD(140, 124, 16, 8), DK, 4),
    talk: C(86, 100, 58, SK) + eyes(70, 102, 90, 6) + E(86, 122, 14, 16, '#8A2346') + G('a-pop', P('M140 70 Q186 70 186 110 Q186 150 148 142 L140 120 Q170 120 170 110 Q170 86 140 86Z', WH) + T(166, 110, 22, 'hi', PU)),
    talks: C(70, 108, 50, SK) + eyes(56, 84, 100, 5) + E(70, 128, 12, 14, '#8A2346') +
      G('a-pop', P('M116 40 Q170 36 176 80 Q178 120 132 112 L120 92 Q154 100 156 80 Q154 56 120 56Z', WH) + T(150, 78, 18, 'hi', PU)) +
      G('a-pop d2', P('M118 128 Q168 128 168 164 Q164 196 126 184 L118 166 Q148 176 148 164 Q150 142 120 142Z', LB) + T(144, 162, 16, 'ok', TE)),
    park: P('M0 162 Q100 146 200 162 V200 H0Z', LG) + C(160, 40, 16, Y) + R(46, 98, 16, 70, 4, BR) + C(54, 78, 32, GN) + C(78, 96, 22, GN) + C(32, 98, 20, GN) +
      R(98, 112, 82, 10, 4, BR) + R(98, 132, 82, 10, 4, BR) + L('M106 142 V164 M172 142 V164', 'ln'),
    parks: P('M0 162 Q100 146 200 162 V200 H0Z', LG) + C(168, 36, 16, Y) + R(36, 100, 14, 66, 4, BR) + C(43, 84, 28, GN) + C(64, 98, 18, GN) + C(24, 100, 16, GN) +
      R(88, 100, 14, 66, 4, BR) + C(95, 80, 30, GN) + C(116, 96, 20, GN) + C(76, 98, 18, GN) +
      R(130, 118, 58, 10, 4, BR) + R(130, 136, 58, 10, 4, BR) + L('M138 146 V164 M178 146 V164', 'ln'),
    rock: SH(50, 184) + G('a-jiggle', P('M46 150 L40 110 Q50 70 100 74 Q150 80 162 118 L154 152 Q100 176 46 150Z', GY) + E(80, 110, 14, 8, WH, 'hl', 'rotate(-20 80 110)')),
    rocks: SH(64, 184) + G('a-jiggle', P('M30 156 L24 120 Q34 86 70 88 Q104 92 110 124 L102 156 Q70 174 30 156Z', GY) +
      P('M108 150 L104 116 Q116 80 150 86 Q184 94 186 126 L176 154 Q146 172 108 150Z', '#9AA0B4') + E(56, 116, 10, 6, WH, 'hl')),
    make: SH(50, 184) + R(40, 120, 50, 50, 6, RD) + R(70, 86, 50, 50, 6, BL) + G('a-wiggle', R(96, 52, 50, 50, 6, Y)),
    makes: SH(60, 184) + R(28, 130, 46, 44, 6, RD) + R(56, 96, 46, 44, 6, BL) + R(84, 62, 46, 44, 6, Y) + G('a-wiggle', R(118, 88, 44, 44, 6, GN) + R(140, 50, 36, 36, 6, PU)),
    knock: R(36, 28, 128, 160, 8, TN) + R(86, 92, 28, 96, 4, BR) + C(108, 142, 5, AM, 'nf') + G('a-glow', L('M128 70 L154 50 M132 88 H160 M128 106 L152 122', 'lt')),
    knocks: R(18, 36, 80, 148, 8, TN) + R(46, 110, 20, 74, 4, BR) + C(62, 150, 4, AM, 'nf') +
      R(106, 36, 80, 148, 8, '#D4B48A') + R(134, 110, 20, 74, 4, BR) + C(150, 150, 4, AM, 'nf') +
      G('a-glow', L('M84 64 L104 48 M86 80 H110', 'lt')) + G('a-glow d2', L('M172 64 L192 48 M174 80 H198', 'lt')),
    hook: SH(36, 184) + G('a-wiggle', tubes([['M64 28 V110 Q64 170 120 170 Q164 170 164 128', 14]], GY) + C(64, 28, 12, GY) + E(64, 28, 4, 4, DK, 'nf')),
    hooks: SH(50, 184) + G('a-wiggle', tubes([['M48 30 V100 Q48 156 90 156 Q124 156 124 120', 12]], GY) + C(48, 30, 10, GY) +
      tubes([['M150 26 V96 Q150 160 110 168', 12]], AM) + C(150, 26, 10, AM)),
    duck: SH(60, 184) + G('a-bob', E(96, 120, 50, 36, Y) + C(132, 86, 28, Y) + P('M150 86 Q186 86 176 104 Q160 108 150 100Z', OR) + C(140, 78, 5, DK, 'nf') + C(142, 76, 2, WH, 'nf') + E(70, 150, 20, 10, OR)),
    ducks: SH(70, 184) + G('a-bob', E(70, 128, 40, 28, Y) + C(98, 100, 22, Y) + P('M112 100 Q142 98 134 114 Q122 116 112 110Z', OR) + C(104, 94, 4, DK, 'nf') + E(50, 150, 16, 8, OR)) +
      G('a-bob d2', E(140, 132, 36, 26, WH) + C(164, 108, 20, WH) + P('M176 108 Q198 106 192 120 Q182 122 176 116Z', OR) + C(170, 102, 3.5, DK, 'nf') + E(122, 154, 14, 7, OR)),
    cake: cakeTier(100, 120, 120, 50, PK, WH) + cakeTier(100, 86, 86, 40, BL, WH) + R(96, 52, 8, 22, 3, Y) + flame(100, 52) + SH(60, 184),
    cakes: cakeTier(62, 124, 84, 40, PK, WH) + R(58, 96, 8, 18, 3, Y) + flame(62, 96) +
      cakeTier(144, 128, 76, 36, Y, WH) + cakeTier(144, 100, 56, 30, PU, WH) + R(140, 78, 8, 16, 3, AM) + flame(144, 78) + SH(70, 184),
    sock: SH(40, 184) + G('a-wiggle', P('M78 30 H122 V120 Q122 150 86 164 Q48 176 52 140 Q56 120 78 120Z', RD) + R(78, 30, 44, 36, 8, WH) + C(86, 148, 5, WH, 'nf') + C(72, 136, 4, WH, 'nf')),
    socks: SH(54, 184) + G('a-wiggle', P('M40 36 H78 V118 Q78 146 48 158 Q18 168 22 136 Q26 118 40 118Z', RD) + R(40, 36, 38, 28, 8, WH) +
      P('M118 30 H158 V122 Q158 154 126 166 Q94 176 98 140 Q102 122 118 122Z', BL) + R(118, 30, 40, 28, 8, WH)),
    week: R(36, 40, 128, 132, 10, WH) + R(36, 40, 128, 32, 10, TE) + T(100, 56, 18, 'WEEK', WH) +
      R(52, 84, 22, 18, 3, LB) + R(82, 84, 22, 18, 3, LB) + R(112, 84, 22, 18, 3, Y) + R(142, 84, 22, 18, 3, LB) +
      R(52, 112, 22, 18, 3, LB) + R(82, 112, 22, 18, 3, LB) + R(112, 112, 22, 18, 3, LB),
    weeks: R(16, 44, 80, 120, 8, WH) + R(16, 44, 80, 26, 8, TE) + T(56, 58, 12, 'WEEK', WH) + R(26, 82, 16, 14, 2, LB) + R(48, 82, 16, 14, 2, Y) + R(70, 82, 16, 14, 2, LB) +
      R(104, 44, 80, 120, 8, WH) + R(104, 44, 80, 26, 8, PU) + T(144, 58, 12, 'WEEK', WH) + R(114, 82, 16, 14, 2, LB) + R(136, 82, 16, 14, 2, PK) + R(158, 82, 16, 14, 2, LB),
    cheek: C(100, 108, 70, SK) + eyes(78, 122, 96, 7) + C(56, 124, 16, PK, 'nf') + C(144, 124, 10, PK, 'nf') + LC(smileD(100, 132, 22, 12), DK, 4),
    cheeks: C(100, 108, 70, SK) + eyes(78, 122, 96, 7) + C(56, 124, 16, PK, 'nf') + C(144, 124, 16, PK, 'nf') + LC(smileD(100, 132, 22, 12), DK, 5),
    chick: SH(46, 184) + G('a-bob', E(100, 120, 42, 36, Y) + C(118, 86, 24, Y) + P('M134 86 Q158 82 150 98 Q138 100 134 94Z', OR) + C(124, 80, 4, DK, 'nf') + P('M90 86 L82 62 L102 78', Y) + E(78, 148, 16, 8, OR)),
    chicks: SH(60, 184) + G('a-bob', E(70, 124, 34, 28, Y) + C(86, 96, 20, Y) + P('M100 96 Q122 92 116 106 Q106 108 100 102Z', OR) + C(92, 90, 3.5, DK, 'nf') + P('M62 96 L56 76 L74 90', Y)) +
      G('a-bob d2', E(140, 128, 32, 26, Y) + C(154, 102, 18, Y) + P('M166 102 Q186 98 180 112 Q170 114 166 108Z', OR) + C(158, 96, 3.2, DK, 'nf')),
    link: SH(40, 184) + G('a-wiggle', R(70, 50, 60, 100, 28, 'none') + R(70, 50, 60, 100, 28, 'none', 'o thick')),
    links: SH(50, 184) + G('a-wiggle', R(28, 60, 50, 80, 22, 'none', 'o thick') + R(76, 70, 50, 80, 22, 'none', 'o thick') + R(124, 60, 50, 80, 22, 'none', 'o thick')),
    block: SH(46, 184) + R(50, 60, 100, 100, 10, BL) + R(62, 74, 30, 30, 4, WH, 'hl'),
    blocks: SH(60, 184) + R(30, 110, 64, 64, 8, RD) + R(86, 70, 64, 64, 8, BL) + G('a-wiggle', R(70, 36, 56, 56, 8, Y)),
    brick: SH(50, 184) + R(40, 70, 120, 50, 6, RD) + R(40, 126, 120, 50, 6, '#C44747') + L('M100 70 V120 M100 126 V176', 'lt'),
    bricks: SH(64, 184) + R(22, 46, 70, 36, 4, RD) + R(98, 46, 80, 36, 4, '#C44747') + R(22, 90, 110, 36, 4, '#C44747') + R(138, 90, 40, 36, 4, RD) +
      R(22, 134, 60, 36, 4, RD) + R(88, 134, 90, 36, 4, '#C44747'),
    stick: SH(60) + G('a-wiggle', tubes([['M36 162 L164 52', 14], ['M112 98 L150 112', 9]], BR) + E(160, 116, 13, 7, LG, 'o', 'rotate(25 160 116)') + E(150, 46, 12, 7, LG, 'o', 'rotate(-40 150 46)')),
    sticks: SH(70) + G('a-wiggle', tubes([['M28 166 L120 46', 12], ['M86 108 L118 120', 8]], BR) + E(126, 122, 11, 6, LG, 'o', 'rotate(25 126 122)')) +
      G('a-wiggle d2', tubes([['M80 170 L176 58', 12]], TN) + E(168, 70, 11, 6, LG, 'o', 'rotate(-30 168 70)')),

    /* ----- pair words that are not also target words ----- */
    sick: C(100, 108, 66, SK) + shut(80, 100, 8) + shut(120, 100, 8) + C(76, 122, 8, PK, 'nf') + C(124, 122, 8, PK, 'nf') +
      P('M86 136 Q100 130 114 136', 'none', 'ln') + R(150, 40, 10, 70, 4, RD) + C(155, 40, 14, RD) + C(155, 40, 6, WH, 'nf'),
    whack: SH(50, 184) + R(40, 150, 80, 22, 6, BR) + G('a-hammer', G('', tubes([['M120 30 L86 150', 12]], BR) + P('M150 20 L186 70 L150 86 L120 40Z', GY), 'rotate(0 86 150)')),
    /* link already defined */
  };

  /* blink used a-toggle on eyes; build simpler blink pictures that actually close */
  P0.blink = C(100, 108, 70, SK) + G('a-toggle', eyes(78, 122, 96, 7) + C(78, 96, 7, SK, 'nf') /* dummy */) +
    C(62, 128, 12, PK, 'nf') + C(138, 128, 12, PK, 'nf') + LC(smileD(100, 136, 22, 12), DK, 4) +
    G('a-toggle', shut(78, 96, 10) + shut(122, 96, 10));
  /* the above overlays shut eyes with a-toggle toggling translateY - might look odd. Use a cleaner wink: */
  P0.blink = C(100, 108, 70, SK) + eyes(78, 122, 96, 7) + G('a-toggle', P('M64 82 H92 V110 H64Z', SK, 'nf')) +
    C(62, 128, 12, PK, 'nf') + C(138, 128, 12, PK, 'nf') + LC(smileD(100, 136, 22, 12), DK, 4);
  P0.blinks = C(70, 108, 56, SK) + eyes(54, 86, 98, 6) + G('a-toggle', P('M40 84 H72 V112 H40Z', SK, 'nf')) + C(50, 126, 9, PK, 'nf') + C(90, 126, 9, PK, 'nf') + LC(smileD(70, 132, 16, 8), DK, 4) +
    C(140, 108, 56, SK) + eyes(124, 156, 98, 6) + G('a-toggle d2', P('M110 84 H142 V112 H110Z', SK, 'nf')) + C(120, 126, 9, PK, 'nf') + C(160, 126, 9, PK, 'nf') + LC(smileD(140, 132, 16, 8), DK, 4);

  /* fix link: thick open oval rings */
  P0.link = SH(40, 184) + G('a-wiggle', E(100, 100, 36, 52, 'none', 'o thick', 'rotate(-25 100 100)'));
  P0.links = SH(50, 184) + G('a-wiggle', E(64, 100, 28, 44, 'none', 'o thick', 'rotate(-25 64 100)') + E(100, 108, 28, 44, 'none', 'o thick', 'rotate(-25 100 108)') + E(136, 100, 28, 44, 'none', 'o thick', 'rotate(-25 136 100)'));

  function has(w) { return Object.prototype.hasOwnProperty.call(P0, String(w || '').toLowerCase()); }
  window.BBPictures = {
    has: has,
    svg: function (w) { w = String(w || '').toLowerCase(); return has(w) ? P0[w] : ''; },
    list: function () { return Object.keys(P0); }
  };
})();
