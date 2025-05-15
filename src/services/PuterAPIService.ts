
/**
 * Service for interacting with Puter API
 */
import { toast } from "@/hooks/use-toast";

class PuterAPIService {
  private apiKey: string | null = null;
  private isMockMode: boolean = false;
  
  constructor() {
    // Check if we're running in a browser environment and Puter is available
    if (typeof window !== 'undefined') {
      this.isMockMode = !window.puter;
      if (this.isMockMode) {
        console.warn("Puter API not detected, running in mock mode");
      }
    } else {
      this.isMockMode = true;
    }
    
    // Try to load API key from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      this.apiKey = window.localStorage.getItem('puterApiKey');
    }
  }
  
  /**
   * Set the API key for authenticated requests
   */
  public setApiKey(key: string): void {
    this.apiKey = key;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('puterApiKey', key);
    }
  }
  
  /**
   * Check if the user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    // In real Puter mode, check actual auth status
    if (!this.isMockMode && window.puter) {
      return window.puter.auth.isSignedIn();
    }
    
    // In mock mode, check if we have an API key
    return !!this.apiKey;
  }
  
  /**
   * Get user information
   */
  public async getUser(): Promise<any> {
    if (this.isMockMode) {
      // Return mock user data
      return {
        uuid: 'mock-user-id',
        username: 'mock_user',
        email_confirmed: true
      };
    }
    
    // Use actual Puter auth
    if (window.puter) {
      try {
        return await window.puter.auth.getUser();
      } catch (error) {
        console.error("Failed to get user:", error);
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Sign in the user
   */
  public async signIn(): Promise<boolean> {
    if (this.isMockMode) {
      // Simulate sign in with mock
      this.setApiKey('mock-api-key');
      return true;
    }
    
    // Use actual Puter auth
    if (window.puter) {
      try {
        return await window.puter.auth.signIn();
      } catch (error) {
        console.error("Failed to sign in:", error);
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Sign out the user
   */
  public signOut(): void {
    if (this.isMockMode) {
      // Clear stored API key
      this.apiKey = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('puterApiKey');
      }
      return;
    }
    
    // Use actual Puter auth
    if (window.puter) {
      window.puter.auth.signOut();
    }
  }
  
  /**
   * Chat with AI
   */
  public async chatWithAI(prompt: string, model: string, options = {}): Promise<any> {
    if (this.isMockMode) {
      // Return mock response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return {
        message: {
          content: `This is a mock response to "${prompt}" using model "${model}".`
        }
      };
    }
    
    // Use actual Puter AI
    if (window.puter) {
      try {
        // Fixed: Pass prompt as string, avoiding object
        return await window.puter.ai.chat(prompt, {
          model,
          ...options
        });
      } catch (error) {
        console.error("AI chat failed:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Image to Text conversion
   */
  public async imageToText(image: File | Blob): Promise<string> {
    if (this.isMockMode) {
      // Return mock result
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      return "This is mock extracted text from the image.";
    }
    
    // Use actual Puter AI
    if (window.puter) {
      try {
        return await window.puter.ai.img2txt(image);
      } catch (error) {
        console.error("Image to text failed:", error);
        toast({
          title: "Error",
          description: "Failed to extract text from image. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Text to Image conversion
   */
  public async textToImage(prompt: string): Promise<HTMLImageElement> {
    if (this.isMockMode) {
      // Return a placeholder image
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      const img = new Image();
      img.src = `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt)}`;
      return img;
    }
    
    // Use actual Puter AI
    if (window.puter) {
      try {
        return await window.puter.ai.txt2img(prompt);
      } catch (error) {
        console.error("Text to image failed:", error);
        toast({
          title: "Error",
          description: "Failed to generate image. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Text to Speech conversion
   */
  public async textToSpeech(text: string, language = 'en-US'): Promise<HTMLAudioElement> {
    if (this.isMockMode) {
      // Return mock audio (silence)
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      return audio;
    }
    
    // Use actual Puter AI
    if (window.puter) {
      try {
        return await window.puter.ai.txt2speech(text, language);
      } catch (error) {
        console.error("Text to speech failed:", error);
        toast({
          title: "Error",
          description: "Failed to convert text to speech. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
    }
    
    throw new Error("Puter API not available");
  }
  
  /**
   * Get available models
   */
  public async getAvailableModels(): Promise<any[]> {
    if (this.isMockMode) {
      // Return mock models
      return [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', capabilities: ['chat', 'function-calling', 'streaming'] },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', capabilities: ['chat', 'function-calling', 'streaming'] },
        { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', capabilities: ['chat', 'function-calling', 'streaming'] },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', capabilities: ['chat'] }
      ];
    }
    
    // In a real implementation, this would fetch available models from the API
    // but for now, we'll return a predefined list
    return [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', capabilities: ['chat', 'function-calling', 'streaming'] },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', capabilities: ['chat', 'function-calling', 'streaming'] },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', capabilities: ['chat', 'function-calling', 'streaming'] },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', capabilities: ['chat'] }
    ];
  }
}

export const puterAPIService = new PuterAPIService();
export default puterAPIService;
