
/**
 * Speech Recognition Service
 * Handles the speech recognition functionality for the extension
 */
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStateChangeCallback = null;
    this.initialize();
  }

  /**
   * Initialize the speech recognition
   */
  initialize() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(transcript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        this.isListening = false;
        
        if (this.onErrorCallback) {
          this.onErrorCallback(event);
        }
        
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback(false);
        }
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback(false);
        }
      };
    } else {
      console.warn("Speech recognition is not supported in this browser");
    }
  }

  /**
   * Set callback for transcript updates
   * @param {Function} callback - Function to call with transcript
   */
  onTranscript(callback) {
    this.onTranscriptCallback = callback;
    return this;
  }

  /**
   * Set callback for errors
   * @param {Function} callback - Function to call on error
   */
  onError(callback) {
    this.onErrorCallback = callback;
    return this;
  }

  /**
   * Set callback for state changes
   * @param {Function} callback - Function to call when state changes
   */
  onStateChange(callback) {
    this.onStateChangeCallback = callback;
    return this;
  }

  /**
   * Start listening
   */
  start() {
    if (!this.recognition) {
      console.error("Speech recognition not initialized");
      return false;
    }

    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true);
      }
      return true;
    }
    return false;
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false);
      }
      return true;
    }
    return false;
  }

  /**
   * Toggle listening state
   */
  toggle() {
    return this.isListening ? this.stop() : this.start();
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported() {
    return 'webkitSpeechRecognition' in window;
  }

  /**
   * Get current listening state
   */
  getIsListening() {
    return this.isListening;
  }
}

export default SpeechRecognitionService;
