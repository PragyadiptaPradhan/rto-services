/**
 * Browser Audio Recorder Utility
 * Uses MediaRecorder API & getUserMedia to record microphone input.
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.recordingStartTime = 0;
  }

  /**
   * Checks if browser supports microphone audio recording
   */
  isSupported() {
    return Boolean(
      typeof window !== 'undefined' &&
      window.navigator &&
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }

  /**
   * Request microphone permission and start recording
   */
  async start() {
    if (!this.isSupported()) {
      throw new Error("Audio recording is not supported in this browser environment.");
    }

    try {
      this.stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.recordingStartTime = Date.now();
      this.mediaRecorder.start(100); // collect 100ms chunks
      return true;
    } catch (err) {
      this.cleanup();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error("Microphone permission denied. Please allow microphone access in your browser settings.");
      }
      throw new Error(`Microphone initialization failed: ${err.message}`);
    }
  }

  /**
   * Stop recording and resolve with Audio Blob
   * @returns {Promise<Blob>}
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error("No active audio recording found."));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const rawMimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const cleanMimeType = rawMimeType.split(';')[0].trim() || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: cleanMimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  /**
   * Stop media tracks and reset state
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording() {
    return Boolean(this.mediaRecorder && this.mediaRecorder.state === 'recording');
  }

  getRecordingDuration() {
    if (!this.recordingStartTime) return 0;
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }
}

export default AudioRecorder;
