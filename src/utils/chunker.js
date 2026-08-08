/**
 * Document Chunker Module for RTO Services Database
 * Segments raw services and FAQs into metadata-tagged search chunks.
 */

export function createDocumentChunks(rtoDatabase) {
  const chunks = [];
  if (!rtoDatabase) return chunks;

  // 1. Index Services
  if (Array.isArray(rtoDatabase.services)) {
    rtoDatabase.services.forEach(service => {
      // Description Chunk
      chunks.push({
        id: `${service.id}_desc`,
        serviceId: service.id,
        type: "description",
        title: `${service.name} - General Description`,
        content: `${service.description} Prerequisites: ${service.prerequisites}`,
        metadata: { state: "ALL", category: service.category }
      });

      // Common Steps Chunk
      if (Array.isArray(service.common_steps)) {
        chunks.push({
          id: `${service.id}_steps`,
          serviceId: service.id,
          type: "steps",
          title: `${service.name} - Application Steps`,
          content: `Application steps to apply for ${service.name}: \n` + 
            service.common_steps.map((step, i) => `${i + 1}. ${step}`).join("\n"),
          metadata: { state: "ALL", category: service.category }
        });
      }

      // State Variations Chunks
      if (service.state_variations && typeof service.state_variations === 'object') {
        Object.entries(service.state_variations).forEach(([stateCode, details]) => {
          chunks.push({
            id: `${service.id}_state_${stateCode}`,
            serviceId: service.id,
            type: "state_details",
            title: `${service.name} in ${details.state_name || stateCode} (${stateCode})`,
            content: `State: ${details.state_name || stateCode} (${stateCode}). Contactless Service: ${details.contactless ? 'Yes' : 'No'}.\n` +
              `Fee Structure: ${details.fee_breakdown}.\n` +
              `Test Format: ${details.test_format}.\n` +
              `State-Specific Notes: ${details.special_note}`,
            metadata: { state: stateCode, category: service.category }
          });
        });
      }

      // Applicant Requirements Chunks
      if (service.applicant_requirements && typeof service.applicant_requirements === 'object') {
        Object.entries(service.applicant_requirements).forEach(([category, reqs]) => {
          const docList = Array.isArray(reqs.documents) ? reqs.documents.map(d => `- ${d}`).join("\n") : "";
          chunks.push({
            id: `${service.id}_req_${category}`,
            serviceId: service.id,
            type: "requirements",
            title: `${service.name} - ${category} Category Requirements`,
            content: `Applicant Category: ${category}.\n` +
              `Required Documents:\n${docList}\n` +
              `Special Guidance: ${reqs.additional_notes || ""}`,
            metadata: { state: "ALL", category: service.category, applicantType: category }
          });
        });
      }

      // Service FAQs
      if (Array.isArray(service.faqs)) {
        service.faqs.forEach((faq, i) => {
          chunks.push({
            id: `${service.id}_faq_${i}`,
            serviceId: service.id,
            type: "faq",
            title: `FAQ: ${faq.question}`,
            content: `Question: ${faq.question}\nAnswer: ${faq.answer}`,
            metadata: { state: "ALL", category: service.category }
          });
        });
      }
    });
  }

  // 2. Index General FAQs
  if (Array.isArray(rtoDatabase.general_faqs)) {
    rtoDatabase.general_faqs.forEach((faq, i) => {
      chunks.push({
        id: `general_faq_${i}`,
        serviceId: "general",
        type: "general_faq",
        title: `${faq.category} FAQ: ${faq.question}`,
        content: `Question: ${faq.question}\nAnswer: ${faq.answer}`,
        metadata: { state: "ALL", category: faq.category }
      });
    });
  }

  return chunks;
}

export default createDocumentChunks;
