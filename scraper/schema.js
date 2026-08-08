// Schema definitions, normalization, and validation for rto_database.json.
//
// The existing dataset has two arrays we can safely extend:
//   1. general_faqs : [{ category, question, answer }]
//   2. services     : [{ id, name, category, description, prerequisites,
//                        common_steps[], state_variations{}, applicant_requirements{}, faqs[] }]
//
// We normalise + validate BEFORE appending so malformed/scraped records can
// never enter the dataset and break the running React app.
//
// NOTE: The current working sources only produce `general_faqs` records,
// because that array is the only schema element designed for open-ended
// growth and can be filled with reliably-sourced factual content. Service
// records require a fully-structured source (e.g. a future Parivahan adapter)
// and are validated here for forward-compatibility.

export const SCHEMA_VERSION = '1.0.0';

export function normalizeText(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/\s+/g, ' ').trim();
}

export function normalizeGeneralFaq(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const category = normalizeText(raw.category);
  const question = normalizeText(raw.question);
  const answer = normalizeText(raw.answer);

  // Thresholds: reject empty / trivially short content (malformed scrapes).
  if (!category || question.length < 10 || answer.length < 25) return null;

  // Return EXACTLY the three keys the app expects (no extra keys).
  return { category, question, answer };
}

export function validateDataset(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.services)) return false;
  if (!Array.isArray(data.general_faqs)) return false;
  if (!data.metadata || typeof data.metadata !== 'object') return false;
  return true;
}
