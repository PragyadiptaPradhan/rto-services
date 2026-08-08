// Modular Data Aggregator & Domain Helper Index for RTO Services AI
// Exports consolidated rtoDatabase for zero-breaking-change backwards compatibility
// alongside modular domain collections and O(1) query helper functions.

import metadata from './metadata.json' with { type: 'json' };
import drivingServices from './services/driving_licenses.json' with { type: 'json' };
import vehicleServices from './services/vehicle_registration.json' with { type: 'json' };
import drivingFaqs from './faqs/driving_faqs.json' with { type: 'json' };
import generalFaqs from './faqs/general_faqs.json' with { type: 'json' };
import statesConfig from './states/states_config.json' with { type: 'json' };

// Combined Services & FAQs Collections
export const allServices = [...drivingServices, ...vehicleServices];
export const allFaqs = [...drivingFaqs, ...generalFaqs];

// Fast O(1) Lookup Map for Services
export const servicesMap = allServices.reduce((acc, service) => {
  acc[service.id] = service;
  return acc;
}, {});

// Primary Consolidated Dataset Object (Matching rto_database.json structure)
export const rtoDatabase = {
  metadata,
  services: allServices,
  general_faqs: allFaqs
};

// Domain Helper Utilities
export function getServiceById(id) {
  return servicesMap[id] || null;
}

export function getServicesByCategory(category) {
  return allServices.filter(s => s.category.toLowerCase() === category.toLowerCase());
}

export function getFaqsByCategory(category) {
  return allFaqs.filter(f => f.category.toLowerCase() === category.toLowerCase());
}

export function getStatesConfig() {
  return statesConfig;
}

export {
  metadata,
  drivingServices,
  vehicleServices,
  drivingFaqs,
  generalFaqs,
  statesConfig
};

export default rtoDatabase;
