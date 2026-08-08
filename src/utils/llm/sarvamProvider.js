/**
 * Sarvam AI LLM Provider
 * Connects to Sarvam AI Chat Completion API (sarvam-105b model tuned for Indian languages).
 * Reads VITE_SARVAM_API_KEY from environment variables (.env file) or config.
 */

import BaseLLMProvider from './baseProvider.js';

export class SarvamProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super("SarvamProvider", config);
    
    // Pick up API key from constructor config or Vite environment variable
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env) 
      ? import.meta.env.VITE_SARVAM_API_KEY 
      : null;
      
    this.apiKey = config.apiKey || config.apiSubscriptionKey || envKey || null;
    this.baseURL = config.baseURL || "https://api.sarvam.ai/v1";
    this.modelName = config.modelName || "sarvam-105b";
  }

  /**
   * Check if Sarvam AI provider is properly configured with a valid API key
   * @returns {boolean}
   */
  isAvailable() {
    return Boolean(
      this.apiKey && 
      this.apiKey !== "your_sarvam_api_key_here" && 
      this.apiKey.trim().length > 0
    );
  }

  /**
   * Generates response from Sarvam AI Chat Completion API
   * @param {object} payload { prompt, query, chunks, userContext, language }
   * @returns {Promise<{ response: string, model: string, rawOutput: any }>}
   */
  async generateResponse({ prompt }) {
    if (!this.isAvailable()) {
      throw new Error("SarvamProvider: VITE_SARVAM_API_KEY is not configured in .env file.");
    }

    const endpoint = `${this.baseURL.replace(/\/$/, '')}/chat/completions`;
    
    const headers = {
      "Content-Type": "application/json",
      "api-subscription-key": this.apiKey
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { 
            role: "system", 
            content: "You are the Transport and RTO Services AI Assistant. Answer clearly and ground your answers accurately based on official transport guidelines and knowledge provided." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("Sarvam API returned empty completion text.");
    }

    return {
      response: generatedText,
      model: this.modelName,
      rawOutput: data
    };
  }
}

export default SarvamProvider;
