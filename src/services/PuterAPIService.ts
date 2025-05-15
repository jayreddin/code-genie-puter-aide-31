
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
      // In web-only mode, return mock data
      return [
        { 
          id: 'gpt-4o-mini', 
          name: 'GPT-4o mini', 
          description: 'Fast and efficient model from OpenAI', 
          capabilities: ['text', 'vision'] 
        },
        { 
          id: 'gpt-4o', 
          name: 'GPT-4o', 
          description: 'High-performance multimodal model from OpenAI', 
          capabilities: ['text', 'vision'] 
        },
        { 
          id: 'claude-3-7-sonnet', 
          name: 'Claude 3.7 Sonnet', 
          description: 'Advanced reasoning model from Anthropic', 
          capabilities: ['text'] 
        }
      ];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch Puter models');
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      // Mock response for web-only mode
      return {
        generatedCode: '// Sample generated code\nfunction example() {\n  console.log("Hello world");\n}',
        explanations: 'This is a simple function that logs "Hello world" to the console.',
        alternatives: []
      };
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Failed to generate code with Puter API');
    }
  }

  async debugCode(request: CodeDebugRequest): Promise<CodeDebugResponse> {
    try {
      // Mock response for web-only mode
      return {
        diagnosis: 'The code contains a syntax error.',
        suggestions: ['Check for missing semicolons', 'Ensure all brackets are properly closed'],
        fixedCode: '// Fixed code\nfunction example() {\n  console.log("Hello world");\n}'
      };
    } catch (error) {
      console.error('Error debugging code:', error);
      throw new Error('Failed to debug code with Puter API');
    }
  }
}

export const puterAPIService = new PuterAPIService();
export default puterAPIService;
