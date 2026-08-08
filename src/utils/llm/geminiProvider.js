/**
 * Optional Google Gemini API LLM Provider
 * Connects to Google Gemini API when apiKey is provided in config.
 */

import BaseLLMProvider from './baseProvider.js';

export class GeminiProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super("GeminiProvider", config);
    this.apiKey = config.apiKey || null;
    this.modelName = config.modelName || "gemini-1.5-flash";
  }

  isAvailable() {
    return Boolean(this.apiKey);
  }

  async generateResponse({ prompt }) {
    if (!this.apiKey) {
      throw new Error("GeminiProvider: apiKey is not configured.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Low temperature for high factual precision
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Gemini API returned an empty response.");
    }

    return {
      response: generatedText,
      model: this.modelName,
      rawOutput: data
    };
  }
}

export default GeminiProvider;
