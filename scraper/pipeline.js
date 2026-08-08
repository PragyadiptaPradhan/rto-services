// Pipeline orchestrator: load existing dataset -> run each source ->
// normalise + validate + dedupe -> append new records -> persist.
import fs from 'node:fs';
import { DATASET_PATH, PIPELINE_CONFIG } from './config.js';
import { PipelineLogger } from './logger.js';
import { DedupeStore } from './dedupe.js';
import { normalizeGeneralFaq, validateDataset } from './schema.js';
import { WikipediaSource } from './sources/wikipedia.js';
import { ParivahanFaqSource } from './sources/parivahan_faq.js';

export function loadDataset(path = DATASET_PATH) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function saveDataset(data, path = DATASET_PATH) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// Source registry. Add a new adapter here + list its key in
// PIPELINE_CONFIG.enabledSources to activate it. Each factory returns a
// SourceAdapter instance, so adding a source never requires touching the
// orchestrator loop below.
//
// `requireKeywords` is an OPTIONAL safety net: when set, the resolved article
// title must contain at least one of the keywords or the article is skipped
// (prevents off-topic search matches from polluting the dataset).
export function buildSources() {
  const registry = {
    wikipedia: () =>
      new WikipediaSource({
        lang: 'en',
        label: 'wikipedia',
        articles: [
          { title: 'Driving licence in India', category: 'Driving Licence' },
          { title: "Learner's licence", category: "Learner's Licence" },
          { title: 'Vehicle registration', category: 'Vehicle Registration' },
          { title: 'International Driving Permit', category: 'International Driving Permit' },
          { title: 'Motor Vehicles Act, 1988', category: 'Legal Framework' },
          { title: 'Ministry of Road Transport and Highways', category: 'Government & Policy' },
          { title: 'Traffic police', category: 'Traffic Enforcement' },
          { title: 'Road safety', category: 'Road Safety' },
          { title: 'Vehicle insurance', category: 'Vehicle Insurance' },
          { title: 'Number plate', category: 'Number Plates' },
        ],
      }),
    'parivahan-faqs': () => new ParivahanFaqSource(),
    // Hindi source — IMPLEMENTED but DISABLED by default.
    // The search resolver can return off-topic articles (e.g. one title
    // resolved to a film about illegal immigration). Re-enable only after
    // verifying each `title` is correct AND keeping requireKeywords as a gate.
    'wikipedia-hi': () =>
      new WikipediaSource({
        lang: 'hi',
        label: 'wikipedia-hi',
        articles: [
          { title: 'ड्राइविंग लाइसेंस', category: 'ड्राइविंग लाइसेंस', requireKeywords: ['ड्राइविंग', 'लाइसेंस'] },
          { title: 'वाहन पंजीकरण', category: 'वाहन पंजीकरण', requireKeywords: ['वाहन', 'पंजीकरण'] },
          { title: 'अंतरराष्ट्रीय ड्राइविंग परमिट', category: 'अंतरराष्ट्रीय ड्राइविंग परमिट', requireKeywords: ['ड्राइविंग', 'लाइसेंस', 'परमिट'] },
        ],
      }),
  };

  return PIPELINE_CONFIG.enabledSources
    .map((name) => {
      const factory = registry[name];
      if (!factory) {
        console.warn(`  ⚠ Unknown source "${name}" — skipped.`);
        return null;
      }
      return factory();
    })
    .filter(Boolean);
}

export async function runPipeline({ dryRun = false, onlySources = null } = {}) {
  const logger = new PipelineLogger();
  const dataset = loadDataset();
  if (!validateDataset(dataset)) {
    throw new Error('Existing dataset failed structural validation; aborting to avoid corruption.');
  }

  const beforeFaqs = dataset.general_faqs.length;
  const dedupe = new DedupeStore(dataset.general_faqs);

  let sources = buildSources();
  if (onlySources) {
    const set = new Set(onlySources.split(','));
    sources = sources.filter((s) => set.has(s.name));
  }

  for (const source of sources) {
    console.log(`\n▶ Source: ${source.name}  (target: ${source.target})`);
    let rawRecords = [];
    try {
      rawRecords = await source.fetchRecords(logger);
    } catch (err) {
      console.error(`  ✗ Source "${source.name}" threw: ${err.message}`);
      logger.failedSources.push(source.name);
      continue;
    }
    logger.logCollected(rawRecords.length);
    console.log(`  collected ${rawRecords.length} raw records`);

    for (const raw of rawRecords) {
      const rec = normalizeGeneralFaq(raw);
      if (!rec) {
        logger.logInvalid('normalize/schema');
        continue;
      }
      if (dedupe.has(rec)) {
        logger.logDuplicate();
        continue;
      }
      dedupe.add(rec);
      if (!Array.isArray(dataset[source.target])) dataset[source.target] = [];
      dataset[source.target].push(rec);
      logger.logAppended();
    }
  }

  const afterFaqs = dataset.general_faqs.length;
  if (!dryRun) {
    saveDataset(dataset);
    console.log(`\n✔ Saved expanded dataset -> ${DATASET_PATH}`);
  } else {
    console.log(`\nⓘ DRY RUN: dataset NOT written to disk.`);
  }
  console.log(`  general_faqs: ${beforeFaqs} -> ${afterFaqs} (+${afterFaqs - beforeFaqs})`);

  logger.summary();
  return { logger, dataset };
}

export default runPipeline;
