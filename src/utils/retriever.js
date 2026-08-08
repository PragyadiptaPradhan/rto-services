/**
 * TF-IDF Keyword Retriever Strategy for RTO Services
 * Handles tokenization, Jaccard similarity scoring, title weighting, and metadata boosting.
 */

export const STOP_WORDS = new Set([
  'the', 'is', 'are', 'and', 'but', 'for', 'you', 'your', 'with', 'this', 'that', 'from',
  'how', 'what', 'who', 'where', 'why', 'can', 'should', 'will', 'would', 'does', 'did',
  'about', 'fees', 'cost', 'steps', 'process', 'documents', 'required', 'need'
]);

export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

export function calculateJaccardScore(queryTokens, chunkTokens, chunkTitleTokens = []) {
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

  const termOverlap = matchCount / Math.max(querySet.size, 1);
  const titleOverlap = titleMatchCount / Math.max(querySet.size, 1);

  return (termOverlap * 0.7) + (titleOverlap * 1.5);
}

export class TFIDFRetriever {
  constructor(chunks = []) {
    this.chunks = chunks;
  }

  setChunks(chunks) {
    this.chunks = chunks;
  }

  /**
   * Retrieve ranked knowledge chunks matching query & metadata filters
   */
  retrieve(query, filters = {}, topK = 4) {
    const queryTokens = tokenize(query);
    
    const scoredChunks = this.chunks.map(chunk => {
      let score = calculateJaccardScore(
        queryTokens, 
        tokenize(chunk.content), 
        tokenize(chunk.title)
      );

      // Meta-Filtering & Boosting
      if (filters.serviceId && chunk.serviceId === filters.serviceId) {
        score += 1.5;
      }
      
      if (filters.state) {
        if (chunk.metadata.state === filters.state) {
          score += 1.2;
        } else if (chunk.metadata.state !== "ALL" && chunk.metadata.state !== filters.state) {
          score -= 2.0;
        }
      }

      if (filters.applicantType && chunk.metadata.applicantType === filters.applicantType) {
        score += 1.0;
      }

      return { ...chunk, score };
    });

    const validMatches = scoredChunks
      .filter(chunk => chunk.score > 0.05)
      .sort((a, b) => b.score - a.score);

    return validMatches.slice(0, topK);
  }
}

export default TFIDFRetriever;
