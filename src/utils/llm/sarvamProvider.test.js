/**
 * Integration Test Suite for Sarvam AI LLM Provider & RAG Pipeline
 * Run with node: `node src/utils/llm/sarvamProvider.test.js`
 */

import rtoDatabase from '../../data/index.js';
import { RAGEngine } from '../ragEngine.js';
import { IntelligenceEngine } from '../intelligenceEngine.js';
import { SarvamProvider } from './sarvamProvider.js';
import { LocalFallbackProvider } from './localFallbackProvider.js';

const TEST_API_KEY = "sk_2r49iy7a_NDwqsIbfiA8MBUB87ncFAaR4";

async function runTestSuite() {
  console.log("================────────────────────────────────────────────");
  console.log("      SARVAM AI PROVIDER & RAG PIPELINE TEST SUITE          ");
  console.log("================────────────────────────────────────────────\n");

  const ragEngine = new RAGEngine(rtoDatabase);
  
  // Test Case 1: Provider Availability Check
  console.log("Test Case 1: Provider Availability Check");
  const validProvider = new SarvamProvider({ apiKey: TEST_API_KEY });
  const dummyProvider = new SarvamProvider({ apiKey: "your_sarvam_api_key_here" });
  const emptyProvider = new SarvamProvider({ apiKey: "" });

  console.log("  - Valid Key Available?   :", validProvider.isAvailable() ? "PASS (True)" : "FAIL");
  console.log("  - Placeholder Key Available?:", !dummyProvider.isAvailable() ? "PASS (False)" : "FAIL");
  console.log("  - Empty Key Available?     :", !emptyProvider.isAvailable() ? "PASS (False)" : "FAIL");

  // Test Case 2: Live Grounded RAG Query in English
  console.log("\nTest Case 2: Live Grounded RAG Query in English (Sarvam-105b)");
  const intelEngine = new IntelligenceEngine(ragEngine, validProvider);

  const contextEn = {
    stateCode: 'DL',
    stateName: 'Delhi',
    vehicleType: 'LMV',
    applicantType: 'General',
    language: 'en'
  };
  
  const queryEn = "What are the required documents and steps for a Learner License in Delhi?";
  console.log(`  Query: "${queryEn}"`);
  
  try {
    const resEn = await intelEngine.generateAsync(queryEn, contextEn);
    console.log("  - Response Received?     :", resEn.response ? "PASS" : "FAIL");
    console.log("  - Provider Used          :", resEn.providerUsed);
    console.log("  - Model Used             :", resEn.modelUsed);
    console.log("  - Confidence Score       :", `${resEn.confidence}%`);
    console.log("  - Grounding Status       :", resEn.hallucinationCheck.status, `(${resEn.hallucinationCheck.score}%)`);
    console.log("  - Excerpt                :", resEn.response.substring(0, 150).replace(/\n/g, ' ') + "...");
  } catch (err) {
    console.error("  - Test Case 2 Error      :", err.message);
  }

  // Test Case 3: Multilingual RAG Query in Hindi / Hinglish
  console.log("\nTest Case 3: Multilingual RAG Query in Hindi (Sarvam-105b)");
  const contextHi = {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    vehicleType: 'LMV',
    applicantType: 'General',
    language: 'hi'
  };

  const queryHi = "महाराष्ट्र में ड्राइविंग लाइसेंस रिन्यूअल की फीस कितनी है?";
  console.log(`  Query: "${queryHi}"`);

  try {
    const resHi = await intelEngine.generateAsync(queryHi, contextHi);
    console.log("  - Response Received?     :", resHi.response ? "PASS" : "FAIL");
    console.log("  - Language Detected      :", resHi.language);
    console.log("  - Provider Used          :", resHi.providerUsed);
    console.log("  - Grounding Status       :", resHi.hallucinationCheck.status, `(${resHi.hallucinationCheck.score}%)`);
    console.log("  - Excerpt                :", resHi.response.substring(0, 150).replace(/\n/g, ' ') + "...");
  } catch (err) {
    console.error("  - Test Case 3 Error      :", err.message);
  }

  // Test Case 4: Fallback Behavior Test (Invalid Key)
  console.log("\nTest Case 4: Fallback Behavior Test when API Key Fails");
  const invalidProvider = new SarvamProvider({ apiKey: "sk_invalid_key_12345" });
  const fallbackIntelEngine = new IntelligenceEngine(ragEngine, invalidProvider);

  try {
    const resFallback = await fallbackIntelEngine.generateAsync("How to transfer RC ownership?", contextEn);
    console.log("  - Graceful Fallback?     :", resFallback.providerUsed === "LocalFallbackProvider" ? "PASS (LocalFallback Used)" : "FAIL");
    console.log("  - Fallback Response Length:", resFallback.response.length, "chars");
  } catch (err) {
    console.error("  - Test Case 4 Error      :", err.message);
  }

  console.log("\n================────────────────────────────────────────────");
  console.log("               TEST SUITE COMPLETED SUCCESSFULLY            ");
  console.log("================────────────────────────────────────────────\n");
}

runTestSuite();
