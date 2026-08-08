// Abstract base for all data sources + shared HTTP utilities
// (retry with exponential backoff + polite inter-request delay).
import { PIPELINE_CONFIG } from '../config.js';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class SourceAdapter {
  constructor(name, target = 'general_faqs') {
    this.name = name;
    this.target = target; // which dataset array this source fills
  }

  // Subclasses MUST implement this. Should return an array of RAW records
  // (plain objects). The pipeline normalises + validates them afterwards.
  async fetchRecords(/* logger */) {
    throw new Error(`fetchRecords() not implemented for source "${this.name}"`);
  }

  // Single GET returning parsed JSON. Throws on non-2xx / network error /
  // timeout (so fetchWithRetry can catch + retry).
  async httpGet(url, { timeout = PIPELINE_CONFIG.requestTimeoutMs } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': PIPELINE_CONFIG.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

// Retry wrapper with exponential backoff. Returns parsed JSON or null
// (after exhausting retries). Logs success/failure via the shared logger.
export async function fetchWithRetry(source, url, logger, opts = {}) {
  const retries = opts.retries ?? PIPELINE_CONFIG.maxRetries;
  const backoff = opts.backoff ?? PIPELINE_CONFIG.retryBackoffMs;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await source.httpGet(url, opts);
      if (logger) logger.logRequestOk();
      return data;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await sleep(backoff * (attempt + 1));
      }
    }
  }
  if (logger) logger.logRequestFail(url, lastErr);
  return null;
}

export default SourceAdapter;
