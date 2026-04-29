/**
 * Noctua App Store screenshot generator
 *
 * Produces:
 *   5 × 1290×2796  iOS 6.7" primary screenshots
 *   1 × 1024×500   Google Play feature graphic
 *
 * Each screenshot has:
 *   • constellation dot background
 *   • large headline above the phone
 *   • iPhone 15 Pro device frame
 *   • accurate recreation of the live app screen
 *   • page-dot indicator + tagline below
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = join(__dirname, '..');
const OUT       = join(root, 'scripts/assets/screenshots');
mkdirSync(OUT, { recursive: true });

// ── Design tokens (mirrored from src/design.ts) ──────────────────────────
const D = {
  bg:         '#000000',
  text:       '#e8e6e0',
  textSoft:   '#a8a59c',
  textDim:    '#5d5a52',
  rule:       '#3a3730',
  ruleSoft:   '#1f1d18',
  gold:       '#c9a866',
  silver:     '#cdc9be',
  emerald:    '#3a8f6a',
  sapphire:   '#3b6ea8',
  amethyst:   '#8a5fa3',
  ruby:       '#a14758',
  mono:       "'Courier New', monospace",
  slab:       "Georgia, serif",
  sans:       "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

// Framework metadata (V1 frameworks: jungian, cognitive, spiritual)
const FW_META = {
  jungian:  { short: 'JUNG', color: D.amethyst },
  cognitive:{ short: 'COG',  color: D.emerald  },
  spiritual:{ short: 'MYTH', color: D.gold     },
};
const V1_FW = ['jungian', 'cognitive', 'spiritual'];

// ── Canvas & layout constants ─────────────────────────────────────────────
const W = 1290, H = 2796;   // canvas (iOS 6.7")

// iPhone 15 Pro frame
const FX = 255, FY = 385;   // frame top-left
const FW = 780, FH = 1650;  // frame size
const FR = 68;              // frame corner radius

// Screen inside frame
const SX = 273, SY = 408;   // screen top-left
const SW = 744, SH = 1610;  // screen size
const SR = 54;              // screen corner radius

// Derived helpers
const SCTR_X  = SX + SW / 2;       // screen horizontal centre (645)
const SCR_R   = SX + SW;           // screen right edge (1017)
const PAD     = 44;                 // horizontal content padding (≈ 22px × 2 scale)
const CX      = SX + PAD;          // content left (317)
const CRX     = SCR_R - PAD;       // content right (973)
const CW      = SW - PAD * 2;      // content width (656)

// Dynamic Island
const DI_W = 128, DI_H = 36;
const DI_X  = SCTR_X - DI_W / 2;  // 581
const DI_Y  = SY + 20;            // 428

// Vertical reference points
const TOP_NAV = SY + 108;          // first nav row (516)
const TAB_TOP = SY + SH - 90;      // tab bar top (1928)

// Type scale (roughly 2× the 390-pt viewport app)
const TS = {
  label:  20,   //  9 → 20  mono labels / nav
  label2: 24,   // 11 → 24  larger labels
  body:   26,   // 13 → 26  body text
  body2:  28,   // 14 → 28  slightly larger body
  over:   34,   // 17 → 34  overview / large body
  title:  58,   // 30 → 58  dream titles
  h2:     78,   // 40 → 78  section headings
  h1:     90,   //         headlines above phone
};
const LH = { label: 30, label2: 36, body: 40, body2: 44, over: 52, title: 84, h2: 92, h1: 108 };

// ── Low-level SVG helpers ─────────────────────────────────────────────────

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function t(x, y, text, {
  ff = D.sans, fs = TS.body, fill = D.textSoft, anchor = 'start',
  ls = 0, fw = 400, italic = false, opacity = 1,
} = {}) {
  return `<text x="${x}" y="${y}" font-family="${ff}" font-size="${fs}" fill="${fill}"
    text-anchor="${anchor}" letter-spacing="${ls}" font-weight="${fw}"
    font-style="${italic ? 'italic' : 'normal'}" opacity="${opacity}"
    dominant-baseline="hanging">${esc(text)}</text>`;
}

// Mono label
function mono(x, y, text, opts = {}) {
  return t(x, y, text, { ff: D.mono, fs: TS.label, fill: D.textDim, ls: 2, ...opts });
}
// Slab (serif italic)
function slab(x, y, text, opts = {}) {
  return t(x, y, text, { ff: D.slab, italic: true, fs: TS.title, fill: D.text, ...opts });
}
// Sans
function sans(x, y, text, opts = {}) {
  return t(x, y, text, { ff: D.sans, fs: TS.body, fill: D.textSoft, ...opts });
}

// Horizontal rule
function rule(x1, x2, y, { color = D.rule, opacity = 1, sw = 1 } = {}) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

// Gold diamond
function diamond(cx, cy, r = 7) {
  return `<polygon points="${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}" fill="${D.gold}"/>`;
}

// Divider with centre diamond
function divider(y, { opacity = 0.4 } = {}) {
  return rule(CX, SCTR_X - 20, y, { opacity })
    + diamond(SCTR_X, y, 6)
    + rule(SCTR_X + 20, CRX, y, { opacity });
}

// Filled or outlined pill / chip
function pill(x, y, w, h, label, { filled = false, color = D.gold, fs = TS.label, ls = 1.5 } = {}) {
  const r = h / 2;
  const bg   = filled ? color  : 'none';
  const text = filled ? D.bg   : color;
  const stk  = filled ? color  : color;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bg}" stroke="${stk}" stroke-width="1.5" opacity="${filled ? 0.92 : 0.5}"/>`
    + mono(x + w / 2, y + (h - TS.label) / 2 + 1, label, { anchor: 'middle', fill: text, ls, fw: 600 });
}

// Simple word-wrap — returns array of lines
function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? `${cur} ${w}` : w;
    if (cand.length > maxChars) { lines.push(cur); cur = w; }
    else cur = cand;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Multi-line text block — returns [svgString, totalHeight]
function textBlock(x, y, text, { maxW = CW, ff = D.sans, fs = TS.body, fill = D.textSoft, lineH, fw = 400, italic = false, ls = 0 } = {}) {
  const lh   = lineH ?? Math.round(fs * 1.5);
  const cpl  = Math.max(10, Math.floor(maxW / (fs * 0.54)));
  const lines = wrap(text, cpl);
  const svg  = lines.map((l, i) => t(x, y + i * lh, l, { ff, fs, fill, fw, italic, ls })).join('');
  return [svg, lines.length * lh];
}

// ── Status bar ────────────────────────────────────────────────────────────
function statusBar() {
  const y = SY + 24;
  // Time left of Dynamic Island
  const time = mono(SX + 64, y, '9:41', { fill: D.text, fs: 22, ls: 0 });
  // Battery + signal glyphs right of Dynamic Island
  const icons = `
    <rect x="${SCR_R - 116}" y="${y + 1}" width="42" height="18" rx="3" fill="none" stroke="${D.text}" stroke-width="1.5" opacity="0.8"/>
    <rect x="${SCR_R - 73}"  y="${y + 5}" width="4"  height="10" rx="1" fill="${D.text}" opacity="0.8"/>
    <rect x="${SCR_R - 111}" y="${y + 3}" width="30" height="12" rx="1.5" fill="${D.text}" opacity="0.8"/>
    <rect x="${SCR_R - 148}" y="${y}"     width="16" height="20" rx="2" fill="none" stroke="${D.text}" stroke-width="1.5" opacity="0.6"/>
    <rect x="${SCR_R - 145}" y="${y + 3}" width="10" height="8" rx="0.5" fill="${D.text}" opacity="0.6"/>
    <rect x="${SCR_R - 175}" y="${y}"     width="16" height="20" rx="2" fill="none" stroke="${D.text}" stroke-width="1.5" opacity="0.6"/>
    <rect x="${SCR_R - 172}" y="${y + 4}" width="10" height="6" rx="0.5" fill="${D.text}" opacity="0.5"/>`;
  return time + icons;
}

// ── Tab bar ───────────────────────────────────────────────────────────────
function tabBar(active = 0) {
  // active: 0=archive, 1=capture, 2=settings
  const h  = 90;
  const ty = SY + SH - h;
  const tabs = ['ARCHIVE', 'RECORD', 'SETTINGS'];
  const icons = [
    // Archive icon (simple stack lines)
    (cx, cy) => `<rect x="${cx-12}" y="${cy-10}" width="24" height="3" rx="1.5" fill="currentColor"/><rect x="${cx-12}" y="${cy-3}" width="24" height="3" rx="1.5" fill="currentColor"/><rect x="${cx-12}" y="${cy+4}" width="18" height="3" rx="1.5" fill="currentColor"/>`,
    // Record icon (circle with dot)
    (cx, cy) => `<circle cx="${cx}" cy="${cy-2}" r="12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="${cx}" cy="${cy-2}" r="4" fill="currentColor"/>`,
    // Settings icon (gear-like circle)
    (cx, cy) => `<circle cx="${cx}" cy="${cy-2}" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="${cx}" cy="${cy-2}" r="3" fill="currentColor"/>`,
  ];

  const tw = SW / 3;
  let out = `<rect x="${SX}" y="${ty}" width="${SW}" height="${h}" fill="#000" opacity="0.95"/>`
    + rule(SX, SCR_R, ty, { opacity: 0.6 });

  tabs.forEach((label, i) => {
    const cx    = SX + tw * i + tw / 2;
    const color = i === active ? D.gold : D.textDim;
    // Icon (replaced with inline currentColor approach)
    const iconSvg = icons[i](cx, ty + 28).replace(/currentColor/g, color);
    out += iconSvg;
    out += mono(cx, ty + 58, label, { anchor: 'middle', fill: color, ls: 1.5, fs: 16 });
    if (i < 2) out += rule(SX + tw * (i + 1), SX + tw * (i + 1), ty, { opacity: 0.2, sw: 1 });
  });
  return out;
}

// ── Phone chrome ──────────────────────────────────────────────────────────
function phoneDefs(uid) {
  return `<defs>
    <clipPath id="sc${uid}"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="${SR}"/></clipPath>
    <linearGradient id="fg${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#141412"/>
      <stop offset="18%"  stop-color="#222220"/>
      <stop offset="50%"  stop-color="#272724"/>
      <stop offset="82%"  stop-color="#222220"/>
      <stop offset="100%" stop-color="#141412"/>
    </linearGradient>
    <linearGradient id="fsh${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
      <stop offset="30%"  stop-color="#fff" stop-opacity="0.04"/>
      <stop offset="70%"  stop-color="#fff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

function phoneFrame(uid) {
  return phoneDefs(uid) + `
  <!-- Frame body -->
  <rect x="${FX}"   y="${FY}"   width="${FW}" height="${FH}" rx="${FR}" fill="url(#fg${uid})"/>
  <!-- Highlight sheen -->
  <rect x="${FX}"   y="${FY}"   width="${FW}" height="${FH}" rx="${FR}" fill="url(#fsh${uid})"/>
  <!-- Outer edge stroke -->
  <rect x="${FX}"   y="${FY}"   width="${FW}" height="${FH}" rx="${FR}" fill="none" stroke="#3c3c38" stroke-width="1.5"/>
  <!-- Volume buttons (left) -->
  <rect x="${FX-5}" y="${FY+280}" width="5" height="68" rx="2.5" fill="#1c1c1a"/>
  <rect x="${FX-5}" y="${FY+390}" width="5" height="110" rx="2.5" fill="#1c1c1a"/>
  <rect x="${FX-5}" y="${FY+540}" width="5" height="110" rx="2.5" fill="#1c1c1a"/>
  <!-- Side button (right) -->
  <rect x="${FX+FW}" y="${FY+380}" width="5" height="160" rx="2.5" fill="#1c1c1a"/>
  <!-- Screen fill -->
  <rect x="${SX}"   y="${SY}"   width="${SW}" height="${SH}" rx="${SR}" fill="${D.bg}"/>`;
}

function phoneOverlay() {
  return `<!-- Dynamic Island -->
  <rect x="${DI_X}" y="${DI_Y}" width="${DI_W}" height="${DI_H}" rx="${DI_H/2}" fill="#000"/>
  <!-- Home indicator -->
  <rect x="${SCTR_X - 88}" y="${SY + SH - 22}" width="176" height="5" rx="2.5" fill="#333330" opacity="0.7"/>`;
}

// ── Background decoration ─────────────────────────────────────────────────
function backdrop() {
  const stars = [
    [154, 190, 3.5, 0.22], [1136, 170, 3, 0.18], [ 96, 1180, 2.5, 0.16],
    [1194, 1380, 3.5, 0.2], [175, 2580, 2.5, 0.18], [1115, 2540, 3, 0.2],
    [ 80,  680, 2,   0.15], [1210,  580, 2.5, 0.17], [140, 2180, 2, 0.14],
    [1155, 2280, 2, 0.15], [645,  100, 3.5, 0.25],  [210, 2700, 2, 0.13],
    [1088, 2710, 2.5, 0.17], [118, 1560, 2, 0.14],  [1172, 1680, 2, 0.14],
    [318,  310, 2, 0.12], [972,  280, 2, 0.12],
  ];
  const dots = stars.map(([cx, cy, r, op]) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${D.gold}" opacity="${op}"/>`).join('');
  const lines = `
    <line x1="154" y1="190" x2="96" y2="1180" stroke="${D.gold}" stroke-width="0.7" opacity="0.06"/>
    <line x1="1136" y1="170" x2="1194" y2="1380" stroke="${D.gold}" stroke-width="0.7" opacity="0.06"/>
    <line x1="645" y1="100" x2="154" y2="190" stroke="${D.gold}" stroke-width="0.7" opacity="0.05"/>
    <line x1="645" y1="100" x2="1136" y2="170" stroke="${D.gold}" stroke-width="0.7" opacity="0.05"/>`;
  return `<rect width="${W}" height="${H}" fill="${D.bg}"/>` + dots + lines;
}

// ── Headline block (above phone) ──────────────────────────────────────────
function headline(line1, line2Gold) {
  // Small wordmark
  const wm = mono(W / 2, 102, 'N O C T U A', { anchor: 'middle', fs: 22, fill: D.gold, ls: 9, opacity: 0.65 });
  // Large 2-line headline
  const l1 = slab(W / 2, 168, line1,    { anchor: 'middle', fs: TS.h1, fill: D.text  });
  const l2 = slab(W / 2, 168 + LH.h1, line2Gold + '.', { anchor: 'middle', fs: TS.h1, fill: D.gold });
  // Micro-rule + diamond
  const ry = 168 + LH.h1 * 2 + 14;
  const div = rule(W/2 - 56, W/2 - 12, ry, { color: D.gold, opacity: 0.35 })
    + diamond(W / 2, ry, 5)
    + rule(W/2 + 12, W/2 + 56, ry, { color: D.gold, opacity: 0.35 });
  return wm + l1 + l2 + div;
}

// ── Page dots ─────────────────────────────────────────────────────────────
function pageDots(idx, total = 5) {
  const sp   = 20;
  const sx   = W / 2 - ((total - 1) * sp) / 2;
  const y    = FY + FH + 76;
  return Array.from({ length: total }, (_, i) => {
    const active = i === idx;
    return `<circle cx="${sx + i * sp}" cy="${y}" r="${active ? 5.5 : 3}" fill="${active ? D.gold : D.textDim}" opacity="${active ? 0.9 : 0.35}"/>`;
  }).join('');
}

function footer(idx) {
  const y = FY + FH + 128;
  return pageDots(idx)
    + mono(W / 2, y, 'DREAM  ·  REMEMBER  ·  UNDERSTAND', { anchor: 'middle', fs: 18, ls: 3.5, opacity: 0.4 });
}

// ── Full screenshot assembler ─────────────────────────────────────────────
function makeShot(idx, hl1, hl2gold, screenFn) {
  const content = screenFn();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backdrop()}
  ${headline(hl1, hl2gold)}
  ${phoneFrame(idx)}
  <g clip-path="url(#sc${idx})">
    ${content}
    ${statusBar()}
  </g>
  ${phoneOverlay()}
  ${footer(idx)}
</svg>`;
}

// ═════════════════════════════════════════════════════════════════════════
// ── Screen content functions ─────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════

// ── 1 · Capture ───────────────────────────────────────────────────────────
function captureScreen() {
  let o = '';
  let y = TOP_NAV;

  // Nav row
  o += mono(CX,  y, '← ARCHIVE', { fill: D.textDim });
  o += mono(CRX, y, 'APRIL 28, 2025', { anchor: 'end', fill: D.textDim });
  y += LH.label + 12;

  // Horizontal rule
  o += rule(SX, SCR_R, y, { opacity: 0.5 });  y += 1;

  // Entry number row
  y += 14;
  o += mono(CX,  y, '№ 0012', { fill: D.gold, ls: 2 });
  o += mono(CRX, y, 'FRIDAY', { anchor: 'end', fill: D.textDim });
  y += LH.label + 10;

  o += rule(SX, SCR_R, y, { opacity: 0.25 }); y += 1;

  // Framework selector tabs
  y += 14;
  const fwH = 54;
  const fwW = SW / 3;
  V1_FW.forEach((k, i) => {
    const { short, color } = FW_META[k];
    const fx  = SX + i * fwW;
    const sel = i === 0;
    o += `<rect x="${fx}" y="${y}" width="${fwW}" height="${fwH}" fill="${sel ? color : 'none'}"/>`;
    if (i < 2) o += rule(fx + fwW, fx + fwW, y, { color: D.rule, sw: 1 });
    o += rule(fx + fwW, fx + fwW, y + fwH, { color: D.rule, sw: 1 });
    o += mono(fx + fwW / 2, y + 16, short, { anchor: 'middle', fill: sel ? D.bg : color, fw: 600, fs: TS.label });
  });
  o += `<rect x="${SX}" y="${y}" width="${SW}" height="${fwH}" fill="none" stroke="${D.rule}" stroke-width="1"/>`;
  y += fwH + 30;

  // Dream body text
  const bodyLines = [
    'I found myself in a vast library with walls',
    'made entirely of glass. Books floated around',
    'me, their pages turning slowly without any',
    'hands guiding them. The light outside was',
    'neither day nor night — a deep blue-violet,',
    'the colour of the moment just before dawn.',
    '',
    'I recognised the place but could not name it.',
    'Someone was waiting for me in the reading',
    'room at the far end of the corridor...',
  ];
  bodyLines.forEach((line, i) => {
    if (line) o += sans(CX, y + i * 40, line, { fs: TS.body, fill: D.text });
  });
  y += bodyLines.length * 40 + 16;

  // Word count
  o += mono(CRX, y, '98 WORDS', { anchor: 'end', fs: TS.label, fill: D.textDim });
  y += LH.label + 16;

  o += rule(SX, SCR_R, y, { opacity: 0.35 });  y += 24;

  // Mood row
  o += mono(CX, y, 'ON WAKING', { fill: D.gold, ls: 2 });
  y += LH.label + 14;

  const moods = ['CURIOUS', 'PEACEFUL', 'SEARCHING', 'STRANGE'];
  const pillH = 44;
  let mx = CX;
  moods.forEach((m, i) => {
    const pw = m.length * 11 + 28;
    if (mx + pw > CRX + 10) return; // skip if overflow
    o += pill(mx, y, pw, pillH, m, { filled: i < 2, color: D.gold });
    mx += pw + 14;
  });
  y += pillH + 24;

  o += rule(SX, SCR_R, y, { opacity: 0.35 }); y += 24;

  // Save / Interpret buttons
  const btnH = 70;
  const btnW = (CW - 14) / 2;
  o += `<rect x="${CX}" y="${y}" width="${btnW}" height="${btnH}" fill="none" stroke="${D.rule}" stroke-width="1.5"/>`;
  o += mono(CX + btnW / 2, y + 22, 'SAVE', { anchor: 'middle', fill: D.textDim, ls: 3, fs: TS.label2 });
  o += `<rect x="${CX + btnW + 14}" y="${y}" width="${btnW}" height="${btnH}" fill="${D.gold}"/>`;
  o += mono(CX + btnW + 14 + btnW / 2, y + 22, 'INTERPRET →', { anchor: 'middle', fill: D.bg, ls: 2, fs: TS.label2, fw: 700 });

  return o;
}

// ── 2 · Archive ────────────────────────────────────────────────────────────
function archiveScreen() {
  let o = '';
  let y = TOP_NAV;

  // Top strip
  o += mono(CX,  y, 'NOCTUA · ARCHIVE', { fill: D.gold, ls: 2 });
  o += mono(CRX, y, 'APRIL 28, 2025',   { anchor: 'end', fill: D.textDim });
  y += LH.label + 12;

  // VOL rule
  o += mono(CX,  y, 'VOL · 01', { fill: D.gold, ls: 2, fs: TS.label2 });
  o += rule(CX + 136, CRX - 120, y + 10, {});
  o += mono(CRX, y, '12 ENTRIES', { anchor: 'end', fill: D.textDim, fs: TS.label2 });
  y += LH.label2 + 16;

  // Main heading
  o += slab(CX, y, 'Dream',    { fs: TS.h2, fill: D.text });
  y += LH.h2;
  o += slab(CX, y, 'Archive.', { fs: TS.h2, fill: D.gold });
  y += LH.h2 + 24;

  // Stats hairlines
  const stats = [
    { label: 'THIS MONTH',        value: '8 NIGHTS',        color: D.gold      },
    { label: 'DOMINANT LENS',     value: 'JUNGIAN · 64%',   color: D.amethyst  },
    { label: 'RECURRING SYMBOL',  value: 'LIBRARY · 3×',    color: D.sapphire  },
  ];
  stats.forEach(({ label, value, color }) => {
    o += rule(SX, SCR_R, y, { opacity: 0.5 });
    o += mono(CX,  y + 14, label, { fill: D.textDim });
    o += mono(CRX, y + 14, value, { anchor: 'end', fill: color });
    y += 52;
  });
  o += rule(SX, SCR_R, y, { opacity: 0.5 });
  y += 28;

  // Dream entry rows
  const entries = [
    { num: '0012', title: 'The Glass Library',           date: 'APR 28', fw: D.amethyst },
    { num: '0011', title: 'Ascending the White Mountain', date: 'APR 25', fw: D.emerald  },
    { num: '0010', title: 'The Mirror Sea',              date: 'APR 22', fw: D.gold     },
    { num: '0009', title: 'Cities of the Underground',   date: 'APR 20', fw: D.amethyst },
    { num: '0008', title: 'The Silver Door',             date: 'APR 17', fw: D.sapphire },
    { num: '0007', title: 'The Waiting Garden',          date: 'APR 14', fw: D.emerald  },
  ];
  const rowH = 90;
  entries.forEach(({ num, title, date, fw }, i) => {
    o += rule(SX, SCR_R, y, { opacity: 0.35 });
    o += mono(CX,  y + 14, `№${num}`, { fill: D.gold,    ls: 1.5, fs: TS.label });
    o += mono(CRX, y + 14, date,       { fill: D.textDim, ls: 1.5, fs: TS.label, anchor: 'end' });
    // Framework dot
    o += `<circle cx="${CX + 8}" cy="${y + 62}" r="5" fill="${fw}" opacity="0.85"/>`;
    o += slab(CX + 20, y + 50, title, { fs: 30, fill: D.text });
    y += rowH;
  });
  o += rule(SX, SCR_R, y, { opacity: 0.35 });

  o += tabBar(0);
  return o;
}

// ── 3 · Interpretation — frameworks + overview ────────────────────────────
function interpretScreen() {
  let o = '';
  let y = TOP_NAV;

  // Nav
  o += mono(CX,      y, '← №0012',               { fill: D.textDim });
  o += mono(SCTR_X,  y, 'INTERPRETED · APR 28',   { anchor: 'middle', fill: D.gold });
  o += mono(CRX,     y, 'EDIT',                   { anchor: 'end',    fill: D.textDim });
  y += LH.label + 14;

  // Framework tabs
  const fwH = 54;
  const fwW = SW / 3;
  V1_FW.forEach((k, i) => {
    const { short, color } = FW_META[k];
    const fx  = SX + i * fwW;
    const sel = i === 0;
    o += `<rect x="${fx}" y="${y}" width="${fwW}" height="${fwH}" fill="${sel ? color : 'none'}"/>`;
    if (i < 2) o += rule(fx + fwW, fx + fwW, y, { color: D.rule, sw: 1 });
    o += mono(fx + fwW / 2, y + 17, short, { anchor: 'middle', fill: sel ? D.bg : color, fw: 600 });
  });
  o += `<rect x="${SX}" y="${y}" width="${SW}" height="${fwH}" fill="none" stroke="${D.rule}" stroke-width="1"/>`;
  y += fwH + 30;

  // Hero
  o += mono(CX, y, 'READ THROUGH JUNGIAN', { fill: D.amethyst, ls: 2 });
  y += LH.label + 10;
  o += slab(CX, y, 'The Glass',  { fs: 60, fill: D.gold });
  y += 76;
  o += slab(CX, y, 'Library',    { fs: 60, fill: D.gold });
  y += 76 + 18;

  // Diamond divider
  o += divider(y + 8);
  y += 36;

  // I · Overview
  o += mono(CX, y, 'I · OVERVIEW', { fill: D.gold, ls: 2 });
  y += LH.label + 14;

  const overviewText = 'The library of glass speaks to a psyche made luminous — where the boundary between the inner world and outer reality dissolves into transparency. You stand witness to your own mind, made suddenly visible and traversable.';
  const [ovSvg, ovH] = textBlock(CX, y, overviewText, { ff: D.slab, fs: 34, fill: D.text, italic: true, lineH: 52 });
  o += ovSvg;
  y += ovH + 36;

  // II · Symbol Cartography header
  o += rule(SX, SCR_R, y, { opacity: 0.3 }); y += 22;
  o += mono(CX, y, 'II · SYMBOL CARTOGRAPHY', { fill: D.gold, ls: 2 });
  y += LH.label + 16;

  // First symbol (preview)
  const colors = [D.amethyst, D.gold, D.sapphire];
  const syms = [
    { name: 'The Glass Library', meaning: 'Transparency as confrontation with the self — the psyche\'s hidden chambers made suddenly visible. Glass that reveals rather than protects.' },
  ];
  syms.forEach(({ name, meaning }, i) => {
    const c = colors[i];
    o += mono(CX,      y,     `${['i.', 'ii.', 'iii.'][i]}`, { fill: c, ls: 1.5 });
    o += slab(CX + 44, y - 2, name, { fs: 30, fill: D.text });
    o += `<circle cx="${CRX - 6}" cy="${y + 12}" r="8" fill="${c}" opacity="0.9"/>`;
    const [mSvg] = textBlock(CX + 44, y + 40, meaning, { fs: TS.body - 2, fill: D.textSoft, maxW: CW - 44 });
    o += mSvg;
  });

  return o;
}

// ── 4 · Symbol Cartography (full three symbols) ───────────────────────────
function symbolsScreen() {
  let o = '';
  let y = TOP_NAV;

  // Minimal nav (user has scrolled)
  o += mono(CX, y, '← №0012', { fill: D.textDim });
  o += mono(SCTR_X, y, 'JUNGIAN · THE GLASS LIBRARY', { anchor: 'middle', fill: D.amethyst, ls: 1 });
  y += LH.label + 12;

  o += rule(SX, SCR_R, y, { opacity: 0.3 }); y += 24;
  o += mono(CX, y, 'II · SYMBOL CARTOGRAPHY', { fill: D.gold, ls: 2 });
  y += LH.label + 18;

  const symData = [
    {
      color:   D.amethyst,
      roman:   'i.',
      name:    'The Glass Library',
      meaning: 'Transparency as confrontation with the self — the psyche\'s hidden chambers made suddenly visible. Glass that does not protect but reveals.',
    },
    {
      color:   D.gold,
      roman:   'ii.',
      name:    'The Floating Books',
      meaning: 'Knowledge freed from the gravity of the waking world. The unconscious presents wisdom as untethered possibility, circling without fixed ground.',
    },
    {
      color:   D.sapphire,
      roman:   'iii.',
      name:    'The Absent Hands',
      meaning: 'Agency operating beyond the ego\'s direction. Something within you moves the world forward — past the reach of conscious will.',
    },
  ];

  symData.forEach(({ color, roman, name, meaning }, i) => {
    o += mono(CX,      y,     roman, { fill: color, ls: 1.5 });
    o += slab(CX + 44, y - 2, name,  { fs: 30, fill: D.text });
    o += `<circle cx="${CRX - 6}" cy="${y + 12}" r="8" fill="${color}" opacity="0.9"/>`;
    const [mSvg, mH] = textBlock(CX + 44, y + 40, meaning, { fs: TS.body - 2, fill: D.textSoft, maxW: CW - 44 });
    o += mSvg;
    const blockBottom = y + 40 + mH;
    y = blockBottom + 28;
    if (i < symData.length - 1) {
      o += rule(SX, SCR_R, y, { color: D.ruleSoft, opacity: 0.7 }); y += 28;
    }
  });

  // III · Emotional Landscape header + first lines
  o += rule(SX, SCR_R, y, { opacity: 0.5 }); y += 24;
  o += mono(CX, y, 'III · EMOTIONAL LANDSCAPE', { fill: D.gold, ls: 2 });
  y += LH.label + 14;

  const elText = 'The prevailing tone is one of hushed wonder laced with a thread of longing. You enter the dream already knowing you will leave it — the glass reminds you nothing is permanent here.';
  const [elSvg] = textBlock(CX, y, elText, { fs: TS.body2 - 2, fill: D.textSoft });
  o += elSvg;

  return o;
}

// ── 5 · Paywall / Explorer ────────────────────────────────────────────────
function paywallScreen() {
  let o = '';
  let y = TOP_NAV;

  // Header strip
  o += mono(CX,  y, 'NOCTUA EXPLORER', { fill: D.gold, ls: 2 });
  o += mono(CRX, y, 'NOT NOW',         { anchor: 'end', fill: D.textDim });
  y += LH.label + 28;

  // Decorative icon cluster
  const icx = SCTR_X, icy = y + 24;
  o += `<circle cx="${icx}" cy="${icy}" r="44" fill="none" stroke="${D.gold}" stroke-width="1.5" stroke-dasharray="5 10" opacity="0.28"/>`;
  o += diamond(icx, icy, 14);
  o += diamond(icx, icy, 6);
  y += 72 + 20;

  // Hero text
  o += slab(SCTR_X, y, 'Unlock the',    { anchor: 'middle', fs: 52, fill: D.text });
  y += 68;
  o += slab(SCTR_X, y, 'full archive.', { anchor: 'middle', fs: 52, fill: D.gold });
  y += 68 + 12;

  // Sub-copy
  const sub = 'Free access covers 3 interpretations per month. Explorer opens everything — all lenses, all history.';
  const [subSvg, subH] = textBlock(CX, y, sub, { fs: TS.body, fill: D.textSoft });
  o += subSvg;
  y += subH + 24;

  o += rule(SX, SCR_R, y, { opacity: 0.3 }); y += 22;

  // Feature list
  const features = [
    'Unlimited interpretations each month',
    'All six analytical lenses',
    'Symbol cartography across time',
    'Pattern recognition & recurring themes',
    'Export your full archive',
  ];
  features.forEach(f => {
    o += diamond(CX + 6, y + 10, 5);
    o += sans(CX + 24, y, f, { fs: TS.body, fill: D.text });
    y += 44;
  });
  y += 12;

  // Package cards (Lifetime | Annual ★ | Monthly)
  const pkgW = (CW - 28) / 3;
  const pkgH = 100;
  const pkgs = [
    { label: 'LIFETIME', price: '$149.99', sub: 'one-time',     popular: false, color: D.textDim },
    { label: 'ANNUAL',   price: '$59.99',  sub: '$5/mo billed', popular: true,  color: D.gold    },
    { label: 'MONTHLY',  price: '$6.99',   sub: 'per month',    popular: false, color: D.textDim },
  ];
  pkgs.forEach(({ label, price, sub: psub, popular, color }, i) => {
    const px = CX + i * (pkgW + 14);
    o += `<rect x="${px}" y="${y}" width="${pkgW}" height="${pkgH}" rx="4" fill="${popular ? '#120f04' : 'none'}" stroke="${popular ? D.gold : D.rule}" stroke-width="${popular ? 2 : 1}"/>`;
    if (popular) {
      const bw = pkgW - 8;
      o += `<rect x="${px + 4}" y="${y - 20}" width="${bw}" height="24" rx="3" fill="${D.gold}"/>`;
      o += mono(px + pkgW / 2, y - 16, 'POPULAR', { anchor: 'middle', fs: 15, fill: D.bg, ls: 1, fw: 700 });
    }
    o += mono(px + pkgW / 2, y + 13,  label, { anchor: 'middle', fill: color, ls: 1, fw: 600, fs: TS.label });
    o += slab(px + pkgW / 2, y + 36,  price, { anchor: 'middle', fs: 28, fill: popular ? D.gold : D.text, italic: false, fw: 600 });
    o += sans(px + pkgW / 2, y + 74,  psub,  { anchor: 'middle', fs: 18, fill: D.textDim });
  });
  y += pkgH + 28;

  // CTA button
  const btnH = 74;
  o += `<rect x="${CX}" y="${y}" width="${CW}" height="${btnH}" fill="${D.gold}"/>`;
  o += mono(SCTR_X, y + 24, 'BEGIN EXPLORATION', { anchor: 'middle', fill: D.bg, ls: 3, fw: 700, fs: TS.label2 });
  y += btnH + 22;

  // Restore
  o += mono(SCTR_X, y, 'RESTORE PURCHASES', { anchor: 'middle', fill: D.textDim, ls: 2 });
  y += LH.label + 16;

  // Legal
  o += sans(SCTR_X, y, 'Subscription auto-renews. Cancel anytime in App Store settings.', { anchor: 'middle', fs: 20, fill: D.textDim });
  y += 34;
  o += sans(SCTR_X, y, 'Privacy Policy  ·  Terms of Use', { anchor: 'middle', fs: 20, fill: D.textDim });

  return o;
}

// ═════════════════════════════════════════════════════════════════════════
// ── Google Play feature graphic (1024×500) ────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════
function featureGraphicSvg() {
  const fw = 1024, fh = 500;
  const GOLD = D.gold, BG = D.bg;

  // Owl (scaled version of master icon, centred left half)
  const ox = 200, oy = 80, os = 0.32; // origin + scale
  const ow = (x) => ox + x * os;
  const oh = (y) => oy + y * os;

  const owlSvg = `
    <circle cx="${ow(512)}" cy="${oh(512)}" r="${340 * os}" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="4 10" opacity="0.2"/>
    <line x1="${ow(512)}" y1="${oh(440)}" x2="${ow(260)}" y2="${oh(560)}" stroke="${GOLD}" stroke-width="3" opacity="0.45"/>
    <line x1="${ow(260)}" y1="${oh(560)}" x2="${ow(310)}" y2="${oh(680)}" stroke="${GOLD}" stroke-width="2.5" opacity="0.3"/>
    <line x1="${ow(512)}" y1="${oh(440)}" x2="${ow(764)}" y2="${oh(560)}" stroke="${GOLD}" stroke-width="3" opacity="0.45"/>
    <line x1="${ow(764)}" y1="${oh(560)}" x2="${ow(714)}" y2="${oh(680)}" stroke="${GOLD}" stroke-width="2.5" opacity="0.3"/>
    <line x1="${ow(512)}" y1="${oh(440)}" x2="${ow(512)}" y2="${oh(700)}" stroke="${GOLD}" stroke-width="2.5" opacity="0.35"/>
    <line x1="${ow(430)}" y1="${oh(310)}" x2="${ow(400)}" y2="${oh(210)}" stroke="${GOLD}" stroke-width="3" opacity="0.55"/>
    <line x1="${ow(594)}" y1="${oh(310)}" x2="${ow(624)}" y2="${oh(210)}" stroke="${GOLD}" stroke-width="3" opacity="0.55"/>
    <path d="M ${ow(380)} ${oh(430)} Q ${ow(512)} ${oh(270)} ${ow(644)} ${oh(430)}" fill="none" stroke="${GOLD}" stroke-width="2.5" opacity="0.4"/>
    <circle cx="${ow(430)}" cy="${oh(460)}" r="${66 * os}" fill="${GOLD}" opacity="0.06"/>
    <circle cx="${ow(430)}" cy="${oh(460)}" r="${52 * os}" fill="none" stroke="${GOLD}" stroke-width="3.5" opacity="0.65"/>
    <circle cx="${ow(430)}" cy="${oh(460)}" r="${30 * os}" fill="${GOLD}" opacity="0.12"/>
    <circle cx="${ow(430)}" cy="${oh(460)}" r="${14 * os}" fill="${GOLD}" opacity="0.88"/>
    <circle cx="${ow(440)}" cy="${oh(452)}" r="${5 * os}"  fill="#fff"   opacity="0.5"/>
    <circle cx="${ow(594)}" cy="${oh(460)}" r="${66 * os}" fill="${GOLD}" opacity="0.06"/>
    <circle cx="${ow(594)}" cy="${oh(460)}" r="${52 * os}" fill="none" stroke="${GOLD}" stroke-width="3.5" opacity="0.65"/>
    <circle cx="${ow(594)}" cy="${oh(460)}" r="${30 * os}" fill="${GOLD}" opacity="0.12"/>
    <circle cx="${ow(594)}" cy="${oh(460)}" r="${14 * os}" fill="${GOLD}" opacity="0.88"/>
    <circle cx="${ow(604)}" cy="${oh(452)}" r="${5 * os}"  fill="#fff"   opacity="0.5"/>
    <polygon points="${ow(512)},${oh(520)} ${ow(490)},${oh(548)} ${ow(512)},${oh(568)} ${ow(534)},${oh(548)}" fill="${GOLD}" opacity="0.82"/>
    <circle cx="${ow(400)}" cy="${oh(210)}" r="${8 * os}" fill="${GOLD}" opacity="0.88"/>
    <circle cx="${ow(624)}" cy="${oh(210)}" r="${8 * os}" fill="${GOLD}" opacity="0.88"/>
    <circle cx="${ow(260)}" cy="${oh(560)}" r="${7 * os}" fill="${GOLD}" opacity="0.7"/>
    <circle cx="${ow(764)}" cy="${oh(560)}" r="${7 * os}" fill="${GOLD}" opacity="0.7"/>
    <polygon points="${ow(512)},${oh(630)} ${ow(524)},${oh(650)} ${ow(512)},${oh(670)} ${ow(500)},${oh(650)}" fill="${GOLD}" opacity="0.75"/>`;

  // Right half: wordmark + tagline
  const tx = 480;
  const wm  = `<text x="${tx}" y="148" font-family="'Courier New', monospace" font-size="17" fill="${GOLD}" letter-spacing="7" opacity="0.7">N O C T U A</text>`;
  const hl1 = `<text x="${tx}" y="196" font-family="Georgia, serif" font-size="86" fill="#e8e6e0" font-style="italic">Dream</text>`;
  const hl2 = `<text x="${tx}" y="284" font-family="Georgia, serif" font-size="86" fill="${GOLD}" font-style="italic">Journal.</text>`;
  const tag = `<text x="${tx}" y="360" font-family="'Helvetica Neue', sans-serif" font-size="20" fill="#a8a59c" letter-spacing="2">Capture the night. Interpret the depths.</text>`;

  // Decorative rule
  const dv = `<line x1="${tx}" y1="390" x2="${tx + 120}" y2="390" stroke="${GOLD}" stroke-width="1" opacity="0.4"/>
    <polygon points="${tx+128},390 ${tx+135},383 ${tx+142},390 ${tx+135},397" fill="${GOLD}" opacity="0.5"/>
    <line x1="${tx+150}" y1="390" x2="${tx+270}" y2="390" stroke="${GOLD}" stroke-width="1" opacity="0.4"/>`;

  // Subtle vertical rule between owl and text
  const vr = `<line x1="430" y1="60" x2="430" y2="440" stroke="${GOLD}" stroke-width="0.8" opacity="0.12"/>`;

  // Background stars
  const stars = [[30,40,2.5,0.2],[990,60,2,0.18],[60,460,2,0.15],[980,440,2.5,0.18],[512,30,2.5,0.2]];
  const starSvg = stars.map(([x,y,r,op]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" opacity="${op}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}">
  <rect width="${fw}" height="${fh}" fill="${BG}"/>
  ${starSvg}
  ${owlSvg}
  ${vr}
  ${wm}${hl1}${hl2}${tag}${dv}
</svg>`;
}

// ═════════════════════════════════════════════════════════════════════════
// ── Generate all assets ───────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════

console.log('\nGenerating Noctua App Store screenshots…\n');

const shots = [
  { idx: 0, hl1: 'Every dream,',  hl2: 'remembered', fn: captureScreen,  name: '01-capture'      },
  { idx: 1, hl1: 'Your archive,', hl2: 'in full',    fn: archiveScreen,  name: '02-archive'      },
  { idx: 2, hl1: 'Three lenses',  hl2: 'of meaning', fn: interpretScreen,name: '03-interpretation'},
  { idx: 3, hl1: 'Symbols,',      hl2: 'decoded',    fn: symbolsScreen,  name: '04-symbols'      },
  { idx: 4, hl1: 'Explore',       hl2: 'without limits', fn: paywallScreen, name: '05-explorer'  },
];

for (const { idx, hl1, hl2, fn, name } of shots) {
  const svg  = makeShot(idx, hl1, hl2, fn);
  const path = join(OUT, `screenshot-${name}.png`);
  await sharp(Buffer.from(svg)).png().toFile(path);
  console.log(`  ✓ ${name}  (1290×2796)`);
}

// Feature graphic
const fgSvg  = featureGraphicSvg();
const fgPath = join(OUT, 'feature-graphic.png');
await sharp(Buffer.from(fgSvg)).resize(1024, 500).png().toFile(fgPath);
console.log('  ✓ feature-graphic  (1024×500)');

// Also write master SVGs for tweaking
writeFileSync(join(OUT, 'feature-graphic.svg'), fgSvg);
console.log('\n✓ All assets written to scripts/assets/screenshots/');
console.log('  iOS (6.7"):  screenshot-01 … 05 (1290×2796)');
console.log('  Google Play: feature-graphic.png (1024×500)');
