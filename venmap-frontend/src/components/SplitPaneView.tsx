import React, { useState, useEffect, useRef } from 'react';
import { Bot, Copy, Download, ChevronDown, Send, FileText, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface ExportOption {
  format: string;
  name: string;
  icon: string;
}

interface SplitPaneViewProps {
  // Content props
  generatedPlan: string;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isGenerating: boolean;
  
  // UI state
  isDarkMode: boolean;
  showExportMenu: boolean;
  chatInput: string;
  showChatbot: boolean;
  
  // Event handlers
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  onChatKeyPress: (e: React.KeyboardEvent) => void;
  onCopyToClipboard: () => void;
  onExportMenuToggle: () => void;
  onExport: (format: string) => void;
  
  // Data
  exportOptions: ExportOption[];
  renderMarkdown: (text: string) => string;
  renderChatMessage: (text: string) => string;
}

export const SplitPaneView: React.FC<SplitPaneViewProps> = ({
  generatedPlan,
  chatMessages,
  isChatLoading,
  isGenerating,
  isDarkMode,
  showExportMenu,
  chatInput,
  showChatbot,
  onChatInputChange,
  onSendMessage,
  onChatKeyPress,
  onCopyToClipboard,
  onExportMenuToggle,
  onExport,
  exportOptions,
  renderMarkdown,
  renderChatMessage
}) => {
  // Split pane state
  const [splitPaneHeight, setSplitPaneHeight] = useState(60); // percentage for plan section (top)
  const [isDragging, setIsDragging] = useState(false);
  
  // Chat auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const cardClasses = isDarkMode
    ? 'bg-gray-800/80 border-gray-700/50'
    : 'bg-white/80 border-white/50';

  // Split pane drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const rightPanel = document.querySelector('.split-pane-container');
    if (!rightPanel) return;
    
    const rect = rightPanel.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = (relativeY / rect.height) * 100;
    
    // Constrain between 20% and 80%
    const newHeight = Math.max(20, Math.min(80, percentage));
    setSplitPaneHeight(newHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Auto-scroll to bottom when new messages arrive or when loading
  useEffect(() => {
    if (showChatbot && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, showChatbot]);

  const showContent = generatedPlan || chatMessages.length > 0;

  return (
    <div className={`w-full lg:w-1/2 ${cardClasses} backdrop-blur-lg border-l border-white/50 flex flex-col relative z-5 hidden lg:flex split-pane-container`}>
      {showContent ? (
        <>
          {/* PLAN SECTION - Full height when chat hidden, split when chat visible */}
          <div 
            className="flex flex-col relative"
            style={{ height: showChatbot ? `${splitPaneHeight}%` : '100%' }}
          >
            {/* Plan Header */}
            <div className={`border-b border-white/50 p-4 flex items-center justify-between ${cardClasses} backdrop-blur-sm shrink-0`}>
              <h3 className="font-semibold">Generated Plan</h3>
              <div className="flex gap-2">
                {generatedPlan && (
                  <>
                    <button
                      onClick={onCopyToClipboard}
                      className={`p-2 rounded-md transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/20' 
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/20'
                      }`}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={onExportMenuToggle}
                        className={`p-2 rounded-md transition-colors flex items-center gap-1 ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-green-400 hover:bg-green-500/20' 
                            : 'text-gray-600 hover:text-green-600 hover:bg-green-50/20'
                        }`}
                        title="Export options"
                      >
                        <Download className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {showExportMenu && (
                        <div className={`absolute right-0 top-full mt-1 ${cardClasses} backdrop-blur-lg rounded-lg border shadow-lg py-2 z-10 min-w-48`}>
                          {exportOptions.map(option => (
                            <button
                              key={option.format}
                              onClick={() => onExport(option.format)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100/20 transition-colors flex items-center gap-2"
                            >
                              <span>{option.icon}</span>
                              {option.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Plan Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              {generatedPlan ? (
                <div 
                  className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedPlan) }}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    {isGenerating ? (
                      <Loader2 className="w-12 h-12 mx-auto text-pink-500 animate-spin" />
                    ) : (
                      <FileText className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isGenerating 
                      ? 'Generating your business plan...' 
                      : 'Your business plan will appear here after generation'
                    }
                  </p>
                  {isGenerating && (
                    <div className={`flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Draggable Divider - Only show when chat is visible */}
          {showChatbot && (
            <div
              onMouseDown={handleMouseDown}
              className={`h-4 cursor-row-resize flex items-center justify-center border-y-2 border-pink-500/50 ${
                isDragging ? 'bg-pink-500/40 border-pink-400' : isDarkMode ? 'bg-gray-700/50 hover:bg-pink-500/30 hover:border-pink-400' : 'bg-gray-200/50 hover:bg-pink-500/30 hover:border-pink-400'
              } transition-all duration-200 group`}
            >
              <div className="w-12 h-1 bg-pink-500 rounded-full group-hover:bg-pink-400 group-hover:w-16 transition-all duration-200"></div>
            </div>
          )}

          {/* CHAT SECTION (BOTTOM) - Only show when chat is visible */}
          {showChatbot && (
            <div 
              className="flex flex-col"
              style={{ height: `${100 - splitPaneHeight}%` }}
            >
            {/* Chat Header */}
            <div className={`border-b border-white/50 p-4 flex items-center justify-between ${cardClasses} backdrop-blur-sm shrink-0`}>
              <h3 className="font-semibold">✨ AI Assistant</h3>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
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
                              : 'bg-white text-gray-900 border border-gray-200'
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
                  <div className="grid grid-cols-1 gap-2 text-sm max-w-sm mx-auto">
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
                  <div className={`p-3 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll target */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input - ChatGPT style */}
            <div className={`p-4 border-t shrink-0 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => onChatInputChange(e.target.value)}
                    onKeyDown={onChatKeyPress}
                    placeholder="Ask me anything about your business plan..."
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 text-sm transition-all resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '120px',
                      height: 'auto',
                    }}
                    disabled={isChatLoading}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={onSendMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg flex-shrink-0"
                  style={{ height: '44px', width: '44px' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className={`w-24 h-24 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Generate your business plan
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Fill out the form and click "Generate Business Plan" to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
};