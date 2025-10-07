import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

export class AIService {
  static instance = null;
  
  static getInstance() {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  
  constructor() {
    this.claudeApiKey = this.validateApiKey(process.env.CLAUDE_API_KEY);
    this.openaiApiKey = this.validateApiKey(process.env.OPENAI_API_KEY);
    this.geminiApiKey = this.validateApiKey(process.env.GEMINI_API_KEY);
    this.customApiKey = this.validateApiKey(process.env.CUSTOM_API_KEY);
    
    // Debug logging
    // console.log('🔍 API Keys Debug:', {
    //   customApiKey: this.customApiKey ? 'SET' : 'NULL',
    //   customBaseUrl: process.env.CUSTOM_API_BASE_URL || 'NULL',
    //   geminiApiKey: this.geminiApiKey ? 'SET' : 'NULL',
    //   claudeApiKey: this.claudeApiKey ? 'SET' : 'NULL',
    //   openaiApiKey: this.openaiApiKey ? 'SET' : 'NULL'
    // });
    
    // Custom API configuration
    this.customConfig = {
      baseUrl: process.env.CUSTOM_API_BASE_URL,
      endpoint: process.env.CUSTOM_API_ENDPOINT || '/chat/completions',
      model: process.env.CUSTOM_API_MODEL || 'gpt-3.5-turbo',
      format: process.env.CUSTOM_API_FORMAT || 'openai',
      headerPrefix: process.env.CUSTOM_API_HEADER_PREFIX || 'Bearer',
      maxTokens: parseInt(process.env.CUSTOM_API_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.CUSTOM_API_TEMPERATURE || '0.7')
    };
  }

  // Validate API key - reject empty strings, undefined, or placeholder values
  validateApiKey(key) {
    if (!key || key.trim() === '') {
      return null;
    }
    
    // Common placeholder values to ignore
    const placeholders = [
      'your-api-key-here',
      'your_api_key_here',
      'your-actual-api-key-here',
      'insert-your-key-here',
      'add-your-key-here',
      'sk-placeholder',
      'example-key'
    ];
    
    // Check if it's a placeholder
    if (placeholders.includes(key.toLowerCase())) {
      return null;
    }
    
    // Check minimum length (most real API keys are at least 20 chars)
    if (key.length < 10) {
      return null;
    }
    
    return key;
  }

  async generateResponse(prompt, context) {
    // Try Custom API first if configured
    if (this.customApiKey && this.customConfig.baseUrl) {
      try {
        return await this.callCustomAPI(prompt, context);
      } catch (error) {
        console.warn('Custom API failed, trying fallback:', error.message);
      }
    }
    
    // Try Gemini API if available
    if (this.geminiApiKey) {
      try {
        return await this.callGeminiAPI(prompt, context);
      } catch (error) {
        console.warn('Gemini API failed, trying fallback:', error.message);
      }
    }

    // Try Claude API if available
    if (this.claudeApiKey) {
      try {
        return await this.callClaudeAPI(prompt, context);
      } catch (error) {
        console.warn('Claude API failed, trying fallback:', error.message);
      }
    }
    
    // Try OpenAI API if available
    if (this.openaiApiKey) {
      try {
        return await this.callOpenAI(prompt, context);
      } catch (error) {
        console.warn('OpenAI API failed, using fallback:', error.message);
      }
    }
    
    // If all APIs fail, return fallback response
    return this.getFallbackResponse(prompt);
  }

  async callGeminiAPI(prompt, context) {
    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const chat = model.startChat({
      history: context ? [{ role: "user", parts: [{ text: "You are a helpful business consultant. Here's the current context: " + context }] }, { role: "model", parts: [{ text: "Okay, I understand the context." }] }] : [],
      generationConfig: {
        maxOutputTokens: 4000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  }

  async callClaudeAPI(prompt, context) {
    const messages = [];
    
    if (context) {
      messages.push({
        role: 'system',
        content: `You are a helpful business consultant. Here's the current context: ${context}`
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callOpenAI(prompt, context) {
    const messages = [];
    
    if (context) {
      messages.push({
        role: 'system',
        content: `You are a helpful business consultant. Here's the current context: ${context}`
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callCustomAPI(prompt, context) {
    const messages = [];
    
    if (context) {
      messages.push({
        role: 'system',
        content: `You are a helpful business consultant. Here's the current context: ${context}`
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    // Build headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Set up authorization header
    if (this.customConfig.headerPrefix === 'Bearer') {
      headers['Authorization'] = `Bearer ${this.customApiKey}`;
    } else if (this.customConfig.headerPrefix === 'x-api-key') {
      headers['x-api-key'] = this.customApiKey;
    } else if (this.customConfig.headerPrefix === 'API-Key') {
      headers['API-Key'] = this.customApiKey;
    } else {
      headers['Authorization'] = `${this.customConfig.headerPrefix} ${this.customApiKey}`;
    }

    // Build request body based on format
    let requestBody;
    if (this.customConfig.format === 'openai') {
      requestBody = {
        model: this.customConfig.model,
        messages: messages,
        max_tokens: this.customConfig.maxTokens,
        temperature: this.customConfig.temperature
      };
    } else if (this.customConfig.format === 'claude') {
      requestBody = {
        model: this.customConfig.model,
        max_tokens: this.customConfig.maxTokens,
        messages: messages
      };
    } else {
      requestBody = {
        model: this.customConfig.model,
        prompt: prompt,
        context: context,
        max_tokens: this.customConfig.maxTokens,
        temperature: this.customConfig.temperature,
        messages: messages
      };
    }

    const response = await fetch(`${this.customConfig.baseUrl}${this.customConfig.endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Custom API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Parse response based on format
    if (this.customConfig.format === 'openai') {
      return data.choices?.[0]?.message?.content || data.response || 'No response received';
    } else if (this.customConfig.format === 'claude') {
      return data.content?.[0]?.text || data.response || 'No response received';
    } else {
      return data.response || data.content || data.text || data.message || 'No response received';
    }
  }

  getFallbackResponse(prompt) {
    return `Thanks for your question: "${prompt}". I'm here to help with business planning! Unfortunately, I'm having trouble connecting to my AI service right now. 

Here are some things I can help you with once the connection is restored:

• **Compliance Research**: Industry-specific regulatory requirements
• **Business Name Suggestions**: Available domain names and trademark considerations  
• **Market Analysis**: Competitive landscape and market sizing
• **Financial Planning**: Revenue projections and funding strategies
• **Technical Requirements**: Technology stack and infrastructure needs

Please check your API configuration and try again. Make sure you have either:
- GEMINI_API_KEY for Gemini API access
- CLAUDE_API_KEY for Claude API access
- OPENAI_API_KEY for OpenAI access
- Custom API configuration

Try rephrasing your question or check back in a moment once your API is configured.`;
  }

  isConfigured() {
    return !!(this.customApiKey && this.customConfig.baseUrl) || !!this.geminiApiKey || !!this.claudeApiKey || !!this.openaiApiKey;
  }

  getActiveProvider() {
    if (this.customApiKey && this.customConfig.baseUrl) return 'Custom API';
    if (this.geminiApiKey) return 'Gemini';
    if (this.claudeApiKey) return 'Claude';
    if (this.openaiApiKey) return 'OpenAI';
    return 'None';
  }

  getConfigInfo() {
    return {
      customAPI: {
        configured: !!(this.customApiKey && this.customConfig.baseUrl),
        baseUrl: this.customConfig.baseUrl,
        endpoint: this.customConfig.endpoint,
        model: this.customConfig.model,
        format: this.customConfig.format,
        headerPrefix: this.customConfig.headerPrefix
      },
      gemini: {
        configured: !!this.geminiApiKey,
        baseUrl: 'https://generativelanguage.googleapis.com'
      },
      claude: {
        configured: !!this.claudeApiKey,
        baseUrl: 'https://api.anthropic.com'
      },
      openai: {
        configured: !!this.openaiApiKey,
        baseUrl: 'https://api.openai.com/v1'
      }
    };
  }

  async healthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check Custom API
    if (this.customApiKey && this.customConfig.baseUrl) {
      try {
        const response = await fetch(`${this.customConfig.baseUrl}/health`, {
          method: 'GET',
          timeout: 5000
        });
        results.services.custom = {
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: response.ok ? 'fast' : 'slow'
        };
      } catch (error) {
        results.services.custom = {
          status: 'unavailable',
          error: error.message
        };
      }
    }

    // Check Gemini API (basic connectivity)
    if (this.geminiApiKey) {
        results.services.gemini = {
            status: 'configured',
            configured: true
        };
    }

    // Check Claude API (basic connectivity)
    if (this.claudeApiKey) {
      results.services.claude = {
        status: 'configured',
        configured: true
      };
    }

    // Check OpenAI API (basic connectivity)
    if (this.openaiApiKey) {
      results.services.openai = {
        status: 'configured',
        configured: true
      };
    }

    return results;
  }
}