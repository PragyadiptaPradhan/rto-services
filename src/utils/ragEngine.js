/**
 * RAG (Retrieval-Augmented Generation) Engine for RTO Services
 * Handles database chunking, indexing, retrieval (TF-IDF keyword matching),
 * and prompt structuring.
 */

// Helper to sanitize and tokenize text for vector indexing
const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2); // filter out short stop-words
};

// Simple stop-word list
const STOP_WORDS = new Set([
  'the', 'is', 'are', 'and', 'but', 'for', 'you', 'your', 'with', 'this', 'that', 'from',
  'how', 'what', 'who', 'where', 'why', 'can', 'should', 'will', 'would', 'does', 'did',
  'about', 'fees', 'cost', 'steps', 'process', 'documents', 'required', 'need'
]);

// Calculate Jaccard similarity & term overlap
const calculateScore = (queryTokens, chunkTokens, chunkTitleTokens = []) => {
  if (queryTokens.length === 0) return 0;
  
  const querySet = new Set(queryTokens);
  const chunkSet = new Set(chunkTokens);
  const titleSet = new Set(chunkTitleTokens);

  let matchCount = 0;
  let titleMatchCount = 0;

  querySet.forEach(word => {
    if (!STOP_WORDS.has(word)) {
      if (chunkSet.has(word)) matchCount++;
      if (titleSet.has(word)) titleMatchCount++;
    }
  });

  // Weighted score: higher weight for matching words in the title
  const termOverlap = matchCount / Math.max(querySet.size, 1);
  const titleOverlap = titleMatchCount / Math.max(querySet.size, 1);

  return (termOverlap * 0.7) + (titleOverlap * 1.5);
};

export class RAGEngine {
  constructor(rtoDatabase) {
    this.db = rtoDatabase;
    this.chunks = [];
    this.buildIndex();
  }

  // Segment database into metadata-tagged search chunks
  buildIndex() {
    this.chunks = [];

    // Index services
    this.db.services.forEach(service => {
      // 1. Service Description Chunk
      this.chunks.push({
        id: `${service.id}_desc`,
        serviceId: service.id,
        type: "description",
        title: `${service.name} - General Description`,
        content: `${service.description} Prerequisites: ${service.prerequisites}`,
        metadata: { state: "ALL", category: service.category }
      });

      // 2. Common Steps Chunk
      this.chunks.push({
        id: `${service.id}_steps`,
        serviceId: service.id,
        type: "steps",
        title: `${service.name} - Application Steps`,
        content: `Application steps to apply for ${service.name}: \n` + 
          service.common_steps.map((step, i) => `${i + 1}. ${step}`).join("\n"),
        metadata: { state: "ALL", category: service.category }
      });

      // 3. State Variations Chunks
      Object.entries(service.state_variations).forEach(([stateCode, details]) => {
        this.chunks.push({
          id: `${service.id}_state_${stateCode}`,
          serviceId: service.id,
          type: "state_details",
          title: `${service.name} in ${details.state_name} (${stateCode})`,
          content: `State: ${details.state_name} (${stateCode}). Contactless Service: ${details.contactless ? 'Yes' : 'No'}.\n` +
            `Fee Structure: ${details.fee_breakdown}.\n` +
            `Test Format: ${details.test_format}.\n` +
            `State-Specific Notes: ${details.special_note}`,
          metadata: { state: stateCode, category: service.category }
        });
      });

      // 4. Applicant Requirements Chunks
      Object.entries(service.applicant_requirements).forEach(([category, reqs]) => {
        this.chunks.push({
          id: `${service.id}_req_${category}`,
          serviceId: service.id,
          type: "requirements",
          title: `${service.name} - ${category} Category Requirements`,
          content: `Applicant Category: ${category}.\n` +
            `Required Documents:\n` + reqs.documents.map(d => `- ${d}`).join("\n") +
            `\nSpecial Guidance: ${reqs.additional_notes}`,
          metadata: { state: "ALL", category: service.category, applicantType: category }
        });
      });

      // 5. Service FAQs
      service.faqs.forEach((faq, i) => {
        this.chunks.push({
          id: `${service.id}_faq_${i}`,
          serviceId: service.id,
          type: "faq",
          title: `FAQ: ${faq.question}`,
          content: `Question: ${faq.question}\nAnswer: ${faq.answer}`,
          metadata: { state: "ALL", category: service.category }
        });
      });
    });

    // 6. Index General FAQs
    this.db.general_faqs.forEach((faq, i) => {
      this.chunks.push({
        id: `general_faq_${i}`,
        serviceId: "general",
        type: "general_faq",
        title: `${faq.category} FAQ: ${faq.question}`,
        content: `Question: ${faq.question}\nAnswer: ${faq.answer}`,
        metadata: { state: "ALL", category: faq.category }
      });
    });
  }

  /**
   * Retrieve chunks matching query with option-based filters
   * @param {string} query User prompt query
   * @param {object} filters { state, serviceId, applicantType }
   * @param {number} topK Number of results to return
   */
  retrieve(query, filters = {}, topK = 4) {
    const queryTokens = tokenize(query);
    
    // Score each chunk
    const scoredChunks = this.chunks.map(chunk => {
      let score = calculateScore(
        queryTokens, 
        tokenize(chunk.content), 
        tokenize(chunk.title)
      );

      // --- Meta-Filtering & Boosting ---
      // Boost chunk if it matches the current filtered service
      if (filters.serviceId && chunk.serviceId === filters.serviceId) {
        score += 1.5;
      }
      
      // Boost chunk if it matches the current filtered state (or is ALL-state)
      if (filters.state) {
        if (chunk.metadata.state === filters.state) {
          score += 1.2;
        } else if (chunk.metadata.state !== "ALL" && chunk.metadata.state !== filters.state) {
          // Penalize chunk from a different state
          score -= 2.0;
        }
      }

      // Boost chunk if it matches the current applicant type
      if (filters.applicantType && chunk.metadata.applicantType === filters.applicantType) {
        score += 1.0;
      }

      return { ...chunk, score };
    });

    // Filter out chunks with score <= 0 (unless we need matches and everything is 0, but it keeps context grounded)
    const validMatches = scoredChunks
      .filter(chunk => chunk.score > 0.05)
      .sort((a, b) => b.score - a.score);

    return validMatches.slice(0, topK);
  }

  /**
   * Assembles a grounded prompt for the LLM
   */
  assemblePrompt(query, retrievedChunks, context = {}) {
    const contextLines = retrievedChunks.map((c, i) => {
      return `[Source ID: ${c.id}] (Title: ${c.title})\n${c.content}\n`;
    }).join("\n---\n");

    return `SYSTEM: You are the Transport and RTO Services AI Assistant. Your role is to provide accurate, step-by-step guidance on RTO applications, documents, and compliance based ONLY on the verified context provided below.
Rules:
- Be clear, structured, and helpful. Use markdown.
- Ground all facts in the provided Context.
- Cite the Source ID (e.g. [learners_license_desc]) when mentioning facts.
- If the details are not present in the Context, explain that you do not have that specific information and offer to guide them through other services.
- Always include a standard warning that you are a guidance prototype, not an official administrator or authority.

Context:
${contextLines || "No official RTO documents matching this query were found in the database."}

User State: ${context.stateName || "Not Specified"} (${context.stateCode || "N/A"})
User Vehicle Class: ${context.vehicleType || "Not Specified"}
User Category: ${context.applicantType || "General"}

User Query: ${query}
`;
  }
}
