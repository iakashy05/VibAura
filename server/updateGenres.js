/**
 * ============================================================
 * VibAura — Batch Genre Updater
 * ============================================================
 * HOW TO USE:
 *   1. Paste your batch of songs into the SONGS array below.
 *      Format: { title: "Exact Song Title", genre: ["Genre1", "Genre2"] }
 *   2. Run from the /server directory:
 *        node updateGenres.js
 *   3. Check the console output for results.
 *
 * SAFETY GUARANTEES:
 *   - Only the `category` field is updated ($set), nothing else touched.
 *   - Uses updateOne — never creates new documents (no upsert).
 *   - Case-insensitive title matching.
 *   - Duplicate titles in the batch are detected and skipped.
 *   - Full summary printed at the end.
 * ============================================================
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// ✏️  CURRENT BATCH
// ============================================================
const SONGS = [
  { title: "Don't Worry",                                  genre: ["Punjabi", "Chill", "Hip-Hop"] },
  { title: "Teri Ore",                                     genre: ["Romantic", "Soft", "Melodic"] },
  { title: "Dil Na Jaaneya - From \"Good Newwz\"",         genre: ["Punjabi", "Romantic", "Melodic"] },
  { title: "Rishte Naate - From \"De Dana Dan\"",          genre: ["Dance", "Party", "Bollywood"] },
];
// ============================================================

// ─── Minimal Song model (strict:false to avoid stripping other fields) ───
const songSchema = new mongoose.Schema(
  { title: String, genre: { type: [String], default: [] } },
  { strict: false }
);
const Song = mongoose.models.Song || mongoose.model('Song', songSchema);

// ─── Main ───────────────────────────────────────────────────
async function run() {
  if (SONGS.length === 0) {
    console.log('⚠️  SONGS array is empty. Paste your batch and run again.');
    process.exit(0);
  }

  console.log(`\n🎵 VibAura Genre Updater`);
  console.log(`📦 Batch size: ${SONGS.length} songs\n`);

  await mongoose.connect(process.env.DB_URI);
  console.log('✅ Connected to MongoDB\n');

  const stats = { updated: 0, alreadySet: 0, notFound: [], skipped: [], duplicatesInBatch: [] };
  const seenTitles = new Set();

  for (const entry of SONGS) {
    const rawTitle = entry.title?.trim();
    // Accept both string and array for genre
    const genreRaw = entry.genre;
    const genre = Array.isArray(genreRaw)
      ? genreRaw.map(g => g.trim()).filter(Boolean)
      : (genreRaw ? [genreRaw.trim()] : []);

    // Guard: missing fields
    if (!rawTitle || genre.length === 0) {
      console.warn(`  ⚠️  Skipping malformed entry:`, entry);
      stats.skipped.push(rawTitle ?? '[no title]');
      continue;
    }

    // Guard: duplicate within this batch
    const titleKey = rawTitle.toLowerCase();
    if (seenTitles.has(titleKey)) {
      console.warn(`  🔁 Duplicate in batch, skipping: "${rawTitle}"`);
      stats.duplicatesInBatch.push(rawTitle);
      continue;
    }
    seenTitles.add(titleKey);

    // Update — only $set category, never upsert
    const result = await Song.updateOne(
      { title: { $regex: new RegExp(`^${escapeRegex(rawTitle)}$`, 'i') } },
      { $set: { genre } }
    );

    if (result.matchedCount === 0) {
      console.log(`  ❌ Not found  : "${rawTitle}"`);
      stats.notFound.push(rawTitle);
    } else if (result.modifiedCount === 0) {
      console.log(`  ✔️  No change  : "${rawTitle}" → [${genre.join(', ')}]`);
      stats.alreadySet++;
    } else {
      console.log(`  ✅ Updated    : "${rawTitle}" → [${genre.join(', ')}]`);
      stats.updated++;
    }
  }

  // ─── Summary ──────────────────────────────────────────────
  const total = stats.updated + stats.alreadySet;
  console.log('\n══════════════════════════════════════════════════');
  console.log('📊 Batch Summary');
  console.log('══════════════════════════════════════════════════');
  console.log(`  ✅ Updated             : ${stats.updated}`);
  console.log(`  ✔️  Already tagged      : ${stats.alreadySet}`);
  console.log(`  ❌ Not Found           : ${stats.notFound.length}`);
  console.log(`  🔁 Batch Duplicates    : ${stats.duplicatesInBatch.length}`);
  console.log(`  ⚠️  Skipped (bad data) : ${stats.skipped.length}`);
  console.log(`  📦 Total Processed     : ${total} / ${SONGS.length}`);

  if (stats.notFound.length > 0) {
    console.log('\n  📋 Not Found (check spelling in DB):');
    stats.notFound.forEach(t => console.log(`     - "${t}"`));
  }

  console.log('\n✅ Done.\n');
  await mongoose.disconnect();
  process.exit(0);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
