// Lightweight logger that tracks the metrics required by the pipeline spec:
// successful requests, failed requests, skipped records, duplicates, and the
// total number of newly collected (appended) records.

const C = {
  ok: (s) => `[32m${s}[0m`,
  fail: (s) => `[31m${s}[0m`,
  warn: (s) => `[33m${s}[0m`,
  dim: (s) => `[90m${s}[0m`,
  bold: (s) => `[1m${s}[0m`,
};

export class PipelineLogger {
  constructor() {
    this.counts = {
      requestsSuccess: 0,
      requestsFailed: 0,
      recordsCollected: 0,
      recordsInvalid: 0,
      duplicates: 0,
      appended: 0,
    };
    this.failedSources = [];
    this.invalidReasons = {};
  }

  logRequestOk() { this.counts.requestsSuccess++; }
  logRequestFail(url, err) {
    this.counts.requestsFailed++;
    console.error(C.fail(`  ✗ request failed: ${url} -> ${err?.message || err}`));
  }
  logCollected(n) { this.counts.recordsCollected += n; }
  logInvalid(reason) {
    this.counts.recordsInvalid++;
    this.invalidReasons[reason] = (this.invalidReasons[reason] || 0) + 1;
  }
  logDuplicate() { this.counts.duplicates++; }
  logAppended() { this.counts.appended++; }

  summary() {
    const s = this.counts;
    console.log('\n' + C.bold('=== PIPELINE SUMMARY ==='));
    console.log(`  ${C.ok('Requests succeeded')} : ${s.requestsSuccess}`);
    console.log(`  ${C.fail('Requests failed')}    : ${s.requestsFailed}`);
    console.log(`  Raw records collected : ${s.recordsCollected}`);
    console.log(`  ${C.warn('Invalid / skipped')}   : ${s.recordsInvalid}`);
    console.log(`  Duplicates skipped    : ${s.duplicates}`);
    console.log(`  ${C.ok('Newly appended')}     : ${s.appended}`);
    console.log(`  Failed sources        : ${this.failedSources.join(', ') || 'none'}`);
    if (s.recordsInvalid > 0) {
      console.log(`  Invalid breakdown     : ${JSON.stringify(this.invalidReasons)}`);
    }
    return s;
  }
}

export default PipelineLogger;
