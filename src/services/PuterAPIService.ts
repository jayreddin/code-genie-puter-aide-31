
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
      // Check if puter.js is available in the browser
      if (typeof window !== 'undefined' && window.puter) {
        // In this case, we'd use real puter.js but for now return mock data
        // This could be enhanced to actually return available models from puter.js
      }
      
      // Return mock data for now
      return [
        { 
          id: 'gpt-4o-mini', 
          name: 'GPT-4o mini', 
          description: 'Fast and efficient model from OpenAI', 
          capabilities: ['text', 'vision', 'streaming', 'function-calling'] 
        },
        { 
          id: 'gpt-4o', 
          name: 'GPT-4o', 
          description: 'High-performance multimodal model from OpenAI', 
          capabilities: ['text', 'vision', 'streaming', 'function-calling'] 
        },
        { 
          id: 'claude-3-7-sonnet', 
          name: 'Claude 3.7 Sonnet', 
          description: 'Advanced reasoning model from Anthropic', 
          capabilities: ['text', 'streaming', 'function-calling'] 
        },
        {
          id: 'mistral-large-latest',
          name: 'Mistral Large',
          description: 'Powerful model from Mistral AI',
          capabilities: ['text', 'streaming']
        },
        {
          id: 'grok-beta',
          name: 'Grok (Beta)',
          description: 'Beta model from xAI',
          capabilities: ['text', 'streaming']
        }
      ];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch Puter models');
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      if (typeof window !== 'undefined' && window.puter) {
        try {
          // Use real puter.js for code generation
          const response = await window.puter.ai.chat({
            model: request.model,
            messages: [
              { role: 'system', content: 'You are a coding assistant. Provide clear, concise code with explanations.' },
              { role: 'user', content: request.prompt }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens
          });

          // Extract code from the response
          const content = response.message.content;
          
          // This is a simple implementation - in a real app, you might want to parse code blocks
          return {
            generatedCode: content,
            explanations: 'Generated using Puter AI.'
          };
        } catch (error) {
          console.error('Error using puter.js for code generation:', error);
          // Fall back to mock
        }
      }
      
      // Mock response for when puter.js is not available
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
      if (typeof window !== 'undefined' && window.puter) {
        try {
          // Build a prompt for code debugging
          const prompt = `I have the following code that needs debugging:
\`\`\`
${request.code}
\`\`\`
${request.error ? `I'm getting this error: ${request.error}` : 'Please find any issues in this code.'}
Provide a diagnosis, suggestions for fixing it, and if possible, the corrected code.`;

          // Use real puter.js for code debugging
          const response = await window.puter.ai.chat({
            model: request.model,
            messages: [
              { role: 'system', content: 'You are a coding assistant specializing in debugging. Analyze the code and provide fixes.' },
              { role: 'user', content: prompt }
            ]
          });

          // This is a simplified parsing, a real app might use more sophisticated parsing
          const content = response.message.content;
          
          // Very basic attempt to extract parts of the response
          let diagnosis = "Code analysis complete.";
          let suggestions = [content];
          let fixedCode = undefined;
          
          // Look for code blocks in the response
          const codeBlockMatch = content.match(/```(?:[\w]*)\n([\s\S]*?)```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            fixedCode = codeBlockMatch[1].trim();
          }

          return {
            diagnosis: diagnosis,
            suggestions: suggestions,
            fixedCode: fixedCode
          };
        } catch (error) {
          console.error('Error using puter.js for code debugging:', error);
          // Fall back to mock
        }
      }
      
      // Mock response when puter.js is not available
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
