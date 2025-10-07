// API client for backend server integration

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const DEVELOPER_MODE = import.meta.env.VITE_DEVELOPER_MODE !== 'false';


interface APIResponse {
  response: string;
  provider: string;
  timestamp: string;
}

interface APIError {
  error: string;
  message: string;
  timestamp: string;
}

export class AIClient {
  private static instance: AIClient;
  private userApiKeys: { claude: string; openai: string; provider: string } | null = null;
  
  private constructor() {}
  
  public static getInstance(): AIClient {
    if (!AIClient.instance) {
      AIClient.instance = new AIClient();
    }
    return AIClient.instance;
  }

  // Set user API keys for direct calls
  public setUserApiKeys(keys: { claude: string; openai: string; provider: string }) {
    this.userApiKeys = keys;
  }

  // Clear user API keys
  public clearUserApiKeys() {
    this.userApiKeys = null;
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    console.log('🔥 generateResponse called - checking API configuration...', {
      hasUserApiKeys: !!(this.userApiKeys && this.userApiKeys.provider),
      provider: this.userApiKeys?.provider || 'none',
      developerMode: DEVELOPER_MODE
    });
    
    // If user has API keys, use direct API calls
    if (this.userApiKeys && this.userApiKeys.provider) {
      console.log(`🚀 Making direct API call via: ${this.userApiKeys.provider.toUpperCase()}`);
      return this.generateDirectResponse(prompt, context);
    }

    // Skip backend API if developer mode is disabled
    if (!DEVELOPER_MODE) {
      console.log('⚠️ Backend API disabled - using fallback response');
      return this.getFallbackResponse(prompt, 'Backend API disabled. Please configure your API keys.');
    }

    // Otherwise, try backend API
    console.log('🔄 Making request via backend API...');
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context
        })
      });

      if (!response.ok) {
        const errorData: APIError = await response.json().catch(() => ({
          error: 'Network error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        }));
        
        throw new Error(errorData.message || 'Failed to generate response');
      }

      const data: APIResponse = await response.json();
      console.log(`✅ Backend API response received via: ${data.provider || 'Unknown Provider'}`);
      return data.response;
    } catch (error) {
      console.error('Backend API error:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return this.getFallbackResponse(prompt, 'Backend server is not running. Please start the backend server.');
      }
      
      // Return fallback response for other errors
      return this.getFallbackResponse(prompt, (error as Error).message);
    }
  }

  // Direct API call method
  private async generateDirectResponse(prompt: string, context?: string): Promise<string> {
    if (!this.userApiKeys) {
      throw new Error('No user API keys configured');
    }

    const { provider } = this.userApiKeys;
    
    try {
      if (provider === 'claude') {
        return await this.callClaudeAPI(prompt, context);
      } else if (provider === 'openai') {
        return await this.callOpenAIAPI(prompt, context);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.error('Direct API error:', error);
      return this.getFallbackResponse(prompt, `${provider} API error: ${(error as Error).message}`);
    }
  }

  // Claude API direct call
  private async callClaudeAPI(prompt: string, context?: string): Promise<string> {
    if (!this.userApiKeys?.claude) {
      throw new Error('Claude API key not configured');
    }

    const messages = [];
    if (context) {
      messages.push({ role: 'system', content: context });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.userApiKeys.claude,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // OpenAI API direct call
  private async callOpenAIAPI(prompt: string, context?: string): Promise<string> {
    if (!this.userApiKeys?.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = [];
    if (context) {
      messages.push({ role: 'system', content: context });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userApiKeys.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private getFallbackResponse(prompt: string, errorMessage?: string): string {
    const baseMessage = `Thanks for your question: "${prompt}". I'm here to help with business planning!`;
    
    if (errorMessage) {
      return `${baseMessage} Unfortunately, I'm having trouble connecting to my AI service right now: ${errorMessage}

Here are some things I can help you with once the connection is restored:

• **Compliance Research**: Industry-specific regulatory requirements
• **Business Name Suggestions**: Available domain names and trademark considerations  
• **Market Analysis**: Competitive landscape and market sizing
• **Financial Planning**: Revenue projections and funding strategies
• **Technical Requirements**: Technology stack and infrastructure needs

Please make sure:
1. The backend server is running (npm run dev in /server directory)
2. Your API keys are configured in the backend .env file
3. The backend URL is correct (${BACKEND_BASE_URL})

Try rephrasing your question or check back in a moment once the service is restored.`;
    }

    return `${baseMessage} The AI service is currently unavailable. Please try again in a moment.`;
  }

  // Check if backend is reachable
  async isConfigured(): Promise<boolean> {
    // Skip backend check if developer mode is disabled
    if (!DEVELOPER_MODE) {
      return false;
    }
    
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isConfigured || false;
    } catch {
      // Silent fail - backend being down is expected behavior
      return false;
    }
  }

  // Get the active API provider from backend
  async getProvider(): Promise<string> {
    // Skip backend check if developer mode is disabled
    if (!DEVELOPER_MODE) {
      return 'Backend Disabled';
    }
    
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return 'Backend Unavailable';
      }

      const data = await response.json();
      return data.activeProvider || 'None';
    } catch {
      // Silent fail - backend being down is expected behavior
      return 'Backend Unavailable';
    }
  }

  // Get configuration details from backend
  async getConfigInfo(): Promise<object> {
    // Skip backend check if developer mode is disabled
    if (!DEVELOPER_MODE) {
      return {
        backend: {
          configured: false,
          url: BACKEND_BASE_URL,
          status: 'disabled'
        }
      };
    }
    
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return {
          backend: {
            configured: false,
            url: BACKEND_BASE_URL,
            status: 'unreachable'
          }
        };
      }

      const data = await response.json();
      return {
        backend: {
          configured: true,
          url: BACKEND_BASE_URL,
          status: 'connected'
        },
        ...data.config
      };
    } catch {
      // Silent fail - backend being down is expected behavior
      return {
        backend: {
          configured: false,
          url: BACKEND_BASE_URL,
          status: 'error'
        }
      };
    }
  }
}