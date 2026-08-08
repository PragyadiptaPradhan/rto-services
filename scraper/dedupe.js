// Deduplication store.
//
// Seeds from the EXISTING dataset so we never re-append records that are
// already present, and tracks everything we add during a run so the same
// record can't be added twice within one execution.
import crypto from 'node:crypto';

function dedupeKey(rec) {
  // Normalize: lowercase, strip punctuation/whitespace, keep letters+numbers.
  const norm = (s) =>
    (s || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  const base = norm(rec.question) + '|' + norm(rec.answer) + '|' + norm(rec.category);
  return crypto.createHash('sha256').update(base, 'utf8').digest('hex');
}

export class DedupeStore {
  constructor(existingRecords = []) {
    this.seen = new Set(
      existingRecords.map((r) => dedupeKey(r)).filter(Boolean)
    );
  }

  has(rec) {
    const k = dedupeKey(rec);
    return k ? this.seen.has(k) : false;
  }

  add(rec) {
    const k = dedupeKey(rec);
    if (k) this.seen.add(k);
  }

  get size() {
    return this.seen.size;
  }
}

export default DedupeStore;
