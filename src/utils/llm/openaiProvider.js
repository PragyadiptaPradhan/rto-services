/**
 * Optional OpenAI / Custom OpenAI-Compatible LLM Provider
 * Connects to OpenAI or local Ollama / VLLM endpoint when configured.
 */

import BaseLLMProvider from './baseProvider.js';

export class OpenAIProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super("OpenAIProvider", config);
    this.apiKey = config.apiKey || null;
    this.baseURL = config.baseURL || "https://api.openai.com/v1";
    this.modelName = config.modelName || "gpt-4o-mini";
  }

  isAvailable() {
    return Boolean(this.apiKey || this.config.isLocalOllama);
  }

  async generateResponse({ prompt }) {
    const endpoint = `${this.baseURL.replace(/\/$/, '')}/chat/completions`;
    const headers = {
      "Content-Type": "application/json"
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: "You are the Transport and RTO Services AI Assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("OpenAI API returned empty completion text.");
    }

    return {
      response: generatedText,
      model: this.modelName,
      rawOutput: data
    };
  }
}

export default OpenAIProvider;
