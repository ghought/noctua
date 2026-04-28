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
  <rect width="2732" height="2732" fill="${BG}"/>

  <!-- Subtle background stars scattered across field -->
  <circle cx="400"  cy="320"  r="3"   fill="${GOLD}" opacity="0.25"/>
  <circle cx="2330" cy="280"  r="2.5" fill="${GOLD}" opacity="0.2"/>
  <circle cx="220"  cy="1400" r="2"   fill="${GOLD}" opacity="0.18"/>
  <circle cx="2510" cy="1600" r="3"   fill="${GOLD}" opacity="0.2"/>
  <circle cx="900"  cy="2400" r="2.5" fill="${GOLD}" opacity="0.18"/>
  <circle cx="1840" cy="2460" r="2"   fill="${GOLD}" opacity="0.15"/>
  <circle cx="680"  cy="600"  r="2"   fill="${GOLD}" opacity="0.2"/>
  <circle cx="2050" cy="520"  r="2.5" fill="${GOLD}" opacity="0.18"/>
  <circle cx="350"  cy="2100" r="2"   fill="${GOLD}" opacity="0.15"/>
  <circle cx="2400" cy="2200" r="3"   fill="${GOLD}" opacity="0.2"/>
  <circle cx="1366" cy="400"  r="3"   fill="${GOLD}" opacity="0.25"/>

  <!-- Outer constellation ring -->
  <circle cx="1366" cy="1180" r="540" fill="none" stroke="${GOLD}" stroke-width="2" stroke-dasharray="8 18" opacity="0.2"/>

  <!-- Wing lines — left -->
  <line x1="1366" y1="1100" x2="860"  y2="1300" stroke="${GOLD}" stroke-width="4.5" opacity="0.45"/>
  <line x1="860"  y1="1300" x2="960"  y2="1540" stroke="${GOLD}" stroke-width="3.5" opacity="0.3"/>
  <!-- Wing lines — right -->
  <line x1="1366" y1="1100" x2="1872" y2="1300" stroke="${GOLD}" stroke-width="4.5" opacity="0.45"/>
  <line x1="1872" y1="1300" x2="1772" y2="1540" stroke="${GOLD}" stroke-width="3.5" opacity="0.3"/>

  <!-- Body line -->
  <line x1="1366" y1="1100" x2="1366" y2="1600" stroke="${GOLD}" stroke-width="3.5" opacity="0.35"/>

  <!-- Ear tufts -->
  <line x1="1230" y1="870" x2="1170" y2="700" stroke="${GOLD}" stroke-width="4.5" opacity="0.55"/>
  <line x1="1502" y1="870" x2="1562" y2="700" stroke="${GOLD}" stroke-width="4.5" opacity="0.55"/>

  <!-- Head arc -->
  <path d="M 1110 1060 Q 1366 800 1622 1060" fill="none" stroke="${GOLD}" stroke-width="3.5" opacity="0.45"/>

  <!-- Left eye — glow -->
  <circle cx="1230" cy="1100" r="110" fill="${GOLD}" opacity="0.06"/>
  <!-- Left eye — ring -->
  <circle cx="1230" cy="1100" r="88"  fill="none" stroke="${GOLD}" stroke-width="5.5" opacity="0.65"/>
  <!-- Left eye — iris -->
  <circle cx="1230" cy="1100" r="50"  fill="${GOLD}" opacity="0.12"/>
  <!-- Left eye — pupil -->
  <circle cx="1230" cy="1100" r="24"  fill="${GOLD}" opacity="0.88"/>
  <!-- Left eye — highlight -->
  <circle cx="1248" cy="1083" r="8"   fill="#ffffff" opacity="0.55"/>

  <!-- Right eye — glow -->
  <circle cx="1502" cy="1100" r="110" fill="${GOLD}" opacity="0.06"/>
  <!-- Right eye — ring -->
  <circle cx="1502" cy="1100" r="88"  fill="none" stroke="${GOLD}" stroke-width="5.5" opacity="0.65"/>
  <!-- Right eye — iris -->
  <circle cx="1502" cy="1100" r="50"  fill="${GOLD}" opacity="0.12"/>
  <!-- Right eye — pupil -->
  <circle cx="1502" cy="1100" r="24"  fill="${GOLD}" opacity="0.88"/>
  <!-- Right eye — highlight -->
  <circle cx="1520" cy="1083" r="8"   fill="#ffffff" opacity="0.55"/>

  <!-- Beak -->
  <polygon points="1366,1220 1324,1278 1366,1312 1408,1278" fill="${GOLD}" opacity="0.82"/>

  <!-- Constellation dots: ear tips -->
  <circle cx="1170" cy="700" r="13" fill="${GOLD}" opacity="0.88"/>
  <circle cx="1562" cy="700" r="13" fill="${GOLD}" opacity="0.88"/>

  <!-- Wing tips -->
  <circle cx="860"  cy="1300" r="11" fill="${GOLD}" opacity="0.7"/>
  <circle cx="1872" cy="1300" r="11" fill="${GOLD}" opacity="0.7"/>
  <circle cx="960"  cy="1540" r="9"  fill="${GOLD}" opacity="0.55"/>
  <circle cx="1772" cy="1540" r="9"  fill="${GOLD}" opacity="0.55"/>

  <!-- Central chest star -->
  <polygon points="1366,1470 1386,1506 1366,1542 1346,1506" fill="${GOLD}" opacity="0.75"/>

  <!-- Wordmark: NOCTUA -->
  <!-- Using geometric letter forms rendered as SVG paths at ~90px cap height -->
  <text
    x="1366" y="1780"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="96"
    font-weight="200"
    letter-spacing="36"
    text-anchor="middle"
    fill="${GOLD}"
    opacity="0.9"
  >NOCTUA</text>

  <!-- Subtitle rule + tagline -->
  <line x1="1066" y1="1830" x2="1666" y2="1830" stroke="${GOLD}" stroke-width="1" opacity="0.3"/>
  <text
    x="1366" y="1880"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="36"
    font-weight="300"
    letter-spacing="10"
    text-anchor="middle"
    fill="${GOLD}"
    opacity="0.45"
  >DREAM JOURNAL</text>
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
