// Maintenance utility: re-apply cleanWikiText to answers already stored in the
// dataset (used after improving the cleaner, so historical records stay tidy).
// Run: node scraper/reclean.js
import fs from 'node:fs';
import { DATASET_PATH } from './config.js';
import { cleanWikiText } from './utils/wiki.js';

const d = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
let n = 0;
for (const r of d.general_faqs) {
  const cleaned = cleanWikiText(r.answer);
  if (cleaned !== r.answer) {
    r.answer = cleaned;
    n++;
  }
}
fs.writeFileSync(DATASET_PATH, JSON.stringify(d, null, 2) + '\n', 'utf8');
console.log(`re-cleaned ${n} stored answers`);
