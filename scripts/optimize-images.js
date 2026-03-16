/**
 * VibAura Image Optimizer
 * Converts large PNG images to WebP and resizes them for web use.
 * Run with: node scripts/optimize-images.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '../frontend/public/images');

const imagesToOptimize = [
  // Logo shown in the splash screen and nav - displayed at max 280px
  { input: 'music.png',         output: 'music.webp',         width: 512 },
  // Artist/Playlist/Song fallback thumbnails - displayed at ~200px max
  { input: 'Artist.png',        output: 'Artist.webp',        width: 300 },
  { input: 'Playlist.png',      output: 'Playlist.webp',      width: 300 },
  { input: 'Song.png',          output: 'Song.webp',          width: 300 },
  // Logo text in desktop navbar - displayed at ~150px wide
  { input: 'logo-text.png',     output: 'logo-text.webp',     width: 300 },
];

async function optimize() {
  console.log('Starting image optimization...\n');
  let totalSavedBytes = 0;

  for (const img of imagesToOptimize) {
    const inputPath  = path.join(imagesDir, img.input);
    const outputPath = path.join(imagesDir, img.output);

    if (!fs.existsSync(inputPath)) {
      console.warn(`  SKIP  ${img.input} (file not found)`);
      continue;
    }

    await sharp(inputPath)
      .resize({ width: img.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    const oldBytes = fs.statSync(inputPath).size;
    const newBytes = fs.statSync(outputPath).size;
    const saved = oldBytes - newBytes;
    totalSavedBytes += saved;

    const oldMB  = (oldBytes / 1024 / 1024).toFixed(2);
    const newKB  = (newBytes / 1024).toFixed(1);
    const pct    = ((saved / oldBytes) * 100).toFixed(1);

    console.log(`  OK    ${img.input.padEnd(18)} ${oldMB} MB  →  ${newKB} KB  (saved ${pct}%)`);
  }

  const totalMB = (totalSavedBytes / 1024 / 1024).toFixed(2);
  console.log(`\nDone! Total saved: ${totalMB} MB`);
}

optimize().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
