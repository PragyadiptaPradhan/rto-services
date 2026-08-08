/**
 * Intelligence Layer for RTO Services AI
 * Simulates a grounded LLM processing queries using the RAG prompt,
 * handling multilingual translation (English, Hindi, Hinglish), time/fee estimations,
 * alternate service recommendations, and hallucination checks.
 */

// Simple language detector
const detectLanguage = (query) => {
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

// Mock translation data for UI / responses
const TRANSLATIONS = {
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
  constructor(ragEngine) {
    this.rag = ragEngine;
  }

  /**
   * Generates a grounded, styled response
   * @param {string} query User natural language query
   * @param {object} userContext { stateCode, vehicleType, applicantType, language }
   */
  generate(query, userContext = {}) {
    // 1. Detect language (or use userContext choice)
    const lang = userContext.language || detectLanguage(query);
    const text = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // 2. Retrieve chunks using filters from context
    const filters = {
      state: userContext.stateCode,
      serviceId: userContext.serviceId,
      applicantType: userContext.applicantType
    };
    
    const retrievedChunks = this.rag.retrieve(query, filters, 4);

    // 3. Hallucination Guard / Confidence Check
    const maxScore = retrievedChunks.length > 0 ? retrievedChunks[0].score : 0;
    
    // Fallback if relevance is too low or no chunks match
    if (retrievedChunks.length === 0 || maxScore < 0.1) {
      const response = this.synthesizeFallback(query, lang, text);
      return {
        response,
        retrievedChunks: [],
        confidence: 0,
        hallucinationCheck: { status: "FAILED", score: 0 },
        language: lang,
        prompt: this.rag.assemblePrompt(query, [], userContext)
      };
    }

    // 4. Synthesize response based on retrieved chunks and language
    const response = this.synthesizeResponse(query, retrievedChunks, lang, text, userContext);

    // 5. Calculate Hallucination Guard details
    // Ensure response terms map back to retrieved chunks
    const responseTokens = new Set(response.toLowerCase().split(/\s+/));
    const chunkTokens = new Set(retrievedChunks.map(c => c.content.toLowerCase()).join(" ").split(/\s+/));
    
    let matchedWords = 0;
    let totalImportantWords = 0;
    
    responseTokens.forEach(word => {
      if (word.length > 4) { // check only significant words
        totalImportantWords++;
        if (chunkTokens.has(word)) matchedWords++;
      }
    });

    const groundingRatio = totalImportantWords > 0 ? (matchedWords / totalImportantWords) : 1;
    const hallucinationStatus = groundingRatio > 0.7 ? "PASSED" : "WARNING";

    // 6. Generate the simulated system prompt for the developer view
    const prompt = this.rag.assemblePrompt(query, retrievedChunks, userContext);

    return {
      response,
      retrievedChunks,
      confidence: Math.round(Math.min(maxScore * 40 + 20, 100)), // Scale score to 0-100%
      hallucinationCheck: {
        status: hallucinationStatus,
        score: Math.round(groundingRatio * 100)
      },
      language: lang,
      prompt
    };
  }

  // Generate fallback suggestions when info is missing
  synthesizeFallback(query, lang, text) {
    let suggestions = "";
    if (lang === 'hi') {
      suggestions = `\n\n**सुझाव:**
- यदि आप Learner's License के बारे में जानना चाहते हैं, तो "LL" या "लाइसेंस" लिखें।
- वाहन ट्रांसफर के लिए "ownership transfer" या "RC transfer" लिखें।
- ट्रैफिक चालान के लिए "challan" या "Lok Adalat" लिखें।`;
    } else if (lang === 'hinglish') {
      suggestions = `\n\n**Suggestions:**
- Agar aap Learner's License ke baare me janna chahte hain, toh "LL" ya "license" likhein.
- Vehicle transfer ke liye "ownership transfer" ya "RC transfer" likhein.
- Traffic challan ke liye "challan" ya "Lok Adalat" likhein.`;
    } else {
      suggestions = `\n\n**Suggestions:**
- For Learner's License guidance, type "Learner's License" or "LL".
- For Transfer of Vehicle Ownership, type "ownership transfer" or "RC transfer".
- For Traffic Challans, type "e-challan" or "Lok Adalat".`;
    }

    return `${text.no_info}${suggestions}\n\n*${text.disclaimer}*`;
  }

  // Synthesize answer combining chunks
  synthesizeResponse(query, chunks, lang, text, context) {
    let paragraphs = [];
    
    // Add disclaimer upfront
    paragraphs.push(`*${text.disclaimer}*`);

    // Check if we have specific chunks
    const descriptionChunk = chunks.find(c => c.type === 'description');
    const stepsChunk = chunks.find(c => c.type === 'steps');
    const stateChunk = chunks.find(c => c.type === 'state_details');
    const reqChunk = chunks.find(c => c.type === 'requirements');
    const faqChunks = chunks.filter(c => c.type === 'faq' || c.type === 'general_faq');

    // 1. Description Section
    if (descriptionChunk) {
      if (lang === 'hi') {
        paragraphs.push(`### विवरण:
${descriptionChunk.content} [श्रौत: ${descriptionChunk.id}]`);
      } else if (lang === 'hinglish') {
        paragraphs.push(`### Details:
${descriptionChunk.content} [Source: ${descriptionChunk.id}]`);
      } else {
        paragraphs.push(`### Service Overview:
${descriptionChunk.content} [Source: ${descriptionChunk.id}]`);
      }
    }

    // 2. State specific details
    if (stateChunk) {
      if (lang === 'hi') {
        paragraphs.push(`### राज्य-विशिष्ट जानकारी (${stateChunk.metadata.state}):
- **शुल्क विवरण:** ${stateChunk.content.match(/Fee Structure: (.*)/)?.[1] || "आरटीओ पोर्टल पर देखें"}
- **परीक्षण का तरीका:** ${stateChunk.content.match(/Test Format: (.*)/)?.[1] || "आरटीओ में उपस्थित होना होगा"}
- **विशेष निर्देश:** ${stateChunk.content.match(/State-Specific Notes: (.*)/)?.[1] || "कोई नहीं"} [स्रोत: ${stateChunk.id}]`);
      } else if (lang === 'hinglish') {
        paragraphs.push(`### State-Specific Info (${stateChunk.metadata.state}):
- **Fees Structure:** ${stateChunk.content.match(/Fee Structure: (.*)/)?.[1] || "Check online on RTO portal"}
- **Test Format:** ${stateChunk.content.match(/Test Format: (.*)/)?.[1] || "RTO visit required"}
- **Special Instruction:** ${stateChunk.content.match(/State-Specific Notes: (.*)/)?.[1] || "None"} [Source: ${stateChunk.id}]`);
      } else {
        paragraphs.push(`### State-Specific Information (${stateChunk.metadata.state}):
- **Fee Breakdown:** ${stateChunk.content.match(/Fee Structure: (.*)/)?.[1] || "Refer to transport portal"}
- **Testing Standard:** ${stateChunk.content.match(/Test Format: (.*)/)?.[1] || "Standard computer test"}
- **Important Note:** ${stateChunk.content.match(/State-Specific Notes: (.*)/)?.[1] || "None"} [Source: ${stateChunk.id}]`);
      }
    }

    // 3. Document Requirements
    if (reqChunk) {
      paragraphs.push(`### ${text.docs} (${reqChunk.metadata.applicantType || "General"} Category):
${reqChunk.content.split('Required Documents:')[1]?.trim() || reqChunk.content} [Source: ${reqChunk.id}]`);
    }

    // 4. Process Steps
    if (stepsChunk) {
      paragraphs.push(`### ${text.steps}:
${stepsChunk.content.split('Application steps to apply for')[1]?.split('\n').slice(1).join('\n') || stepsChunk.content} [Source: ${stepsChunk.id}]`);
    }

    // 5. Frequently Asked Questions
    if (faqChunks.length > 0) {
      const faqList = faqChunks.map(f => {
        const question = f.content.match(/Question: (.*)/)?.[1] || f.title;
        const answer = f.content.match(/Answer: (.*)/)?.[1] || f.content;
        return `**Q: ${question}**\n*A: ${answer}* [Source: ${f.id}]`;
      }).join("\n\n");
      
      paragraphs.push(`### Frequently Asked Questions:\n${faqList}`);
    }

    // 6. Time Estimate if available
    let estimatedTime = "7 - 15 working days";
    if (query.toLowerCase().includes("license") || query.toLowerCase().includes("licence")) {
      estimatedTime = "LL: Instant download upon passing. Permanent DL Smart Card: 7-15 days after passing driving test.";
    } else if (query.toLowerCase().includes("transfer") || query.toLowerCase().includes("ownership")) {
      estimatedTime = "15 - 30 working days depending on RTO verification.";
    }
    
    if (lang === 'hi') {
      paragraphs.push(`### ${text.time}:
- लगभग ${estimatedTime}`);
    } else if (lang === 'hinglish') {
      paragraphs.push(`### ${text.time}:
- Lagbhag ${estimatedTime}`);
    } else {
      paragraphs.push(`### ${text.time}:
- Approximately ${estimatedTime}`);
    }

    // 7. References section
    const citationList = chunks.map(c => `- **[${c.id}]** - ${c.title}`).join("\n");
    paragraphs.push(`### ${text.citations}:\n${citationList}`);

    return paragraphs.join("\n\n");
  }
}
