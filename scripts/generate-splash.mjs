/**
 * Noctua splash screen generator
 * Produces 2732×2732 splash at 1x/2x/3x for iOS and Android launch images.
 *
 * Design: Full black field, centred constellation owl (same motif as icon)
 * with "NOCTUA" wordmark beneath, in gold.
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const GOLD = '#c9a866';
const BG   = '#000000';

// ── Master splash SVG (2732×2732) ─────────────────────────────────────────
// Owl is centred in the top half; wordmark sits just below centre.
// Everything is proportioned so it reads at all crop points (iPhone, iPad, etc.)

const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="#15120c"/>
      <stop offset="48%" stop-color="#030303"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <linearGradient id="gold" x1="900" y1="520" x2="1840" y2="1820" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f0dca5"/>
      <stop offset="42%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="#755c27"/>
    </linearGradient>
    <filter id="softGold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.79 0 0 0 0 0.66 0 0 0 0 0.40 0 0 0 0.26 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="2732" height="2732" fill="url(#bg)"/>
  <g opacity="0.36">
    <circle cx="420" cy="380" r="5" fill="${GOLD}"/>
    <circle cx="2290" cy="420" r="4" fill="${GOLD}"/>
    <circle cx="360" cy="1860" r="4" fill="${GOLD}"/>
    <circle cx="2370" cy="1960" r="5" fill="${GOLD}"/>
    <circle cx="1366" cy="350" r="5" fill="${GOLD}"/>
  </g>

  <g transform="translate(0 -40)" filter="url(#softGold)">
    <circle cx="1366" cy="1130" r="520" fill="none" stroke="url(#gold)" stroke-width="32" opacity="0.92"/>
    <circle cx="1366" cy="1130" r="444" fill="none" stroke="${GOLD}" stroke-width="3" opacity="0.28"/>
    <circle cx="1366" cy="1130" r="382" fill="#050505" stroke="#2a2214" stroke-width="5"/>
    <path d="M1084 980 C1134 822 1248 746 1366 746 C1484 746 1598 822 1648 980 C1702 1138 1636 1346 1366 1538 C1096 1346 1030 1138 1084 980 Z" fill="url(#gold)"/>
    <path d="M1152 992 C1201 907 1276 868 1366 868 C1456 868 1531 907 1580 992 C1539 960 1482 952 1434 978 C1405 994 1383 1020 1366 1054 C1349 1020 1327 994 1298 978 C1250 952 1193 960 1152 992 Z" fill="#050505" opacity="0.96"/>
    <path d="M1172 866 L1106 672 L1288 798 Z" fill="url(#gold)"/>
    <path d="M1560 866 L1626 672 L1444 798 Z" fill="url(#gold)"/>
    <circle cx="1238" cy="1094" r="122" fill="#050505"/>
    <circle cx="1494" cy="1094" r="122" fill="#050505"/>
    <circle cx="1238" cy="1094" r="76" fill="none" stroke="url(#gold)" stroke-width="28"/>
    <circle cx="1494" cy="1094" r="76" fill="none" stroke="url(#gold)" stroke-width="28"/>
    <circle cx="1238" cy="1094" r="26" fill="url(#gold)"/>
    <circle cx="1494" cy="1094" r="26" fill="url(#gold)"/>
    <path d="M1366 1168 L1304 1260 L1366 1328 L1428 1260 Z" fill="#050505"/>
    <path d="M1366 1188 L1329 1253 L1366 1294 L1403 1253 Z" fill="url(#gold)"/>
  </g>

  <text
    x="1366" y="1770"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="112"
    font-weight="300"
    letter-spacing="42"
    text-anchor="middle"
    fill="url(#gold)"
  >NOCTUA</text>
  <line x1="1046" y1="1830" x2="1686" y2="1830" stroke="${GOLD}" stroke-width="2" opacity="0.34"/>
  <text
    x="1366" y="1892"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="34"
    font-weight="400"
    letter-spacing="12"
    text-anchor="middle"
    fill="${GOLD}"
    opacity="0.54"
  >DREAM ARCHIVE</text>
</svg>`;

const svgBuffer = Buffer.from(splashSvg);

// ── iOS splash ─────────────────────────────────────────────────────────────
// Capacitor SplashScreen expects images in the Splash.imageset at 2732×2732

const iosDir = join(root, 'ios/App/App/Assets.xcassets/Splash.imageset');
mkdirSync(iosDir, { recursive: true });

const SIZE = 2732;

for (const { scale, filename } of [
  { scale: 1, filename: 'splash-2732x2732-1.png' },
  { scale: 2, filename: 'splash-2732x2732-2.png' },
  { scale: 3, filename: 'splash-2732x2732.png' },
]) {
  // All three are the same 2732 image — iOS picks the right one based on density
  await sharp(svgBuffer).resize(SIZE, SIZE).png().toFile(join(iosDir, filename));
  console.log(`  iOS splash  ${filename} (${SIZE}×${SIZE} @${scale}x)`);
}

// Contents.json already present in Splash.imageset from Capacitor — overwrite to be safe
const splashContents = {
  images: [
    { idiom: 'universal', filename: 'splash-2732x2732-1.png', scale: '1x' },
    { idiom: 'universal', filename: 'splash-2732x2732-2.png', scale: '2x' },
    { idiom: 'universal', filename: 'splash-2732x2732.png',   scale: '3x' },
  ],
  info: { version: 1, author: 'xcode' },
};
writeFileSync(join(iosDir, 'Contents.json'), JSON.stringify(splashContents, null, 2));

// ── Android splash ─────────────────────────────────────────────────────────
// Capacitor writes a launch_splash.png into each drawable-* folder

const androidDensities = [
  { dir: 'drawable',       size: 480  },
  { dir: 'drawable-land',  size: 480  },
  { dir: 'drawable-port',  size: 480  },
  { dir: 'drawable-ldpi',  size: 320  },
  { dir: 'drawable-mdpi',  size: 480  },
  { dir: 'drawable-hdpi',  size: 800  },
  { dir: 'drawable-xhdpi', size: 1280 },
  { dir: 'drawable-xxhdpi',size: 1600 },
  { dir: 'drawable-xxxhdpi', size: 1920 },
];

for (const { dir, size } of androidDensities) {
  const outDir = join(root, `android/app/src/main/res/${dir}`);
  mkdirSync(outDir, { recursive: true });

  await sharp(svgBuffer).resize(size, size).png().toFile(join(outDir, 'splash.png'));
  console.log(`  Android ${dir} splash (${size}×${size})`);
}

// ── Save master SVG ────────────────────────────────────────────────────────
mkdirSync(join(root, 'scripts/assets'), { recursive: true });
writeFileSync(join(root, 'scripts/assets/splash-master.svg'), splashSvg);

console.log('\n✓ Splash SVG saved to scripts/assets/splash-master.svg');
console.log('✓ iOS splash written to ios/App/App/Assets.xcassets/Splash.imageset/');
console.log('✓ Android splash written to android/app/src/main/res/drawable-*/');
