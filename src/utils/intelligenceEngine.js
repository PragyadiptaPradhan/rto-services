/**
 * Refactored Intelligence Layer for RTO Services AI
 * Coordinates language detection, RAG retrieval, provider-agnostic LLM response generation,
 * and hallucination/grounding validation.
 */

import { evaluateGrounding } from './hallucinationGuard.js';
import { LocalFallbackProvider } from './llm/localFallbackProvider.js';

// Simple language detector
export const detectLanguage = (query) => {
  if (!query) return 'en';
  const lowercase = query.toLowerCase();
  
  // Hindi script check
  if (/[\u0900-\u097F]/.test(query)) {
    return 'hi';
  }
  
  // Hinglish keywords check
  const hinglishKeywords = [
    'kaise', 'kya', 'chahiye', 'karna', 'hoga', 'banaye', 'banvana', 'kitna', 'kab', 'naam', 'gaadi', 'paisa', 'fees', 'paper', 'renew'
  ];
  
  if (hinglishKeywords.some(keyword => lowercase.includes(keyword))) {
    return 'hinglish';
  }
  
  return 'en';
};

// UI text translations
export const TRANSLATIONS = {
  hi: {
    disclaimer: "⚠️ यह एक मार्गदर्शक प्रोटोटाइप है, आधिकारिक आरटीओ अनुमोदन या कानूनी प्रणाली नहीं।",
    no_info: "क्षमा करें, मुझे इस प्रश्न के लिए आधिकारिक डेटाबेस में कोई जानकारी नहीं मिली। कृपया पुनः प्रयास करें या अन्य सेवाओं का चयन करें।",
    fees: "अनुमानित शुल्क",
    steps: "आवेदन के चरण",
    docs: "आवश्यक दस्तावेज",
    time: "अनुमानित समय",
    citations: "सत्यापित स्रोत संदर्भ"
  },
  hinglish: {
    disclaimer: "⚠️ Yeh ek guidance prototype hai, official RTO approval ya legal system nahi.",
    no_info: "Sorry, mujhe is sawal ke liye official database me koi jaankari nahi mili. Kripya fir se try karein ya dusri service select karein.",
    fees: "Estimated Fees",
    steps: "Application Steps",
    docs: "Zaroori Documents",
    time: "Estimated Time",
    citations: "Verified Sources Reference"
  },
  en: {
    disclaimer: "⚠️ This is a guidance prototype and not an official RTO approval, legal interpretation, or enforcement system.",
    no_info: "I'm sorry, I couldn't find relevant information in my official database. Please try another query or select a service manually.",
    fees: "Estimated Fees",
    steps: "Process Steps",
    docs: "Required Documents",
    time: "Estimated Processing Time",
    citations: "Verified Citations"
  }
};

export class IntelligenceEngine {
  constructor(ragEngine, llmProvider = null) {
    this.rag = ragEngine;
    // Default to LocalFallbackProvider if no LLM provider is configured
    this.llmProvider = llmProvider || new LocalFallbackProvider();
  }

  setLLMProvider(provider) {
    if (provider && typeof provider.generateResponse === 'function') {
      this.llmProvider = provider;
    }
  }

  /**
   * Generates a grounded response via RAG retrieval & LLM provider execution
   * @param {string} query User natural language query
   * @param {object} userContext { stateCode, vehicleType, applicantType, language }
   */
  async generateAsync(query, userContext = {}) {
    const lang = userContext.language || detectLanguage(query);
    const text = TRANSLATIONS[lang] || TRANSLATIONS.en;

    const filters = {
      state: userContext.stateCode,
      serviceId: userContext.serviceId,
      applicantType: userContext.applicantType
    };

    // 1. Retrieve knowledge chunks
    const retrievedChunks = this.rag.retrieve(query, filters, 4);
    const maxScore = retrievedChunks.length > 0 ? retrievedChunks[0].score : 0;
    const prompt = this.rag.assemblePrompt(query, retrievedChunks, userContext);

    // 2. Low-confidence fallback check
    if (retrievedChunks.length === 0 || maxScore < 0.1) {
      const fallbackProvider = new LocalFallbackProvider();
      const fallbackResult = await fallbackProvider.generateResponse({ query, chunks: [], language: lang, textTranslations: text });
      return {
        response: fallbackResult.response,
        retrievedChunks: [],
        confidence: 0,
        hallucinationCheck: { status: "FAILED", score: 0 },
        language: lang,
        prompt,
        providerUsed: fallbackProvider.name
      };
    }

    // 3. Generate response using active LLM provider
    let llmResult;
    try {
      llmResult = await this.llmProvider.generateResponse({
        query,
        chunks: retrievedChunks,
        prompt,
        userContext,
        language: lang,
        textTranslations: text
      });
    } catch (err) {
      console.warn(`[IntelligenceEngine] ${this.llmProvider.name} failed (${err.message}). Falling back to LocalFallbackProvider.`);
      const fallbackProvider = new LocalFallbackProvider();
      llmResult = await fallbackProvider.generateResponse({
        query,
        chunks: retrievedChunks,
        prompt,
        userContext,
        language: lang,
        textTranslations: text
      });
    }

    // 4. Evaluate Fact Grounding
    const hallucinationCheck = evaluateGrounding(llmResult.response, retrievedChunks);
    const confidence = Math.round(Math.min(maxScore * 40 + 20, 100));

    return {
      response: llmResult.response,
      retrievedChunks,
      confidence,
      hallucinationCheck,
      language: lang,
      prompt,
      providerUsed: this.llmProvider.name,
      modelUsed: llmResult.model || "default"
    };
  }

  /**
   * Synchronous generate method maintaining 100% backward compatibility for App.jsx
   */
  generate(query, userContext = {}) {
    const lang = userContext.language || detectLanguage(query);
    const text = TRANSLATIONS[lang] || TRANSLATIONS.en;

    const filters = {
      state: userContext.stateCode,
      serviceId: userContext.serviceId,
      applicantType: userContext.applicantType
    };

    const retrievedChunks = this.rag.retrieve(query, filters, 4);
    const maxScore = retrievedChunks.length > 0 ? retrievedChunks[0].score : 0;
    const prompt = this.rag.assemblePrompt(query, retrievedChunks, userContext);

    const fallbackProvider = new LocalFallbackProvider();
    
    if (retrievedChunks.length === 0 || maxScore < 0.1) {
      const fallbackResult = fallbackProvider.synthesizeFallback(query, lang, text);
      return {
        response: fallbackResult,
        retrievedChunks: [],
        confidence: 0,
        hallucinationCheck: { status: "FAILED", score: 0 },
        language: lang,
        prompt
      };
    }

    const response = fallbackProvider.synthesizeResponse(query, retrievedChunks, lang, text);
    const hallucinationCheck = evaluateGrounding(response, retrievedChunks);
    const confidence = Math.round(Math.min(maxScore * 40 + 20, 100));

    return {
      response,
      retrievedChunks,
      confidence,
      hallucinationCheck,
      language: lang,
      prompt
    };
  }
}

export default IntelligenceEngine;
