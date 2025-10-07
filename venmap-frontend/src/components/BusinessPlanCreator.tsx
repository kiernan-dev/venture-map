import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, Save, FolderOpen, Moon, Sun, Settings, Trash2, Edit3, ChevronDown, ChevronRight, CheckCircle, X, MessageCircle, Send, Bot, Key } from 'lucide-react';
import { AIClient } from '../utils/apiClient';
import { SplitPaneView } from './SplitPaneView';

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Template interface
interface Template {
  name: string;
  description: string;
  icon: string;
  fields: string[];
}

// Form data interface
interface BusinessFormData {
  businessName: string;
  industry: string;
  complianceType: string;
  executiveSummary: string;
  problemStatement: string;
  solution: string;
  marketAnalysis: string;
  businessModel: string;
  marketingStrategy: string;
  operationsPlan: string;
  managementTeam: string;
  financialProjections: string;
  fundingRequest: string;
  technicalRequirements: string;
  securityConsiderations: string;
  integrationNeeds: string;
  [key: string]: string;
}

// API Key Form Component
interface ApiKeyFormProps {
  isDarkMode: boolean;
  userApiKeys: { claude: string; openai: string; provider: string };
  onSave: (keys: { claude: string; openai: string; provider: string }) => void;
  onCancel: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ isDarkMode, userApiKeys, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    claude: userApiKeys.claude || '',
    openai: userApiKeys.openai || '',
    provider: userApiKeys.provider || 'claude'
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{success: boolean, message: string} | null>(null);

