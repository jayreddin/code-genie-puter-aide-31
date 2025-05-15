
import axios from 'axios';

// Types for API responses and requests
export interface PuterModelInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

export interface CodeGenerationRequest {
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CodeGenerationResponse {
  generatedCode: string;
  explanations?: string;
  alternatives?: string[];
}

export interface CodeDebugRequest {
  model: string;
  code: string;
  error?: string;
}

export interface CodeDebugResponse {
  diagnosis: string;
  suggestions: string[];
  fixedCode?: string;
}

class PuterAPIService {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.puter.com/v1';
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAvailableModels(): Promise<PuterModelInfo[]> {
    try {
      // Note: This is a placeholder endpoint, replace with actual Puter API endpoint
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });
      return response.data.models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch Puter models');
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      // Note: This is a placeholder endpoint, replace with actual Puter API endpoint
      const response = await axios.post(`${this.baseUrl}/generate`, {
        model: request.model,
        prompt: request.prompt,
        max_tokens: request.maxTokens || 500,
        temperature: request.temperature || 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        generatedCode: response.data.generated_code,
        explanations: response.data.explanations,
        alternatives: response.data.alternatives,
      };
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code with Puter API');
    }
  }

  async debugCode(request: CodeDebugRequest): Promise<CodeDebugResponse> {
    try {
      // Note: This is a placeholder endpoint, replace with actual Puter API endpoint
      const response = await axios.post(`${this.baseUrl}/debug`, {
        model: request.model,
        code: request.code,
        error: request.error,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        diagnosis: response.data.diagnosis,
        suggestions: response.data.suggestions,
        fixedCode: response.data.fixed_code,
      };
    } catch (error) {
      console.error('Error debugging code:', error);
      throw new Error('Failed to debug code with Puter API');
    }
  }
}

export const puterAPIService = new PuterAPIService();
export default puterAPIService;
