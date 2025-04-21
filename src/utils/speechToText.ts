
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechToTextOptions {
  onResult: (text: string) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private options: SpeechToTextOptions;
  private finalTranscript: string = '';
  private resultSent: boolean = false;

  constructor(options: SpeechToTextOptions) {
    this.options = {
      lang: 'en-US',
      continuous: true,
      interimResults: true,
      ...options
    };
    this.initRecognition();
  }

  private initRecognition() {
    try {
      // Check if the browser supports the Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition is not supported in this browser.');
        return;
      }

      // Initialize the SpeechRecognition object
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Set recognition properties
      this.recognition.lang = this.options.lang as string;
      this.recognition.continuous = this.options.continuous as boolean;
      this.recognition.interimResults = this.options.interimResults as boolean;
      
      // Set up event handlers
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        
        // Process results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Send combined transcript to caller
        const fullTranscript = this.finalTranscript + interimTranscript;
        this.options.onResult(fullTranscript.trim());
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        
        if (this.finalTranscript && !this.resultSent) {
          // Ensure the final result is passed to the callback just once
          this.options.onResult(this.finalTranscript.trim());
          this.resultSent = true; // Mark that we've sent the result
          
          if (this.options.onEnd) {
            this.options.onEnd();
          }
          
          // Reset for next session after a short delay
          setTimeout(() => {
            this.finalTranscript = '';
            this.resultSent = false;
          }, 500);
        } else if (this.options.onEnd) {
          this.options.onEnd();
        }
      };
      
      this.recognition.onerror = (event) => {
        this.isListening = false;
        console.error('Speech recognition error:', event.error);
        if (this.options.onError) {
          this.options.onError(event);
        }
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  start() {
    if (!this.recognition) {
      console.error('Speech recognition is not initialized.');
      return;
    }
    
    if (!this.isListening) {
      this.finalTranscript = ''; // Reset transcript on new session
      this.resultSent = false;   // Reset the sent flag
      this.recognition.start();
      this.isListening = true;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  abort() {
    if (this.recognition && this.isListening) {
      this.recognition.abort(); // Immediately stop without firing final results
      this.isListening = false;
    }
  }

  isActive() {
    return this.isListening;
  }
}

// Type definitions for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}
