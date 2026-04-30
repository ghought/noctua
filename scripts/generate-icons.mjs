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
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#16130d"/>
      <stop offset="48%" stop-color="#050505"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <linearGradient id="gold" x1="260" y1="160" x2="760" y2="840" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f0dca5"/>
      <stop offset="42%" stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="#755c27"/>
    </linearGradient>
    <filter id="softGold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.79 0 0 0 0 0.66 0 0 0 0 0.40 0 0 0 0.28 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1024" height="1024" rx="210" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="370" fill="none" stroke="url(#gold)" stroke-width="22" opacity="0.92"/>
  <circle cx="512" cy="512" r="314" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.32"/>
  <circle cx="512" cy="512" r="268" fill="#050505" stroke="#2a2214" stroke-width="3"/>

  <g filter="url(#softGold)">
    <path d="M314 395 C350 284 430 230 512 230 C594 230 674 284 710 395 C748 505 702 650 512 785 C322 650 276 505 314 395 Z" fill="url(#gold)"/>
    <path d="M362 404 C396 345 448 318 512 318 C576 318 628 345 662 404 C634 382 594 376 560 395 C540 406 524 424 512 448 C500 424 484 406 464 395 C430 376 390 382 362 404 Z" fill="#050505" opacity="0.96"/>
    <path d="M376 314 L330 178 L458 266 Z" fill="url(#gold)"/>
    <path d="M648 314 L694 178 L566 266 Z" fill="url(#gold)"/>
    <circle cx="422" cy="474" r="86" fill="#050505"/>
    <circle cx="602" cy="474" r="86" fill="#050505"/>
    <circle cx="422" cy="474" r="54" fill="none" stroke="url(#gold)" stroke-width="20"/>
    <circle cx="602" cy="474" r="54" fill="none" stroke="url(#gold)" stroke-width="20"/>
    <circle cx="422" cy="474" r="18" fill="url(#gold)"/>
    <circle cx="602" cy="474" r="18" fill="url(#gold)"/>
    <path d="M512 525 L468 590 L512 638 L556 590 Z" fill="#050505"/>
    <path d="M512 538 L486 584 L512 612 L538 584 Z" fill="url(#gold)"/>
    <path d="M382 646 C428 690 468 718 512 742 C556 718 596 690 642 646" fill="none" stroke="#050505" stroke-width="32" stroke-linecap="round" opacity="0.92"/>
  </g>

  <g opacity="0.62">
    <circle cx="512" cy="146" r="8" fill="${GOLD}"/>
    <circle cx="250" cy="274" r="5" fill="${GOLD}"/>
    <circle cx="774" cy="274" r="5" fill="${GOLD}"/>
    <circle cx="210" cy="700" r="4" fill="${GOLD}"/>
    <circle cx="814" cy="700" r="4" fill="${GOLD}"/>
  </g>
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

function iconPipeline(size) {
  return sharp(svgBuffer)
    .resize(size, size)
    .flatten({ background: BG })
    .removeAlpha()
    .png({ palette: false });
}

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

    await iconPipeline(px).toFile(join(iosIconDir, filename));

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

  await iconPipeline(size).toFile(join(outDir, 'ic_launcher.png'));

  await iconPipeline(size).toFile(join(outDir, 'ic_launcher_foreground.png'));

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
    .flatten({ background: BG })
    .removeAlpha()
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
