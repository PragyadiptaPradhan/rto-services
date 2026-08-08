// Central configuration for the RTO data-scraping pipeline.
// Edit this file to add sources, change rate limits, or point at a different dataset.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Canonical dataset path: <project>/src/data/rto_database.json
// (scraper/ lives at project root, so '../src/data/...' resolves correctly)
export const DATASET_PATH = path.resolve(__dirname, '..', 'src', 'data', 'rto_database.json');

export const PIPELINE_CONFIG = {
  // --- Politeness / network ---
  userAgent: 'RTO-Services-DataPipeline/1.0 (educational prototype; respects robots.txt)',
  requestDelayMs: 2000,     // delay BETWEEN requests to the same host (rate limiting)
  maxRetries: 3,            // retries per failed HTTP request
  retryBackoffMs: 1500,     // base backoff, multiplied by attempt index (exponential)
  requestTimeoutMs: 20000,  // per-request timeout

  // --- Quality gates ---
  maxRecordsPerSource: 500,  // hard safety cap (per source, per run)
  maxRecordsPerArticle: 20,  // balanced coverage: cap FAQs contributed by one article

  // Wikipedia section headings that should never become FAQ answers
  ignoredSections: new Set([
    'see also', 'references', 'external links', 'notes', 'citations',
    'further reading', 'gallery', 'footnotes', 'navigation', 'contents',
  ]),

  // Which sources to run, in priority order. Add new source keys here after
  // registering them in pipeline.js -> buildSources().
  // NOTE: 'wikipedia-hi' is implemented but disabled — its search resolver
  // returned off-topic articles, so it stays off until titles are verified.
  enabledSources: ['wikipedia', 'parivahan-faqs'],
};

export default PIPELINE_CONFIG;
