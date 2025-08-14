import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ArrowUp, Copy, RotateCcw, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

interface ChatInterfaceProps {}

const MODELS = [
  { 
    id: 'openai/gpt-oss-20b:free', 
    name: 'Super Neura',
    description: 'Super fast response and super detail information',
    color: 'bg-blue-600',
  },
  { 
    id: 'moonshotai/kimi-k2:free', 
    name: 'Neura Code',
    description: 'Code and Math logic solutions',
    color: 'bg-cyan-500',
  },
  { 
    id: 'z-ai/glm-4.5-air:free', 
    name: 'Neura Air',
    description: 'Very efficient model for general and daily tasks.',
    color: 'bg-emerald-500',
  },
  { 
    id: 'qwen/qwen3-235b-a22b:free', 
    name: 'Neura Thinking',
    description: 'Advanced searching and thinking for complex reasoning',
    color: 'bg-lime-500',
  }
];

const API_KEY = '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';

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Detect system color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    // Set initial mode
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Close model dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const WelcomeArea = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4">
            Hello, I'm Neura
          </h1>
        </div>
        <div className="p-1 rounded-2xl backdrop-blur-sm border-gray-300">
          <p className="text-xl font-semibold mb-4">
            Ask me anything, I'm here to help
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {MODELS.map((model) => (
              <div 
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                  selectedModel === model.id 
                    ? isDarkMode 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/20'
                    : isDarkMode 
                      ? 'border-gray-700 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{model.name}</span>
                </div>
                <p className={`flex items-center gap-2 mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {model.description}
                </p>
              </div>
            ))}
          </div>
          <div className={`text-sm opacity-60 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Select a model above and start chatting...
          </div>
        </div>
      </div>
    </div>
  );
};

  const createNewMessage = () => {
    setMessages([]);       
    setIsFirstLoad(true);  
    setInput('');
  };

  const TypingDots: React.FC = () => {
    return (
      <span className="inline-flex items-center ml-2">
        <span 
          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-75"
          style={{
            animationDelay: '0ms',
            animationDuration: '1200ms'
          }}
        ></span>
        <span 
          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-75 ml-1"
          style={{
            animationDelay: '200ms',
            animationDuration: '1200ms'
          }}
        ></span>
        <span 
          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-75 ml-1"
          style={{
            animationDelay: '400ms',
            animationDuration: '1200ms'
          }}
        ></span>
      </span>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  };

  // Enhanced auto-scroll with throttle for smooth performance
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const smoothScrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set a small delay to batch scroll updates
      scrollTimeoutRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 16); // ~60fps
    }
  };

  // Check if user has scrolled up manually
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  useLayoutEffect(() => {
    smoothScrollToBottom();
  }, [messages, shouldAutoScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsFirstLoad(true);
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const getChatHistory = () => {
    return messages
      .filter(msg => !msg.isGenerating)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsFirstLoad(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add generating message
    const generatingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, generatingMessage]);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...getChatHistory(), { role: 'user', content: content }],
          temperature: 0.4,
          max_tokens: 4096,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === generatingMessage.id
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // Finalize the message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === generatingMessage.id 
            ? { ...msg, isGenerating: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => 
        prev.filter(msg => msg.id !== generatingMessage.id)
      );
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '**Error**: Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage && previousUserMessage.role === 'user') {
      // Remove the assistant message and regenerate
      setMessages(prev => prev.slice(0, messageIndex));
      sendMessage(previousUserMessage.content);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MarkdownRenderer: React.FC<{ content: string; isGenerating: boolean }> = ({ content, isGenerating }) => {
    // Fix <br> tags in markdown content
    const processedContent = content.replace(/<br\s*\/?>/gi, '\n');
    
    return (
      <div className="prose prose-sm max-w-none font-sf-pro">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && language) {
                return (
                  <div className="relative">
                    <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {language}
                    </div>
                    <SyntaxHighlighter
                      style={isDarkMode ? oneDark : oneLight}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !mt-0 !mb-4"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              
              return (
                <code 
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-200' 
                      : 'bg-gray-200 text-gray-900'
                  }`} 
                  {...props}
                >
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className={`text-lg font-bold mb-3 font-sf-pro ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-base font-semibold mb-2 font-sf-pro ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-sm font-semibold mb-2 font-sf-pro ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className={`mb-2 leading-relaxed text-sm font-sf-pro ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className={`mb-2 ml-4 space-y-1 text-sm font-sf-pro ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className={`mb-2 ml-4 space-y-1 text-sm font-sf-pro ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed text-sm font-sf-pro">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className={`border-l-4 pl-4 py-2 my-3 italic text-sm font-sf-pro ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800 text-gray-300' 
                  : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}>
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className={`min-w-full border-collapse text-sm font-sf-pro ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className={`border px-3 py-2 text-left font-semibold text-xs font-sf-pro ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800 text-gray-200' 
                  : 'border-gray-300 bg-gray-200 text-gray-800'
              }`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`border px-3 py-2 text-xs font-sf-pro ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-900 text-gray-200' 
                  : 'border-gray-300 bg-gray-100 text-gray-700'
              }`}>
                {children}
              </td>
            ),
            strong: ({ children }) => (
              <strong className={`font-bold text-sm font-sf-pro ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className={`italic text-sm font-sf-pro ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {children}
              </em>
            ),
            // Handle line breaks properly
            br: () => <br />
          }}
        >
          {processedContent}
        </ReactMarkdown>
        {isGenerating && <TypingDots />}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 font-sf-pro ${
      isDarkMode ? 'bg-[rgb(21_21_21)] text-white' : 'bg-gray-50 text-gray-900'
    }`} style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'
    }}>
      {/* Header */}
      <header className={`border-b px-4 py-3 shadow-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-[rgb(15_15_15)] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Neura GPT</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* New Chat Button */}
            <div className="relative group">
              <button
                onClick={createNewMessage}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
              }`}>
                New chat
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {isFirstLoad && messages.length <= 1 ? (
          <WelcomeArea />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group ${
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 relative transition-all duration-300 ${
                    message.role === 'user'
                      ? isDarkMode 
                        ? 'bg-[rgb(15_15_15)] text-white' 
                        : 'bg-gray-200 text-gray-900'
                      : isDarkMode 
                        ? 'text-gray-100' 
                        : 'text-gray-800 shadow-xs'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-sm font-semibold font-sf-pro">
                      {message.content}
                    </div>
                  ) : (
                    <MarkdownRenderer 
                      content={message.content} 
                      isGenerating={message.isGenerating || false} 
                    />
                  )}
                  
                  {/* Message Actions */}
                  {message.role === 'assistant' && !message.isGenerating && message.content && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-opacity-20 border-current opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => regenerateMessage(message.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                        title="Regenerate response"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t px-4 py-6 transition-colors duration-300 ${
        isDarkMode ? 'border-gray-900' : 'border-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Input Box with Simplified Design */}
          <div className={`flex items-center gap-4 rounded-full px-5 py-4 transition-all duration-300 backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-[rgba(40,44,52,0.95)] border border-gray-700 shadow-xl' 
              : 'bg-[rgba(255,255,255,0.95)] border border-gray-300 shadow-lg'
          }`}>

            
            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className={`flex-1 border-none outline-none resize-none bg-transparent text-base leading-tight py-1 ${
                isDarkMode 
                  ? 'text-white placeholder-gray-400 placeholder-opacity-70' 
                  : 'text-gray-800 placeholder-gray-500 placeholder-opacity-80'
              }`}
              rows={1}
              disabled={isLoading}
            />

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Model Selection Button */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors duration-300 focus:outline-none ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                  title="Select Model"
                >
                  <div className={`w-3 h-3 rounded-full ${MODELS.find(m => m.id === selectedModel)?.color}`}></div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Model Dropdown */}
                {isModelDropdownOpen && (
                  <div className={`absolute bottom-full right-0 mb-6 w-60 origin-bottom-right rounded-xl shadow-xl py-2 z-20 backdrop-blur-md ${
                    isDarkMode 
                      ? 'bg-[rgba(40,44,52,0.98)] border border-gray-700' 
                      : 'bg-[rgba(255,255,255,0.98)] border border-gray-200'
                  }`}>
                    {MODELS.map(model => (
                      <div 
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${
                          selectedModel === model.id 
                            ? isDarkMode 
                              ? 'bg-gray-700' 
                              : 'bg-blue-50' 
                            : isDarkMode 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${model.color}`}></div>
                          <div>
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className={`text-xs mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {model.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Button (when there's text) */}
              {input.trim() && (
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isLoading
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
