/**
 * Sarvam Speech-to-Text (STT) Service
 * Connects to Sarvam's Saaras STT API (POST https://api.sarvam.ai/speech-to-text).
 * Converts recorded microphone audio blobs into text transcriptions.
 */

export class SarvamSttService {
  constructor(config = {}) {
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env) 
      ? import.meta.env.VITE_SARVAM_API_KEY 
      : null;

    this.apiKey = config.apiKey || envKey || null;
    this.endpoint = config.endpoint || "https://api.sarvam.ai/speech-to-text";
    this.modelName = config.modelName || "saaras:v3";
  }

  isAvailable() {
    return Boolean(
      this.apiKey && 
      this.apiKey !== "your_sarvam_api_key_here" && 
      this.apiKey.trim().length > 0
    );
  }

  /**
   * Transcribes audio Blob to text using Sarvam STT API
   * @param {Blob} audioBlob Recorded WebM / WAV audio blob from microphone
   * @param {object} options { language_code, model }
   * @returns {Promise<{ transcript: string, language_code: string, raw: any }>}
   */
  async transcribeAudio(audioBlob, options = {}) {
    if (!this.isAvailable()) {
      throw new Error("SarvamSttService: VITE_SARVAM_API_KEY is not configured in .env file.");
    }

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error("SarvamSttService: Provided audio recording blob is empty.");
    }

    const formData = new FormData();

    // Determine clean MIME type (strip parameter options like ;codecs=opus)
    const rawMimeType = audioBlob.type || 'audio/webm';
    const cleanMimeType = rawMimeType.split(';')[0].trim() || 'audio/webm';

    let extension = 'webm';
    if (cleanMimeType.includes('wav')) extension = 'wav';
    else if (cleanMimeType.includes('mp3')) extension = 'mp3';
    else if (cleanMimeType.includes('mp4')) extension = 'm4a';

    const audioFile = new File([audioBlob], `speech_recording.${extension}`, { type: cleanMimeType });
    formData.append('file', audioFile);

    // Append model parameter
    const model = options.model || this.modelName;
    formData.append('model', model);

    // Optional language_code parameter ("unknown" for auto-detection)
    if (options.language_code) {
      formData.append('language_code', options.language_code);
    } else {
      formData.append('language_code', 'unknown');
    }

    const headers = {
      'api-subscription-key': this.apiKey
      // Note: Do NOT set Content-Type header when using FormData; fetch automatically sets boundary!
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Sarvam STT API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const transcript = data.transcript || data.text || '';

    return {
      transcript: transcript.trim(),
      language_code: data.language_code || options.language_code || 'unknown',
      raw: data
    };
  }
}

export default SarvamSttService;
