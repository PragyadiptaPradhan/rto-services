// Build utility to compile modular JSON files into canonical src/data/rto_database.json.
// Run via: `node src/data/build.js` or `npm run build:data`

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import metadata from './metadata.json' with { type: 'json' };
import drivingServices from './services/driving_licenses.json' with { type: 'json' };
import vehicleServices from './services/vehicle_registration.json' with { type: 'json' };
import drivingFaqs from './faqs/driving_faqs.json' with { type: 'json' };
import generalFaqs from './faqs/general_faqs.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, 'rto_database.json');

const compiledDatabase = {
  metadata,
  services: [...drivingServices, ...vehicleServices],
  general_faqs: [...drivingFaqs, ...generalFaqs]
};

fs.writeFileSync(outputPath, JSON.stringify(compiledDatabase, null, 2) + '\n', 'utf8');

console.log(`✔ Compiled modular dataset into ${outputPath}`);
console.log(`  - Total Services: ${compiledDatabase.services.length}`);
console.log(`  - Total General FAQs: ${compiledDatabase.general_faqs.length}`);
