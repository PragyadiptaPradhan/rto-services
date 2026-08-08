/**
 * Base Abstract LLM Provider
 * Defines standard interface for grounded response generation.
 */

export class BaseLLMProvider {
  constructor(name = "BaseProvider", config = {}) {
    this.name = name;
    this.config = config;
  }

  /**
   * Primary interface for generating responses
   * @param {object} payload { query, chunks, prompt, context, language, textTranslations }
   * @returns {Promise<{ response: string, rawOutput?: any, model?: string }>}
   */
  async generateResponse(/* payload */) {
    throw new Error(`generateResponse() not implemented on ${this.name}`);
  }

  isAvailable() {
    return true;
  }
}

export default BaseLLMProvider;
