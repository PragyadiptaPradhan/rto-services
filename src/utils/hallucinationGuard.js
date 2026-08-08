/**
 * Hallucination Guard & Fact Grounding Evaluator
 * Compares synthesized text against raw retrieved source chunks to compute grounding ratio.
 */

export function evaluateGrounding(response, retrievedChunks = []) {
  if (!response || retrievedChunks.length === 0) {
    return {
      status: "FAILED",
      score: 0,
      groundingRatio: 0
    };
  }

  const responseTokens = new Set(response.toLowerCase().split(/\s+/));
  const chunkTokens = new Set(retrievedChunks.map(c => c.content.toLowerCase()).join(" ").split(/\s+/));
  
  let matchedWords = 0;
  let totalImportantWords = 0;
  
  responseTokens.forEach(word => {
    if (word.length > 4) { // Significant terms
      totalImportantWords++;
      if (chunkTokens.has(word)) matchedWords++;
    }
  });

  const groundingRatio = totalImportantWords > 0 ? (matchedWords / totalImportantWords) : 1;
  const score = Math.round(groundingRatio * 100);
  const status = groundingRatio > 0.7 ? "PASSED" : "WARNING";

  return {
    status,
    score,
    groundingRatio
  };
}

export default evaluateGrounding;
