/**
 * Local Fallback Grounded Provider
 * Formats grounded responses directly from retrieved knowledge chunks
 * with zero external API dependencies.
 */

import BaseLLMProvider from './baseProvider';

export class LocalFallbackProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super("LocalFallbackProvider", config);
  }

  async generateResponse({ query, chunks, language = 'en', textTranslations, userContext = {} }) {
    const text = textTranslations;
    
    if (!chunks || chunks.length === 0) {
      return {
        response: this.synthesizeFallback(query, language, text),
        model: "LocalRuleSynthesizer"
      };
    }

    const response = this.synthesizeResponse(query, chunks, language, text, userContext);
    return {
      response,
      model: "LocalRuleSynthesizer"
    };
  }

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

  synthesizeResponse(query, chunks, lang, text) {
    let paragraphs = [];
    
    // Add disclaimer upfront
    paragraphs.push(`*${text.disclaimer}*`);

    // Check for specific chunks
    const descriptionChunk = chunks.find(c => c.type === 'description');
    const stepsChunk = chunks.find(c => c.type === 'steps');
    const stateChunk = chunks.find(c => c.type === 'state_details');
    const reqChunk = chunks.find(c => c.type === 'requirements');
    const faqChunks = chunks.filter(c => c.type === 'faq' || c.type === 'general_faq');

    // 1. Description Section
    if (descriptionChunk) {
      if (lang === 'hi') {
        paragraphs.push(`### विवरण:\n${descriptionChunk.content} [श्रौत: ${descriptionChunk.id}]`);
      } else if (lang === 'hinglish') {
        paragraphs.push(`### Details:\n${descriptionChunk.content} [Source: ${descriptionChunk.id}]`);
      } else {
        paragraphs.push(`### Service Overview:\n${descriptionChunk.content} [Source: ${descriptionChunk.id}]`);
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

    // 6. Time Estimate
    let estimatedTime = "7 - 15 working days";
    const q = query.toLowerCase();
    if (q.includes("license") || q.includes("licence")) {
      estimatedTime = "LL: Instant download upon passing. Permanent DL Smart Card: 7-15 days after passing driving test.";
    } else if (q.includes("transfer") || q.includes("ownership")) {
      estimatedTime = "15 - 30 working days depending on RTO verification.";
    }
    
    if (lang === 'hi') {
      paragraphs.push(`### ${text.time}:\n- लगभग ${estimatedTime}`);
    } else if (lang === 'hinglish') {
      paragraphs.push(`### ${text.time}:\n- Lagbhag ${estimatedTime}`);
    } else {
      paragraphs.push(`### ${text.time}:\n- Approximately ${estimatedTime}`);
    }

    // 7. References
    const citationList = chunks.map(c => `- **[${c.id}]** - ${c.title}`).join("\n");
    paragraphs.push(`### ${text.citations}:\n${citationList}`);

    return paragraphs.join("\n\n");
  }
}

export default LocalFallbackProvider;
