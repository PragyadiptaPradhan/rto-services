import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'rto_database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Directories
const dirs = [
  path.resolve(__dirname, 'services'),
  path.resolve(__dirname, 'states'),
  path.resolve(__dirname, 'faqs')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// 1. Save metadata.json
const metadataPath = path.resolve(__dirname, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(db.metadata, null, 2) + '\n', 'utf8');

// 2. Save states_config.json
const statesConfig = {
  states_supported: db.metadata.states_supported,
  states: {
    DL: { code: "DL", name: "Delhi", region: "North", capital: "New Delhi", portal: "https://transport.delhi.gov.in" },
    MH: { code: "MH", name: "Maharashtra", region: "West", capital: "Mumbai", portal: "https://transport.maharashtra.gov.in" },
    KA: { code: "KA", name: "Karnataka", region: "South", capital: "Bengaluru", portal: "https://transport.karnataka.gov.in" },
    UP: { code: "UP", name: "Uttar Pradesh", region: "North", capital: "Lucknow", portal: "https://uptransport.upsdc.gov.in" },
    TN: { code: "TN", name: "Tamil Nadu", region: "South", capital: "Chennai", portal: "https://tnsta.gov.in" },
    TS: { code: "TS", name: "Telangana", region: "South", capital: "Hyderabad", portal: "https://transport.telangana.gov.in" },
    GJ: { code: "GJ", name: "Gujarat", region: "West", capital: "Gandhinagar", portal: "https://portals.gujarat.gov.in/transport" }
  }
};
fs.writeFileSync(path.resolve(__dirname, 'states', 'states_config.json'), JSON.stringify(statesConfig, null, 2) + '\n', 'utf8');

// 3. Separate Services by category/domain
const drivingServices = db.services.filter(s => 
  s.category === "Driving License Services" || s.id.includes("dl") || s.id.includes("license") || s.id === "international_driving_permit"
);

const vehicleServices = db.services.filter(s => 
  !drivingServices.some(ds => ds.id === s.id)
);

fs.writeFileSync(path.resolve(__dirname, 'services', 'driving_licenses.json'), JSON.stringify(drivingServices, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.resolve(__dirname, 'services', 'vehicle_registration.json'), JSON.stringify(vehicleServices, null, 2) + '\n', 'utf8');

// 4. Separate FAQs by domain
const drivingFaqCategories = new Set(["Driving Licence", "Learner's Licence", "International Driving Permit", "Driving License Services"]);

const drivingFaqs = db.general_faqs.filter(f => drivingFaqCategories.has(f.category));
const generalFaqs = db.general_faqs.filter(f => !drivingFaqCategories.has(f.category));

fs.writeFileSync(path.resolve(__dirname, 'faqs', 'driving_faqs.json'), JSON.stringify(drivingFaqs, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.resolve(__dirname, 'faqs', 'general_faqs.json'), JSON.stringify(generalFaqs, null, 2) + '\n', 'utf8');

console.log(`✔ Successfully generated modular dataset files in src/data/!`);
console.log(`  - metadata.json`);
console.log(`  - states/states_config.json`);
console.log(`  - services/driving_licenses.json (${drivingServices.length} services)`);
console.log(`  - services/vehicle_registration.json (${vehicleServices.length} services)`);
console.log(`  - faqs/driving_faqs.json (${drivingFaqs.length} FAQs)`);
console.log(`  - faqs/general_faqs.json (${generalFaqs.length} FAQs)`);
