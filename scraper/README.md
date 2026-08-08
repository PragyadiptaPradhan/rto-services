# RTO Data Scraping Pipeline

A modular, reusable data-collection pipeline that expands the project's
`src/data/rto_database.json` knowledge base with reliably-sourced, schema-valid
records. It is fully decoupled from the React app (lives in its own `scraper/`
folder) and adds **zero** npm dependencies.

## What it does

1. Loads the existing `rto_database.json` and validates its structure.
2. Runs each enabled **source adapter** (pluggable — see below).
3. For every scraped record: **normalises → validates → dedupes** against the
   existing dataset.
4. Appends only new, valid, non-duplicate records (preserving everything else).
5. Persists the expanded dataset back to the same file/format.
6. Logs requests (ok/failed), skipped/invalid records, duplicates, and the
   total newly collected count.

## Usage

```bash
npm run scrape          # live run — appends new records to the dataset
npm run scrape:dry      # dry run — validates + reports, writes nothing
node scraper/run.js --source=wikipedia          # run a single source
node scraper/run.js --source=wikipedia --dry-run
```

## Configuration

All knobs live in `config.js`:

- `requestDelayMs`, `maxRetries`, `retryBackoffMs`, `requestTimeoutMs` — politeness / resilience.
- `maxRecordsPerSource` — quality cap so one source can't bloat the dataset.
- `ignoredSections` — Wikipedia headings that should never become FAQ answers.
- `enabledSources` — ordered list of source keys to execute.

## Current sources

| Key           | Adapter            | Output target  | Notes                                  |
|---------------|--------------------|----------------|----------------------------------------|
| `wikipedia`   | `WikipediaSource`  | `general_faqs` | English Wikipedia, CC-licensed, no key |
| `wikipedia-hi`| `WikipediaSource`  | `general_faqs` | Hindi Wikipedia (multilingual support) |

Each Wikipedia article is split into sections; every meaningful section
becomes one `{ category, question, answer }` FAQ record. The answer is the
cleaned section text (sourced verbatim from Wikipedia); the question is
generated from the section heading.

## Adding a new source (extensibility)

1. Create `scraper/sources/<yoursource>.js` exporting a class that extends
   `SourceAdapter` (from `./base.js`) and implements
   `async fetchRecords(logger)` returning an array of raw records.
2. Use the shared `fetchWithRetry(this, url, logger)` helper for HTTP (it
   already does retries + timeouts). Add `await sleep(ms)` between requests to
   respect rate limits.
3. Register the class in `buildSources()` in `pipeline.js` under a new key.
4. Add that key to `enabledSources` in `config.js`.

No other code changes are required — the orchestrator loop is source-agnostic
and routes each source to its declared `target` array (`general_faqs` or
`services`).

### Example: a real government / Parivahan adapter

A future `ParivahanSource` would implement the same `SourceAdapter` contract.
Note that official RTO portals typically require anti-bot handling (headers,
sessions, or an official/open API) and per-state fee structures; such a source
should produce **`services`** records (the rigid
`state_variations` / `applicant_requirements` schema) only when it can source
accurate, structured data — never to fabricate fee figures.

## Schema guarantees

- Appended `general_faqs` records contain exactly `{ category, question, answer }`
  (string fields), matching the existing file exactly.
- `schema.js` enforces minimum content lengths so malformed scrapes are dropped.
- `dedupe.js` hashes normalised records so existing and intra-run duplicates are
  never written twice.
- The dataset is only written after all validation passes; if the existing file
  fails structural validation the pipeline aborts without modifying it.
