// CLI entry point for the RTO data-scraping pipeline.
//
//   node scraper/run.js                  # live run (appends new records)
//   node scraper/run.js --dry-run        # validate only, don't write
//   node scraper/run.js --source=wikipedia
import { runPipeline } from './pipeline.js';
import { DATASET_PATH } from './config.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyArg = args.find((a) => a.startsWith('--source='));
const onlySources = onlyArg ? onlyArg.split('=')[1] : null;

console.log('RTO Data Scraping Pipeline');
console.log(`Dataset : ${DATASET_PATH}`);
console.log(`Mode    : ${dryRun ? 'DRY RUN (no write)' : 'LIVE (append)'}`);
if (onlySources) console.log(`Sources : ${onlySources}`);
console.log('');

runPipeline({ dryRun, onlySources }).catch((err) => {
  console.error('\nPipeline aborted:', err);
  process.exit(1);
});