  const testApiKey = async (provider: string, apiKey: string) => {
    try {
      if (provider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return response.ok;
      } else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          })
        });
        return response.ok;
      }
      return false;
    } catch {
      console.error('API key test failed');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentKey = formData[formData.provider as keyof typeof formData];
    
    if (!currentKey) {
      setValidationResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await testApiKey(formData.provider, currentKey);
      
      if (isValid) {
        setValidationResult({ success: true, message: 'API key validated successfully!' });
        setTimeout(() => {
          onSave(formData);
        }, 1000);
      } else {
        setValidationResult({ 
          success: false, 
          message: `Invalid ${formData.provider === 'claude' ? 'Claude' : 'OpenAI'} API key. Please check your key and try again.` 
        });
      }
    } catch {
      setValidationResult({ 
        success: false, 
        message: 'Failed to validate API key. Please check your internet connection and try again.' 
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          AI Provider
        </label>
        <select
          value={formData.provider}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        >
          <option value="claude">Claude (Anthropic)</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      {formData.provider === 'claude' && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Claude API Key
          </label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={formData.claude}
            onChange={(e) => setFormData({ ...formData, claude: e.target.value })}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">console.anthropic.com</a>
          </p>
        </div>
      )}

      {formData.provider === 'openai' && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            OpenAI API Key
          </label>
          <input
            type="password"
            placeholder="sk-..."
            value={formData.openai}
            onChange={(e) => setFormData({ ...formData, openai: e.target.value })}
            className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Get your API key from <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">platform.openai.com</a>
          </p>
        </div>
      )}

      {/* Validation Status */}
      {validationResult && (
        <div className={`p-3 rounded-lg border ${
          validationResult.success 
            ? isDarkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
            : isDarkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {validationResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm">{validationResult.message}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isValidating}
          className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
            isValidating 
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          {isValidating && <Loader2 className="w-4 h-4 animate-spin" />}
          {isValidating ? 'Testing API Key...' : 'Test & Save API Key'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isValidating}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isValidating 
              ? 'opacity-50 cursor-not-allowed'
              : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const BusinessPlanCreator = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState('default');
  interface SavedPlan {
    id: string;
    name: string;
    template: string;
    data: BusinessFormData;
    generatedPlan: string;
    createdAt: string;
    updatedAt: string;
  }
  
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ basic: true });
  const [toast, setToast] = useState<{type: string, message: string} | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<number | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isClosingChatbot, setIsClosingChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  // Speech recognition state removed - feature not currently implemented
  // const [isListening, setIsListening] = useState(false);
  // const [recognition, setRecognition] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState({ isConfigured: false, provider: 'Checking...', loading: true, developerMode: true });
  const [userApiKeys, setUserApiKeys] = useState({ claude: '', openai: '', provider: '' });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  // AI client instance
  const aiClient = AIClient.getInstance();
  
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    industry: '',
    complianceType: '',
    executiveSummary: '',
    problemStatement: '',
    solution: '',
    marketAnalysis: '',
    businessModel: '',
    marketingStrategy: '',
    operationsPlan: '',
    managementTeam: '',
    financialProjections: '',
    fundingRequest: '',
    technicalRequirements: '',
    securityConsiderations: '',
    integrationNeeds: ''
  });
  
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [error, setError] = useState('');

  const formSections: Record<string, {title: string, fields: string[], defaultOpen: boolean}> = {
    basic: {
      title: 'Basic Information',
      fields: ['businessName', 'industry', 'complianceType'],
      defaultOpen: true
    },
    overview: {
      title: 'Business Overview',
      fields: ['executiveSummary', 'problemStatement', 'solution'],
      defaultOpen: false
    },
    market: {
      title: 'Market & Strategy',
      fields: ['marketAnalysis', 'businessModel', 'marketingStrategy'],
      defaultOpen: false
    },
    operations: {
      title: 'Operations & Team',
      fields: ['operationsPlan', 'managementTeam'],
      defaultOpen: false
    },
    financial: {
      title: 'Financial Planning',
      fields: ['financialProjections', 'fundingRequest'],
      defaultOpen: false
    },
    technical: {
      title: 'Technical Requirements',
      fields: ['technicalRequirements', 'securityConsiderations', 'integrationNeeds'],
      defaultOpen: false
    }
  };

  // Speech recognition initialization removed - feature not implemented

  // Auto-scroll chat messages
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initialize chatbot with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 1,
        type: 'bot',
        message: "Hi! I'm your AI business assistant. I can help you with:\n\n• Compliance research for your industry\n• Available business name suggestions with .com domains\n• Market analysis and competitive insights\n• Financial projections and funding advice\n• Technical requirements and security considerations\n\nWhat would you like help with today?",
        timestamp: new Date()
      }]);
    }
  }, [showChatbot]);

  // Voice input functionality - currently unused
  // const toggleVoiceInput = () => {
  //   if (!recognition) {
  //     showToast('Speech recognition not supported in this browser', 'error');
  //     return;
  //   }
  //   if (isListening) {
  //     recognition.stop();
  //     setIsListening(false);
  //   } else {
  //     recognition.start();
  //     setIsListening(true);
  //   }
  // };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: chatInput.trim(),
      timestamp: new Date()
    };
    
    try {
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsChatLoading(true);
      
      const aiClient = AIClient.getInstance();
      
      // Prepare context from form data and generated plan
      const contextData = Object.entries(formData)
        .filter(([, value]) => value && value.trim())
        .map(([key, value]) => `${fieldLabels[key as keyof typeof fieldLabels]}: ${value}`)
        .join('\n');
      
      let context = '';
      if (contextData) {
        context += `Current business form data:\n${contextData}\n\n`;
      }
      
      if (generatedPlan && generatedPlan.trim()) {
        context += `Generated Business Plan:\n${generatedPlan}`;
      }
      
      const prompt = `You are a helpful business consultant with access to the user's business information. The user asked: "${userMessage.message}"

${context ? 'Use the provided business context to give specific, relevant advice. Reference specific details from their business plan when applicable.' : 'Provide general business advice since no specific business context is available.'}

Please provide helpful, specific advice. Keep your response concise but actionable.`;

      try {
        const response = await aiClient.generateResponse(prompt, context);
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: response,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, botMessage]);
      } catch (apiError) {
        console.warn('AI API error:', apiError);
        const fallbackResponse = `I'm having trouble connecting to my AI service. Please check your backend server connection and API configuration.`;
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          message: fallbackResponse,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      showToast('Error sending message. Please try again.', 'error');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const renderChatMessage = (message: any) => {
    // Format bot messages for better readability
    const formattedMessage = message
      // Convert **text** to bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Convert bullet points to proper list items with better spacing
      .replace(/^[•\-*]\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      // Convert numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      // Group consecutive list items into proper ul tags
      .replace(/(<li class="ml-4 mb-2">.*?<\/li>\s*)+/gs, (match: string) => {
        return `<ul class="list-disc list-outside space-y-2 my-4 pl-4">${match}</ul>`;
      })
      // Convert paragraphs - split on double line breaks
      .split('\n\n')
      .map((paragraph: string) => {
        if (paragraph.includes('<ul class=')) {
          return paragraph; // Already formatted as list
        }
        return `<p class="mb-3 leading-relaxed">${paragraph.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');
    
    return formattedMessage;
  };

  // Load saved data on component mount
  useEffect(() => {
    const saved = localStorage.getItem('kiernan-ai-saved-plans');
    if (saved) {
      setSavedPlans(JSON.parse(saved));
    }
    
    const darkMode = localStorage.getItem('kiernan-ai-dark-mode');
    if (darkMode === 'true') {
      setIsDarkMode(true);
    }

    // Initialize expanded sections
    const defaultExpanded: Record<string, boolean> = {};
    Object.entries(formSections).forEach(([key, section]) => {
      defaultExpanded[key] = section.defaultOpen;
    });
    setExpandedSections(defaultExpanded);

    // Check AI client status
    checkAIStatus();
  }, []);

  // Function to check AI client status
  const checkAIStatus = async () => {
    try {
      const [configInfo, isConfigured, provider] = await Promise.all([
        aiClient.getConfigInfo().catch(() => ({ backend: { status: 'error' } })),
        aiClient.isConfigured().catch(() => false),
        aiClient.getProvider().catch(() => 'Unknown')
      ]);
      
      const developerMode = (configInfo as any)?.backend?.status === 'connected' && (configInfo as any)?.developerMode !== false;
      
      // If we have user API keys set, we're configured regardless of backend status
      const userKeysConfigured = !!(userApiKeys && userApiKeys.provider);
      let finalIsConfigured = userKeysConfigured || isConfigured;
      let finalProvider = provider;
      
      // If backend is connected but reports not configured, test if it actually works
      if (developerMode && !isConfigured && !userKeysConfigured) {
        try {
          // Test backend with a simple request
          const testResponse = await aiClient.generateResponse("test");
          if (testResponse && !testResponse.includes("Unfortunately, I'm having trouble")) {
            // Backend actually works despite config saying it doesn't
            finalIsConfigured = true;
            finalProvider = "Backend API (Connected)";
          }
        } catch (testError) {
          console.log('Backend test failed:', testError);
        }
      }
      
      if (userKeysConfigured) {
        finalProvider = userApiKeys.provider === 'claude' ? 'Claude (User API)' : 'OpenAI (User API)';
      }
      
      setAiStatus({
        isConfigured: finalIsConfigured,
        provider: finalProvider,
        loading: false,
        developerMode
      });
      
      // Log the active API provider to console
      console.log(`🤖 AI Provider Connected: ${finalProvider}`, {
        configured: finalIsConfigured,
        developerMode,
        userKeysConfigured,
        backendStatus: (configInfo as any)?.backend?.status
      });

      // Show API key modal if developer mode is off and no user keys and backend not configured
      if (!developerMode && !userApiKeys.provider && !finalIsConfigured) {
        setShowApiKeyModal(true);
      }
    } catch (error) {
      console.error('AI status check failed:', error);
      
      // If we have user API keys, we're still configured even if backend fails
      const userKeysConfigured = !!(userApiKeys && userApiKeys.provider);
      
      setAiStatus({
        isConfigured: userKeysConfigured,
        provider: userKeysConfigured 
          ? (userApiKeys.provider === 'claude' ? 'Claude (User API)' : 'OpenAI (User API)')
          : 'Error',
        loading: false,
        developerMode: false
      });
      
      // Show API key modal on error only if no user keys
      if (!userApiKeys.provider) {
        setShowApiKeyModal(true);
      }
    }
  };

  // Save user API keys and close modal
  const handleSaveApiKeys = (keys: { claude: string; openai: string; provider: string }) => {
    setUserApiKeys(keys);
    setShowApiKeyModal(false);
    localStorage.setItem('userApiKeys', JSON.stringify(keys));
    
    // Set the API keys in the AI client for direct calls
    aiClient.setUserApiKeys(keys);
    
    // Update AI status to reflect successful connection
    const providerName = keys.provider === 'claude' ? 'Claude (User API)' : 'OpenAI (User API)';
    setAiStatus({
      isConfigured: true,
      provider: providerName,
      loading: false,
      developerMode: false
    });
    
    // Log the provider change
    console.log(`🔧 API Provider Updated: ${providerName}`, {
      configured: true,
      provider: keys.provider,
      source: 'user-api-keys'
    });
    
    // Force a UI update to ensure status indicators refresh
    setTimeout(() => {
      checkAIStatus();
    }, 100);
  };

  // Load saved API keys on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('userApiKeys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setUserApiKeys(parsed);
        // Set the keys in AI client if they exist
        if (parsed.provider) {
          aiClient.setUserApiKeys(parsed);
          // Update AI status immediately if we have saved keys
          setAiStatus({
            isConfigured: true,
            provider: parsed.provider === 'claude' ? 'Claude (User API)' : 'OpenAI (User API)',
            loading: false,
            developerMode: false
          });
          // Re-check status to ensure consistency
          setTimeout(() => {
            checkAIStatus();
          }, 500);
        }
      } catch (e) {
        console.error('Failed to parse saved API keys:', e);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (formData.businessName) {
        autoSavePlan();
      }
    }, 2000); // Auto-save after 2 seconds of no changes
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData]);

  // Save plans to localStorage
  useEffect(() => {
    localStorage.setItem('kiernan-ai-saved-plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('kiernan-ai-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCloseChatbot = () => {
    setIsClosingChatbot(true);
    setTimeout(() => {
      setShowChatbot(false);
      setIsClosingChatbot(false);
    }, 300); // Match animation duration
  };

  const autoSavePlan = () => {
    if (!formData.businessName) return;
    
    const existingPlanIndex = savedPlans.findIndex(plan => 
      plan.data.businessName === formData.businessName && plan.template === currentTemplate
    );
    
    const timestamp = new Date().toISOString();
    const planData = {
      id: existingPlanIndex >= 0 ? savedPlans[existingPlanIndex].id : Date.now().toString(),
      name: formData.businessName,
      template: currentTemplate,
      data: formData,
      generatedPlan,
      createdAt: existingPlanIndex >= 0 ? savedPlans[existingPlanIndex].createdAt : timestamp,
      updatedAt: timestamp
    };
    
    if (existingPlanIndex >= 0) {
      setSavedPlans(prev => prev.map((plan, index) => 
        index === existingPlanIndex ? planData : plan
      ));
    } else {
      setSavedPlans(prev => [planData, ...prev]);
    }
    
    showToast('Plan auto-saved', 'success');
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const industries = [
    'Technology/SaaS', 'E-commerce/Retail', 'Healthcare/Medical', 'Financial Services',
    'Manufacturing', 'Real Estate', 'Food & Beverage', 'Entertainment/Media',
    'Education/EdTech', 'Transportation/Logistics', 'Energy/Utilities', 'Agriculture',
    'Construction', 'Consulting', 'Non-Profit', 'Other'
  ];

  const complianceTypes: Record<string, string[]> = {
    'Technology/SaaS': ['GDPR', 'SOC 2', 'ISO 27001', 'CCPA', 'HIPAA (if health data)'],
    'Healthcare/Medical': ['HIPAA', 'FDA', 'HITECH', 'Joint Commission', 'CMS'],
    'Financial Services': ['SOX', 'PCI DSS', 'FFIEC', 'GLBA', 'Basel III'],
    'E-commerce/Retail': ['PCI DSS', 'GDPR', 'CCPA', 'FTC Guidelines', 'CPSIA'],
    'Manufacturing': ['ISO 9001', 'OSHA', 'EPA', 'ISO 14001', 'FDA (if applicable)'],
    'Food & Beverage': ['FDA', 'USDA', 'HACCP', 'SQF', 'BRC'],
    'Education/EdTech': ['FERPA', 'COPPA', 'GDPR', 'Section 508', 'ADA'],
    'Energy/Utilities': ['NERC CIP', 'EPA', 'FERC', 'OSHA', 'ISO 50001'],
    'Default': ['General Business License', 'State Registration', 'Tax Compliance', 'Employment Law']
  };

  const templates: Record<string, Template> = {
    default: {
      name: 'Standard Business Plan',
      description: 'Comprehensive business plan template',
      icon: '📋',
      fields: ['businessName', 'industry', 'executiveSummary', 'problemStatement', 'solution', 'marketAnalysis', 'businessModel', 'marketingStrategy', 'operationsPlan', 'managementTeam', 'financialProjections', 'fundingRequest']
    },
    startup: {
      name: 'Startup Pitch Plan',
      description: 'Focus on innovation and scalability',
      icon: '🚀',
      fields: ['businessName', 'industry', 'problemStatement', 'solution', 'marketAnalysis', 'businessModel', 'fundingRequest', 'technicalRequirements']
    },
    saas: {
      name: 'SaaS Business Plan',
      description: 'Software-as-a-Service focused plan',
      icon: '💻',
      fields: ['businessName', 'industry', 'executiveSummary', 'problemStatement', 'solution', 'technicalRequirements', 'securityConsiderations', 'integrationNeeds', 'businessModel', 'marketingStrategy', 'financialProjections']
    },
    ecommerce: {
      name: 'E-commerce Plan',
      description: 'Online retail business plan',
      icon: '🛒',
      fields: ['businessName', 'industry', 'executiveSummary', 'marketAnalysis', 'solution', 'operationsPlan', 'marketingStrategy', 'technicalRequirements', 'financialProjections']
    },
    nonprofit: {
      name: 'Non-Profit Plan',
      description: 'Mission-driven organization plan',
      icon: '🤝',
      fields: ['businessName', 'industry', 'executiveSummary', 'problemStatement', 'solution', 'operationsPlan', 'managementTeam', 'fundingRequest']
    }
  };

  const exportOptions = [
    { name: 'PDF Document', icon: '📄', format: 'pdf' },
    { name: 'HTML Page', icon: '🌐', format: 'gdocs' },
    { name: 'Markdown File', icon: '📄', format: 'md' },
    { name: 'Word Document', icon: '📃', format: 'docx' }
  ];

  const fieldLabels = {
    businessName: 'Business Name',
    industry: 'Industry',
    complianceType: 'Compliance Requirements',
    executiveSummary: 'Executive Summary',
    problemStatement: 'Problem Statement',
    solution: 'Solution & Value Proposition',
    marketAnalysis: 'Market Analysis',
    businessModel: 'Business Model',
    marketingStrategy: 'Marketing & Sales Strategy',
    operationsPlan: 'Operations Plan',
    managementTeam: 'Management Team',
    financialProjections: 'Financial Projections',
    fundingRequest: 'Funding Request',
    technicalRequirements: 'Technical Requirements',
    securityConsiderations: 'Security Considerations',
    integrationNeeds: 'Integration Requirements'
  };

  const fieldPlaceholders = {
    businessName: 'Enter your business name...',
    executiveSummary: 'Provide a brief overview of your business, mission, and key success factors...',
    problemStatement: 'Describe the problem your business solves and the market need...',
    solution: 'Explain your product/service and how it addresses the problem uniquely...',
    marketAnalysis: 'Analyze your target market, size, trends, and competitive landscape...',
    businessModel: 'Describe how your business makes money, pricing strategy, revenue streams...',
    marketingStrategy: 'Outline your marketing channels, customer acquisition strategy, and sales process...',
    operationsPlan: 'Detail your operational workflow, suppliers, location, and day-to-day operations...',
    managementTeam: 'Introduce key team members, their roles, and relevant experience...',
    financialProjections: 'Include revenue forecasts, expense projections, break-even analysis...',
    fundingRequest: 'Specify funding amount needed, how funds will be used, and expected returns...',
    technicalRequirements: 'List technology stack, infrastructure needs, development resources...',
    securityConsiderations: 'Outline data protection, cybersecurity measures, and privacy policies...',
    integrationNeeds: 'Describe third-party integrations, APIs, and system compatibility requirements...'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateKey: string) => {
    setCurrentTemplate(templateKey);
    setShowTemplateLibrary(false);
    
    // Clear form data when switching templates
    const newFormData = { ...formData };
    Object.keys(newFormData).forEach(key => {
      if (!templates[templateKey].fields.includes(key) && key !== 'businessName' && key !== 'industry' && key !== 'complianceType') {
        newFormData[key] = '';
      }
    });
    setFormData(newFormData);
  };

  const savePlan = () => {
    const planName = formData.businessName || 'Untitled Plan';
    const timestamp = new Date().toISOString();
    
    const newPlan = {
      id: Date.now().toString(),
      name: planName,
      template: currentTemplate,
      data: formData,
      generatedPlan,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    setSavedPlans(prev => [newPlan, ...prev]);
    showToast('Plan saved successfully!', 'success');
  };

  const loadPlan = (plan: SavedPlan) => {
    setFormData(plan.data);
    setGeneratedPlan(plan.generatedPlan);
    setCurrentTemplate(plan.template);
    setShowSavedPlans(false);
  };

  const deletePlan = (planId: string) => {
    setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  const generateBusinessPlan = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedPlan('');
    
    const relevantFields = templates[currentTemplate].fields.filter(field => 
      formData[field] && formData[field].trim() !== ''
    );
    
    const formContent = relevantFields.map(field => 
      `${fieldLabels[field as keyof typeof fieldLabels]}: ${(formData as any)[field]}`
    ).join('\n\n');
    
    const complianceInfo = formData.complianceType ? `\nCompliance Requirements: ${formData.complianceType}` : '';
    const technicalInfo = formData.technicalRequirements ? `\nTechnical Requirements: ${formData.technicalRequirements}` : '';
    const securityInfo = formData.securityConsiderations ? `\nSecurity Considerations: ${formData.securityConsiderations}` : '';
    const integrationInfo = formData.integrationNeeds ? `\nIntegration Needs: ${formData.integrationNeeds}` : '';

    const prompt = `Create a comprehensive business plan based on this information:

${formContent}${complianceInfo}${technicalInfo}${securityInfo}${integrationInfo}

Format the business plan using proper markdown with the following structure:

# Business Plan: ${formData.businessName || '[Business Name]'}

## Executive Summary
Brief overview highlighting key points, mission, and value proposition.

## Problem Statement
Clear definition of the problem being solved and market opportunity.

## Solution & Value Proposition
Detailed description of the solution and unique value offered.

## Market Analysis
Target market, size, trends, and competitive landscape analysis.

## Business Model
Revenue streams, pricing strategy, and how the business makes money.

## Marketing & Sales Strategy
Customer acquisition, marketing channels, and sales process.

## Operations Plan
Day-to-day operations, workflow, resources, and logistics.

## Management Team
Key personnel, roles, experience, and organizational structure.

## Technology & Technical Requirements
Technical infrastructure, development needs, and technology stack.

## Security & Compliance
Data protection measures, regulatory compliance, and security protocols.

## Financial Projections
Revenue forecasts, expense projections, and financial milestones.

## Funding Requirements
Capital needed, use of funds, and expected returns for investors.

## Risk Analysis
Potential risks, mitigation strategies, and contingency plans.

## Implementation Timeline
Key milestones, phases, and timeline for business launch and growth.

## Appendices
Supporting documents, charts, and additional relevant information.

Make it professional, detailed, and actionable. Include specific recommendations and next steps where appropriate.`;

    try {
      const aiClient = AIClient.getInstance();
      
      const context = `Business Information:\n${formContent}${complianceInfo}${technicalInfo}${securityInfo}${integrationInfo}`;
      
      const response = await aiClient.generateResponse(prompt, context);
      
      // Simulate streaming effect
      const words = response.split(' ');
      let fullResponse = '';
      for (let i = 0; i < words.length; i++) {
        fullResponse += words[i] + ' ';
        setGeneratedPlan(fullResponse);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (err) {
      // Create a fallback business plan if AI is not available
      const fallbackResponse = `# Business Plan: ${formData.businessName || 'Your Business'}

## Executive Summary
This comprehensive business plan outlines the strategy and vision for ${formData.businessName || 'your business'} in the ${formData.industry || 'selected industry'} sector. Our mission is to provide innovative solutions that address key market needs while building a sustainable and profitable enterprise.

## Problem Statement
${formData.problemStatement || 'The market currently faces significant challenges that require innovative solutions. Our research indicates substantial opportunities for improvement in efficiency, cost reduction, and customer satisfaction.'}

## Solution & Value Proposition
${formData.solution || 'Our solution addresses these challenges through a comprehensive approach that combines cutting-edge technology with proven business practices. We offer unique value through our innovative methodology and customer-centric approach.'}

## Market Analysis
${formData.marketAnalysis || 'The target market presents significant opportunities for growth and expansion. Market research indicates strong demand for our solutions, with a total addressable market of substantial size and growing trends favoring our approach.'}

## Business Model
${formData.businessModel || 'Our revenue model is based on multiple streams including direct sales, subscription services, and strategic partnerships. Our pricing strategy is competitive while maintaining healthy margins and providing excellent value to customers.'}

## Marketing & Sales Strategy
${formData.marketingStrategy || 'Our go-to-market strategy focuses on digital marketing, direct sales, and strategic partnerships. We will leverage multiple channels to reach our target audience and build strong brand recognition in the marketplace.'}

## Operations Plan
${formData.operationsPlan || 'Our operational strategy emphasizes efficiency, scalability, and quality. We have established processes for production, delivery, customer service, and ongoing operations that support our growth objectives.'}

## Management Team
${formData.managementTeam || 'Our leadership team brings together extensive experience in the industry, with proven track records in business development, operations, and strategic planning. The team is well-positioned to execute our business strategy successfully.'}

## Financial Projections
${formData.financialProjections || 'Financial projections indicate strong growth potential with projected revenues increasing significantly over the next 3-5 years. Break-even is anticipated within 18-24 months, with positive cash flow following shortly thereafter.'}

## Funding Requirements
${formData.fundingRequest || 'We are seeking investment to support our growth initiatives, including product development, marketing, and operational scaling. The funding will enable us to capture market opportunities and achieve our strategic objectives.'}

## Implementation Timeline
**Phase 1 (Months 1-6):** Foundation and Setup
- Complete business registration and legal requirements
- Finalize product development and testing
- Establish initial marketing and sales processes

**Phase 2 (Months 7-12):** Market Entry
- Launch product/service to target market
- Scale marketing efforts and customer acquisition
- Build operational capacity and team

**Phase 3 (Months 13-24):** Growth and Expansion
- Expand market reach and customer base
- Optimize operations and improve efficiency
- Explore additional revenue streams and opportunities

---

**Note**: This business plan was generated using fallback content. For AI-enhanced business planning, please configure your API keys in the .env file:
- Add VITE_CLAUDE_API_KEY for Claude API access
- Or add VITE_OPENAI_API_KEY for OpenAI access

This business plan provides a roadmap for success and positions us to capitalize on market opportunities while building a sustainable and profitable enterprise.`;

      setGeneratedPlan(fallbackResponse);
      setError('AI service not configured. Using fallback business plan template. Please add your API key to .env file for enhanced AI features.');
      console.error('Error generating business plan:', err);
    }
    
    setIsGenerating(false);
  };

  const generatePitchDeck = async () => {
    if (!generatedPlan) {
      showToast('Please generate a business plan first!', 'error');
      return;
    }

    setIsGenerating(true);
    
    const pitchDeckContent = `---
# Slide 1: Title Slide
**${formData.businessName || '[Business Name]'}**
*${formData.solution ? formData.solution.substring(0, 100) + '...' : 'Innovative Solutions for Market Needs'}*
*Presented by: Management Team*
*Date: ${new Date().toLocaleDateString()}*

---
# Slide 2: Problem
*The Problem We're Solving*
- Market inefficiencies and unmet customer needs
- Current solutions lack innovation and effectiveness
- Significant opportunity for improvement and optimization

---
# Slide 3: Solution
*Our Solution*
- ${formData.solution || 'Innovative approach to solving market problems'}
- Unique value proposition and competitive advantages
- Scalable and sustainable business model

---
# Slide 4: Market Opportunity
*Market Size & Opportunity*
- Large and growing target market
- Significant revenue potential
- Favorable market trends and conditions

---
# Slide 5: Business Model
*How We Make Money*
- ${formData.businessModel || 'Multiple revenue streams and pricing strategies'}
- Sustainable unit economics
- Scalable business operations

---
# Slide 6: Marketing Strategy
*Go-to-Market Strategy*
- Multi-channel customer acquisition
- Strategic partnerships and alliances
- Brand building and market positioning

---
# Slide 7: Financial Projections
*Financial Overview*
- Strong revenue growth projections
- Path to profitability and positive cash flow
- Attractive return on investment

---
# Slide 8: Team
*Management Team*
- ${formData.managementTeam || 'Experienced leadership with proven track record'}
- Deep industry expertise and connections
- Committed to achieving business objectives

---
# Slide 9: Funding
*Investment Opportunity*
- ${formData.fundingRequest || 'Seeking strategic investment for growth'}
- Clear use of funds and expected outcomes
- Strong potential for investor returns

---
# Slide 10: Next Steps
*Call to Action*
- Ready to move forward with implementation
- Seeking strategic partners and investors
- Contact information and next steps

Thank you for your consideration!`;

    try {
      setGeneratedPlan(pitchDeckContent);
    } catch (err) {
      setError('Failed to generate pitch deck. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const handleExport = (format: string) => {
    const content = generatedPlan;
    const businessName = (formData.businessName || 'Business-Plan').replace(/[^a-zA-Z0-9]/g, '-');
    
    switch (format) {
      case 'md':
        downloadFile(content, `${businessName}.md`, 'text/markdown');
        break;
      case 'pdf':
        exportToPDF(content, businessName);
        break;
      case 'gdocs':
        exportToGoogleDocs(content, businessName);
        break;
      case 'gsheets':
        exportToGoogleSheets(content, businessName);
        break;
      case 'notion':
        exportToNotion(content, businessName);
        break;
      case 'ppt':
        exportToPowerPoint(content, businessName);
        break;
      case 'docx':
        exportToWord(content, businessName);
        break;
      default:
        downloadFile(content, `${businessName}.txt`, 'text/plain');
    }
    setShowExportMenu(false);
  };

  const exportToPDF = (content: string, filename: string) => {
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #1e40af; margin-top: 30px; }
            h3 { color: #1e3a8a; }
            p { margin-bottom: 10px; }
            ul { margin-bottom: 15px; }
            li { margin-bottom: 5px; }
            .slide-break { page-break-before: always; border-top: 2px solid #e5e7eb; margin: 40px 0 20px 0; padding-top: 20px; }
            @media print { 
              .slide-break { page-break-before: always; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${renderMarkdown(content)}
          <script>
            window.onload = function() {
              window.print();
              // Try to close after print dialog
              window.onbeforeprint = function() {};
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 100);
              };
            }
          </script>
        </body>
        </html>
      `;
      
      // Create blob and object URL for cleaner approach
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window
      const printWindow = window.open(url, '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        showToast('Please allow popups for PDF export', 'error');
        URL.revokeObjectURL(url);
        return;
      }
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('PDF export failed', 'error');
    }
  };

  const exportToGoogleDocs = (content: string, filename: string) => {
    try {
      // Convert markdown to plain text for Google Docs
      const plainTextContent = content
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/^[-*+]\s/gm, '• ') // Convert bullets
        .replace(/^\d+\.\s/gm, '1. '); // Keep numbered lists
      
      // Create HTML file for Google Docs import
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6;">
            ${renderMarkdown(content)}
          </div>
        </body>
        </html>
      `;
      
      // Create downloadable HTML file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also copy plain text to clipboard
      navigator.clipboard.writeText(plainTextContent).then(() => {
        showToast('HTML file downloaded! Upload it to Google Drive and open with Google Docs, or paste from clipboard.', 'success');
      });
      
    } catch (error) {
      console.error('Google Docs export error:', error);
      showToast('Export failed', 'error');
    }
  };

  const exportToGoogleSheets = (content: string, filename: string) => {
    // Convert business plan sections to CSV format
    const sections = content.split(/^##\s/m);
    let csvContent = 'Section,Content\n';
    
    sections.forEach(section => {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = lines[0].replace(/[#\*]/g, '').trim();
        const body = lines.slice(1).join(' ').replace(/"/g, '""').trim();
        csvContent += `"${title}","${body}"\n`;
      }
    });
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    
    // Also provide link to Google Sheets
    setTimeout(() => {
      const googleSheetsUrl = 'https://sheets.google.com/create';
      window.open(googleSheetsUrl, '_blank');
      showToast('CSV downloaded and Google Sheets opened. Import the CSV file.', 'success');
    }, 500);
  };

  const exportToNotion = (content: string, _filename: string) => {
    // Copy content and provide Notion instructions
    navigator.clipboard.writeText(content).then(() => {
      const notionUrl = 'https://www.notion.so/';
      window.open(notionUrl, '_blank');
      showToast('Content copied to clipboard. In Notion: Create a new page, then paste to import.', 'success');
    });
  };

  const exportToPowerPoint = (content: string, filename: string) => {
    // Convert to a structured format for PowerPoint
    const slides = content.split('---').filter((slide: string) => slide.trim());
    let pptContent = `${filename} - Presentation Outline\n\n`;
    
    slides.forEach((slide: string, index: number) => {
      const lines = slide.trim().split('\n');
      const title = lines.find((line: string) => line.startsWith('#'))?.replace(/^#+\s*/, '') || `Slide ${index + 1}`;
      pptContent += `SLIDE ${index + 1}: ${title}\n`;
      pptContent += '='.repeat(50) + '\n';
      
      lines.forEach((line: string) => {
        if (!line.startsWith('#')) {
          pptContent += line + '\n';
        }
      });
      pptContent += '\n\n';
    });
    
    downloadFile(pptContent, `${filename}-presentation-outline.txt`, 'text/plain');
    showToast('Presentation outline downloaded. Copy content into PowerPoint slides.', 'success');
  };

  const exportToWord = (content: string, filename: string) => {
    // Create RTF format which can be opened by Word
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${content.replace(/\n/g, '\\par ')
  .replace(/\*\*(.*?)\*\*/g, '{\\b $1}')
  .replace(/\*(.*?)\*/g, '{\\i $1}')
  .replace(/^# (.*$)/gm, '{\\fs32\\b $1}\\par ')
  .replace(/^## (.*$)/gm, '{\\fs28\\b $1}\\par ')
  .replace(/^### (.*$)/gm, '{\\fs24\\b $1}\\par ')}}`;
    
    downloadFile(rtfContent, `${filename}.rtf`, 'application/rtf');
    showToast('RTF file downloaded. Can be opened in Microsoft Word.', 'success');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPlan);
    showToast('Copied to clipboard!', 'success');
  };

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    
    // Simple markdown to HTML conversion - let prose handle the styling
    let html = text
      .replace(/^---$/gm, '<hr>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/(<li.*?<\/li>)/gs, '<ul>$1</ul>');

    return `<p>${html}</p>`;
  };


  const themeClasses = isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white' 
    : 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 text-gray-900';

  const cardClasses = isDarkMode
    ? 'bg-gray-800/80 border-gray-700/50'
    : 'bg-white/80 border-white/50';

  const inputClasses = isDarkMode
    ? 'bg-gray-700/90 border-gray-600/50 text-white placeholder-gray-400 focus:ring-pink-500/50 focus:border-pink-500/50'
    : 'bg-white/90 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:ring-pink-500/50 focus:border-pink-500/50';

  return (
    <>
      <style>{`
        @keyframes slideUpIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      
      <div className={`h-screen ${themeClasses} flex flex-col lg:flex-row overflow-hidden relative transition-all duration-300`} style={{ scrollBehavior: 'smooth' }}>
      {/* Mobile Chatbot Full-Screen Overlay */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isClosingChatbot ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              animation: !isClosingChatbot ? 'fadeIn 0.3s ease-out forwards' : undefined
            }}
            onClick={handleCloseChatbot}
          />
          {/* Sliding Drawer */}
          <div 
            className={`absolute inset-x-0 bottom-0 h-full flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'} transition-transform duration-300 ease-out ${
              isClosingChatbot ? 'translate-y-full' : 'translate-y-0'
            }`}
            style={{
              transform: isClosingChatbot ? 'translateY(100%)' : 'translateY(0)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              animation: !isClosingChatbot ? 'slideUpIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' : undefined,
              // Start from bottom initially
              ...(showChatbot && !isClosingChatbot && { transform: 'translateY(0)' })
            }}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg">
              <button
                onClick={handleCloseChatbot}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold">✨ AI Business Assistant</h1>
              <div className="w-10 h-10" /> {/* Spacer for balance */}
            </div>
            
            {/* Mobile Chat Messages */}
            <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-3">
              {chatMessages.length > 0 ? (
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl shadow-lg ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : isDarkMode 
                              ? 'bg-gray-800 text-gray-100 border border-gray-700'
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm leading-relaxed">
                          {message.type === 'user' ? (
                            message.message
                          ) : (
                            <div 
                              className={`prose prose-sm max-w-none ${
                                isDarkMode 
                                  ? 'prose-invert prose-headings:text-gray-200 prose-strong:text-gray-100 prose-p:text-gray-200'
                                  : 'prose-headings:text-gray-800 prose-strong:text-gray-900 prose-p:text-gray-800'
                              } prose-ul:my-1 prose-li:my-0`}
                              dangerouslySetInnerHTML={{ __html: renderChatMessage(message.message) }}
                            />
                          )}
                        </div>
                        <div className={`text-xs mt-2 opacity-70 ${
                          message.type === 'user' 
                            ? 'text-pink-100' 
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h4 className={`font-semibold mb-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Welcome! I'm your AI business assistant.
                  </h4>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    I can help you with:
                  </p>
                  <div className="grid grid-cols-1 gap-3 text-sm max-w-sm mx-auto">
                    <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      • Compliance research for your industry
                    </div>
                    <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      • Business name suggestions with domains
                    </div>
                    <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      • Market analysis and insights
                    </div>
                    <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      • Financial projections and funding advice
                    </div>
                  </div>
                </div>
              )}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Fixed Input Bar */}
            <div className={`p-4 pb-6 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyPress}
                  placeholder="Ask me anything about your business plan..."
                  className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 text-sm transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  disabled={isChatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-all text-sm font-medium shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Simplified background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-300/20 rounded-full filter blur-xl opacity-50"></div>
        <div className="absolute top-0 right-20 w-72 h-72 bg-purple-300/20 rounded-full filter blur-xl opacity-50"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300/20 rounded-full filter blur-xl opacity-50"></div>
      </div>

      {/* Left Side - Input Section */}
      <div className="w-full lg:w-1/2 p-6 overflow-y-auto relative z-20">
        {/* Header with branding */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                Kiernan [ai]
              </h1>
              <h2 className="text-2xl font-semibold mb-2">Business Plan Creator</h2>
              <p className="text-sm opacity-80">Transform your ideas into comprehensive business plans</p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${aiStatus.loading ? 'bg-yellow-500' : aiStatus.isConfigured ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                <span className="text-xs opacity-70">
                  AI: {aiStatus.loading ? 'Checking...' : aiStatus.isConfigured ? `${aiStatus.provider} Connected` : 'Not Configured'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg backdrop-blur-sm border transition-colors ${cardClasses}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowSavedPlans(!showSavedPlans)}
                className={`p-2 rounded-lg backdrop-blur-sm border transition-colors ${cardClasses}`}
              >
                <FolderOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowChatbot(!showChatbot);
                }}
                className={`p-2 rounded-lg backdrop-blur-sm border transition-colors relative ${cardClasses} ${showChatbot ? 'bg-pink-500 text-white' : ''}`}
                title="AI Assistant"
              >
                <MessageCircle className="w-5 h-5" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${aiStatus.isConfigured ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Template Library Modal */}
        {showTemplateLibrary && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`${cardClasses} backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border`}>
              <h3 className="text-xl font-bold mb-4">Choose Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateSelect(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      currentTemplate === key 
                        ? 'border-pink-500 bg-pink-50/20' 
                        : `border-gray-300/50 hover:border-pink-300 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'}`
                    }`}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="font-semibold mb-1">{template.name}</div>
                    <div className="text-sm opacity-75">{template.description}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTemplateLibrary(false)}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Saved Plans Modal */}
        {showSavedPlans && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`${cardClasses} backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border`}>
              <h3 className="text-xl font-bold mb-4">Saved Plans</h3>
              {savedPlans.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No saved plans yet</p>
              ) : (
                <div className="space-y-3">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className={`p-4 rounded-lg border ${cardClasses} flex items-center justify-between`}>
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-sm opacity-75">
                          {templates[plan.template]?.name} • {new Date(plan.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadPlan(plan)}
                          className="p-2 text-blue-600 hover:bg-blue-50/20 rounded transition-colors"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-2 text-red-600 hover:bg-red-50/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowSavedPlans(false)}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg backdrop-blur-lg border transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500/90 text-white border-green-400' 
              : 'bg-red-500/90 text-white border-red-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Main Form */}
        <div className={`${cardClasses} backdrop-blur-lg rounded-xl shadow-xl border p-6`}>
          {/* Template Controls */}
          <div className="mb-6">
            <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Template Selection</label>
            <button
              onClick={() => setShowTemplateLibrary(true)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">{templates[currentTemplate].name}</div>
                  <div className="text-xs opacity-90">{templates[currentTemplate].description}</div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click to browse and select different business plan templates</p>
          </div>

          {/* Sectioned Form Fields */}
          <div className="space-y-4">
            {Object.entries(formSections).map(([sectionKey, section]) => {
              const relevantFields = section.fields.filter(field => 
                templates[currentTemplate].fields.includes(field) || ['businessName', 'industry', 'complianceType'].includes(field)
              );
              
              if (relevantFields.length === 0) return null;
              
              return (
                <div key={sectionKey} className={`border rounded-lg transition-all ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50/20 transition-colors rounded-t-lg"
                  >
                    <h3 className="font-bold text-lg">{section.title}</h3>
                    {expandedSections[sectionKey] ? (
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 transition-transform" />
                    )}
                  </button>
                  
                  {expandedSections[sectionKey] && (
                    <div className="px-4 pb-4 space-y-4 border-t">
                      {relevantFields.map(field => (
                        <div key={field} className="mt-4">
                          <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {fieldLabels[field as keyof typeof fieldLabels]}
                          </label>
                          {field === 'industry' ? (
                            <select
                              id={`field-${field}`}
                              name={field}
                              value={(formData as any)[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-3 py-2 backdrop-blur-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${inputClasses}`}
                            >
                              <option value="">Select Industry</option>
                              {industries.map(industry => (
                                <option key={industry} value={industry}>{industry}</option>
                              ))}
                            </select>
                          ) : field === 'complianceType' && formData.industry && complianceTypes[formData.industry] ? (
                            <select
                              id={`field-${field}`}
                              name={field}
                              value={(formData as any)[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-3 py-2 backdrop-blur-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${inputClasses}`}
                            >
                              <option value="">Select Compliance Type</option>
                              {(complianceTypes[formData.industry] || complianceTypes.Default).map((compliance: string) => (
                                <option key={compliance} value={compliance}>{compliance}</option>
                              ))}
                            </select>
                          ) : field === 'businessName' ? (
                            <input
                              type="text"
                              id={`field-${field}`}
                              name={field}
                              value={(formData as any)[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-3 py-2 backdrop-blur-sm border rounded-md focus:outline-none focus:ring-2 transition-all ${inputClasses}`}
                              placeholder={fieldPlaceholders[field as keyof typeof fieldPlaceholders]}
                            />
                          ) : (
                            <textarea
                              id={`field-${field}`}
                              name={field}
                              value={(formData as any)[field]}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              className={`w-full px-3 py-2 backdrop-blur-sm border rounded-md focus:outline-none focus:ring-2 resize-none transition-all ${inputClasses}`}
                              rows={3}
                              placeholder={fieldPlaceholders[field as keyof typeof fieldPlaceholders]}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Generation Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={generateBusinessPlan}
              disabled={isGenerating || !formData.businessName || !formData.industry}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Business Plan
                </>
              )}
            </button>
            
            {generatedPlan && (
              <button
                onClick={generatePitchDeck}
                disabled={isGenerating}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg"
              >
                <Edit3 className="w-4 h-4" />
                Pitch Deck
              </button>
            )}
            
            <button
              onClick={savePlan}
              disabled={!formData.businessName}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>

          {error && (
            <p className={`text-sm mt-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          )}
        </div>
      </div>

      {/* Right Side - Split Pane View */}
      <SplitPaneView
        generatedPlan={generatedPlan}
        chatMessages={chatMessages}
        isChatLoading={isChatLoading}
        isGenerating={isGenerating}
        isDarkMode={isDarkMode}
        showExportMenu={showExportMenu}
        chatInput={chatInput}
        showChatbot={showChatbot}
        onChatInputChange={setChatInput}
        onSendMessage={sendChatMessage}
        onChatKeyPress={handleChatKeyPress}
        onCopyToClipboard={copyToClipboard}
        onExportMenuToggle={() => setShowExportMenu(!showExportMenu)}
        onExport={handleExport}
        exportOptions={exportOptions}
        renderMarkdown={renderMarkdown}
        renderChatMessage={renderChatMessage}
      />
    </div>

    {/* API Key Configuration Modal */}
    {showApiKeyModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-md w-full rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">API Key Required</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Developer mode is disabled. Please enter your API key.
                </p>
              </div>
            </div>

            <ApiKeyForm
              isDarkMode={isDarkMode}
              userApiKeys={userApiKeys}
              onSave={handleSaveApiKeys}
              onCancel={() => setShowApiKeyModal(false)}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default BusinessPlanCreator;