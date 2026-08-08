/**
 * Refactored RAG (Retrieval-Augmented Generation) Engine Orchestrator
 * Coordinates document chunking, metadata indexing, TF-IDF retrieval, and prompt templates.
 */

import { createDocumentChunks } from './chunker.js';
import { TFIDFRetriever } from './retriever.js';
import { buildGroundedSystemPrompt } from './promptTemplates.js';

export class RAGEngine {
  constructor(rtoDatabase) {
    this.db = rtoDatabase;
    this.retriever = new TFIDFRetriever([]);
    this.chunks = [];
    this.buildIndex();
  }

  /**
   * Re-builds document chunk index from database
   */
  buildIndex() {
    this.chunks = createDocumentChunks(this.db);
    this.retriever.setChunks(this.chunks);
  }

  /**
   * Retrieve knowledge chunks matching query & context filters
   */
  retrieve(query, filters = {}, topK = 4) {
    return this.retriever.retrieve(query, filters, topK);
  }

  /**
   * Assembles a grounded system prompt for LLM generation
   */
  assemblePrompt(query, retrievedChunks, context = {}) {
    return buildGroundedSystemPrompt(query, retrievedChunks, context);
  }
}

export default RAGEngine;
