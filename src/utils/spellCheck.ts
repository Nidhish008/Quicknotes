
import Typo from 'typo-js';

class SpellChecker {
  private typo: any;
  private isReady: boolean = false;
  private static instance: SpellChecker;
  private readonly ignoredWords: Set<string> = new Set();

  private constructor() {
    this.initDictionary();
  }

  public static getInstance(): SpellChecker {
    if (!SpellChecker.instance) {
      SpellChecker.instance = new SpellChecker();
    }
    return SpellChecker.instance;
  }

  private async initDictionary() {
    try {
      // Initialize with English US dictionary
      // Fix for browser is not defined error
      this.typo = new Typo('en_US', undefined, undefined, { platform: 'web' });
      this.isReady = true;
      console.log('Spellchecker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize spellchecker:', error);
      // Set isReady to false if there's an error
      this.isReady = false;
    }
  }

  public isInitialized(): boolean {
    return this.isReady;
  }

  public addToIgnoreList(word: string): void {
    this.ignoredWords.add(word.toLowerCase());
  }

  public isIgnored(word: string): boolean {
    return this.ignoredWords.has(word.toLowerCase());
  }

  public checkWord(word: string): boolean {
    if (!this.isReady || !this.typo) {
      console.warn('Spellchecker not ready yet');
      return true;
    }
    
    // Skip checking very short words, numbers, and ignored words
    if (word.length <= 1 || /^\d+$/.test(word) || this.isIgnored(word)) {
      return true;
    }
    
    try {
      return this.typo.check(word);
    } catch (error) {
      console.error('Error checking word:', error);
      return true; // Return true to avoid showing errors to user
    }
  }

  public getSuggestions(word: string): string[] {
    if (!this.isReady || !this.typo) {
      console.warn('Spellchecker not ready yet');
      return [];
    }
    
    try {
      return this.typo.suggest(word);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  public correctText(text: string): string {
    if (!this.isReady || !this.typo) {
      console.warn('Spellchecker not ready yet');
      return text;
    }

    try {
      // Split text into words
      const words = text.split(/\s+/);
      
      // Check and potentially replace each word
      const correctedWords = words.map(word => {
        // Skip punctuation-only strings
        if (/^[.,!?;:'"()\-–—]+$/.test(word)) {
          return word;
        }
        
        // Extract leading and trailing punctuation
        const leadingPunct = word.match(/^[.,!?;:'"()\-–—]+/) || [''];
        const trailingPunct = word.match(/[.,!?;:'"()\-–—]+$/) || [''];
        
        // Extract the actual word without punctuation
        const cleanWord = word
          .replace(/^[.,!?;:'"()\-–—]+/, '')
          .replace(/[.,!?;:'"()\-–—]+$/, '');
        
        if (!cleanWord) return word;
        
        // Skip very short words, numbers, URLs, emails, and ignored words
        if (
          cleanWord.length <= 1 || 
          /^\d+$/.test(cleanWord) || 
          /^https?:\/\//i.test(cleanWord) ||
          /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleanWord) ||
          this.isIgnored(cleanWord)
        ) {
          return word;
        }
        
        // If the word is correct, return as is
        if (this.checkWord(cleanWord)) {
          return word;
        }
        
        // Get suggestions and use the first one if available
        const suggestions = this.getSuggestions(cleanWord);
        if (suggestions.length > 0) {
          return leadingPunct[0] + suggestions[0] + trailingPunct[0];
        }
        
        // If no suggestions, return the original word
        return word;
      });
      
      // Join the words back together
      return correctedWords.join(' ');
    } catch (error) {
      console.error('Error correcting text:', error);
      return text; // Return original text if there's an error
    }
  }

  public correctWord(word: string): string {
    if (!this.isReady || !this.typo) {
      return word;
    }

    try {
      // Skip very short words, numbers, URLs, emails, and ignored words
      if (
        word.length <= 1 || 
        /^\d+$/.test(word) || 
        /^https?:\/\//i.test(word) ||
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(word) ||
        this.isIgnored(word)
      ) {
        return word;
      }

      // If the word is correct, return as is
      if (this.checkWord(word)) {
        return word;
      }

      // Get suggestions and use the first one if available
      const suggestions = this.getSuggestions(word);
      if (suggestions.length > 0) {
        return suggestions[0];
      }

      // If no suggestions, return the original word
      return word;
    } catch (error) {
      console.error('Error correcting word:', error);
      return word;
    }
  }
}

export default SpellChecker;
