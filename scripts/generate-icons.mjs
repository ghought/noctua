/**
 * Noctua icon generator
 * Produces all iOS + Android icon sizes from a master SVG.
 *
 * Design: Black ground, gold constellation owl — Noctua means "little owl"
 * in Latin and is also a historical constellation. The icon is a simplified
 * geometric owl head built from constellation dots and lines in gold (#c9a866).
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Master SVG (1024×1024) ────────────────────────────────────────────────

const GOLD = '#c9a866';
const BG   = '#000000';

const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="${BG}"/>

  <!-- Outer constellation ring (subtle) -->
  <circle cx="512" cy="512" r="340" fill="none" stroke="${GOLD}" stroke-width="1.5" stroke-dasharray="6 14" opacity="0.25"/>

  <!-- Wing lines — left -->
  <line x1="512" y1="440" x2="260" y2="560" stroke="${GOLD}" stroke-width="3" opacity="0.5"/>
  <line x1="260" y1="560" x2="310" y2="680" stroke="${GOLD}" stroke-width="2.5" opacity="0.35"/>
  <!-- Wing lines — right -->
  <line x1="512" y1="440" x2="764" y2="560" stroke="${GOLD}" stroke-width="3" opacity="0.5"/>
  <line x1="764" y1="560" x2="714" y2="680" stroke="${GOLD}" stroke-width="2.5" opacity="0.35"/>

  <!-- Body line -->
  <line x1="512" y1="440" x2="512" y2="700" stroke="${GOLD}" stroke-width="2.5" opacity="0.4"/>

  <!-- Ear tufts -->
  <line x1="430" y1="310" x2="400" y2="210" stroke="${GOLD}" stroke-width="3" opacity="0.6"/>
  <line x1="594" y1="310" x2="624" y2="210" stroke="${GOLD}" stroke-width="3" opacity="0.6"/>

  <!-- Head outline arc (implied by dots) -->
  <path d="M 380 430 Q 512 270 644 430" fill="none" stroke="${GOLD}" stroke-width="2.5" opacity="0.5"/>

  <!-- Left eye — outer glow -->
  <circle cx="430" cy="460" r="66" fill="${GOLD}" opacity="0.08"/>
  <!-- Left eye — ring -->
  <circle cx="430" cy="460" r="52" fill="none" stroke="${GOLD}" stroke-width="3.5" opacity="0.7"/>
  <!-- Left eye — iris -->
  <circle cx="430" cy="460" r="30" fill="${GOLD}" opacity="0.15"/>
  <!-- Left eye — pupil -->
  <circle cx="430" cy="460" r="14" fill="${GOLD}" opacity="0.9"/>
  <!-- Left eye — highlight -->
  <circle cx="440" cy="452" r="5" fill="#ffffff" opacity="0.6"/>

  <!-- Right eye — outer glow -->
  <circle cx="594" cy="460" r="66" fill="${GOLD}" opacity="0.08"/>
  <!-- Right eye — ring -->
  <circle cx="594" cy="460" r="52" fill="none" stroke="${GOLD}" stroke-width="3.5" opacity="0.7"/>
  <!-- Right eye — iris -->
  <circle cx="594" cy="460" r="30" fill="${GOLD}" opacity="0.15"/>
  <!-- Right eye — pupil -->
  <circle cx="594" cy="460" r="14" fill="${GOLD}" opacity="0.9"/>
  <!-- Right eye — highlight -->
  <circle cx="604" cy="452" r="5" fill="#ffffff" opacity="0.6"/>

  <!-- Beak (small diamond) -->
  <polygon points="512,520 490,548 512,568 534,548" fill="${GOLD}" opacity="0.85"/>

  <!-- Constellation dots: ear tips -->
  <circle cx="400" cy="210" r="8" fill="${GOLD}" opacity="0.9"/>
  <circle cx="624" cy="210" r="8" fill="${GOLD}" opacity="0.9"/>

  <!-- Constellation dots: wing tips -->
  <circle cx="260" cy="560" r="7" fill="${GOLD}" opacity="0.75"/>
  <circle cx="764" cy="560" r="7" fill="${GOLD}" opacity="0.75"/>
  <circle cx="310" cy="680" r="6" fill="${GOLD}" opacity="0.6"/>
  <circle cx="714" cy="680" r="6" fill="${GOLD}" opacity="0.6"/>

  <!-- Central chest star (diamond) -->
  <polygon points="512,630 524,650 512,670 500,650" fill="${GOLD}" opacity="0.8"/>

  <!-- Scattered background stars -->
  <circle cx="180" cy="180" r="3" fill="${GOLD}" opacity="0.4"/>
  <circle cx="844" cy="200" r="2.5" fill="${GOLD}" opacity="0.35"/>
  <circle cx="150" cy="700" r="2" fill="${GOLD}" opacity="0.3"/>
  <circle cx="870" cy="750" r="3" fill="${GOLD}" opacity="0.35"/>
  <circle cx="512" cy="120" r="2.5" fill="${GOLD}" opacity="0.4"/>
  <circle cx="200" cy="430" r="2" fill="${GOLD}" opacity="0.25"/>
  <circle cx="820" cy="400" r="2" fill="${GOLD}" opacity="0.25"/>
  <circle cx="350" cy="820" r="2.5" fill="${GOLD}" opacity="0.3"/>
  <circle cx="670" cy="830" r="2" fill="${GOLD}" opacity="0.3"/>
</svg>`;

// ── iOS sizes ─────────────────────────────────────────────────────────────

const iosSizes = [
  { size: 20,   scales: [1, 2, 3] },
  { size: 29,   scales: [1, 2, 3] },
  { size: 40,   scales: [1, 2, 3] },
  { size: 60,   scales: [2, 3] },
  { size: 76,   scales: [1, 2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] },
];

// ── Android sizes ──────────────────────────────────────────────────────────

const androidSizes = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

const svgBuffer = Buffer.from(masterSvg);

// ── Generate iOS icons ─────────────────────────────────────────────────────

const iosIconDir = join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
mkdirSync(iosIconDir, { recursive: true });

const iosEntries = [];

for (const { size, scales } of iosSizes) {
  for (const scale of scales) {
    const px = Math.round(size * scale);
    const filename = scale === 1
      ? `icon-${px}.png`
      : `icon-${Math.round(size)}-${scale}x.png`;

    await sharp(svgBuffer)
      .resize(px, px)
      .png()
      .toFile(join(iosIconDir, filename));

    iosEntries.push({
      filename,
      idiom: size >= 76 && size !== 1024 ? 'ipad' : size === 1024 ? 'ios-marketing' : 'iphone',
      size: `${size}x${size}`,
      scale: `${scale}x`,
    });

    console.log(`  iOS  ${filename} (${px}×${px})`);
  }
}

// Contents.json for Xcode
const contentsJson = {
  images: iosEntries.map(e => ({
    filename: e.filename,
    idiom: e.idiom,
    scale: e.scale,
    size: e.size,
  })),
  info: { author: 'xcode', version: 1 },
};
writeFileSync(join(iosIconDir, 'Contents.json'), JSON.stringify(contentsJson, null, 2));

// ── Generate Android icons ─────────────────────────────────────────────────

for (const { dir, size } of androidSizes) {
  const outDir = join(root, `android/app/src/main/res/${dir}`);
  mkdirSync(outDir, { recursive: true });

  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outDir, 'ic_launcher.png'));

  // Round icon variant (Android 8+)
  const roundedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <clipPath id="circle">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}"/>
      </clipPath>
    </defs>
    <image href="data:image/svg+xml;base64,${Buffer.from(masterSvg).toString('base64')}"
      width="${size}" height="${size}" clip-path="url(#circle)"/>
  </svg>`;

  await sharp(Buffer.from(roundedSvg))
    .resize(size, size)
    .png()
    .toFile(join(outDir, 'ic_launcher_round.png'));

  console.log(`  Android ${dir} (${size}×${size})`);
}

// ── Save master SVG for reference ─────────────────────────────────────────

mkdirSync(join(root, 'scripts/assets'), { recursive: true });
writeFileSync(join(root, 'scripts/assets/icon-master.svg'), masterSvg);
console.log('\n✓ Master SVG saved to scripts/assets/icon-master.svg');
console.log('✓ iOS icons written to ios/App/App/Assets.xcassets/AppIcon.appiconset/');
console.log('✓ Android icons written to android/app/src/main/res/mipmap-*/');
