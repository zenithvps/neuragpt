import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ArrowUp, Copy, RotateCcw, Check, Sparkles, Mic, Paperclip, Send } from 'lucide-react';
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
  const [isInputFocused, setIsInputFocused] = useState(false);
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
      <div className="relative flex flex-col items-center justify-center h-full box-border px-4 py-12 text-center">
        {/* Enhanced Welcome Area Blobs - Much More Coverage */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* Primary Large Blobs */}
          <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/25 via-purple-500/20 to-pink-500/25 blur-3xl animate-pulse"></div>
          <div className="absolute right-10 top-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
          <div className="absolute left-10 top-40 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-3xl"></div>
          
          {/* Secondary Medium Blobs */}
          <div className="absolute right-1/4 bottom-20 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-emerald-500/15 via-cyan-500/15 to-blue-500/15 blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute left-1/4 bottom-32 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-pink-500/18 via-purple-500/15 to-blue-500/18 blur-2xl"></div>
          <div className="absolute top-1/2 left-0 w-[320px] h-[320px] rounded-full bg-gradient-to-br from-lime-500/12 to-emerald-500/12 blur-2xl"></div>
          <div className="absolute top-1/2 right-0 w-[320px] h-[320px] rounded-full bg-gradient-to-bl from-orange-500/12 to-red-500/12 blur-2xl"></div>
          
          {/* Tertiary Small Accent Blobs */}
          <div className="absolute top-16 left-20 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-20 right-24 w-[180px] h-[180px] rounded-full bg-gradient-to-bl from-teal-500/12 to-cyan-500/12 blur-xl"></div>
          <div className="absolute bottom-16 left-16 w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-rose-500/10 to-pink-500/10 blur-xl animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-20 right-20 w-[190px] h-[190px] rounded-full bg-gradient-to-tl from-indigo-500/12 to-blue-500/12 blur-xl"></div>
          
          {/* Corner Fill Blobs */}
          <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-400/8 to-purple-400/8 blur-2xl"></div>
          <div className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full bg-gradient-to-bl from-pink-400/8 to-red-400/8 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-green-400/8 to-emerald-400/8 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-[290px] h-[290px] rounded-full bg-gradient-to-tl from-cyan-400/8 to-blue-400/8 blur-2xl"></div>
          
          {/* Floating Mid-Screen Blobs */}
          <div className="absolute top-1/3 left-1/3 w-[150px] h-[150px] rounded-full bg-gradient-to-r from-yellow-400/8 to-orange-400/8 blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-2/3 right-1/3 w-[160px] h-[160px] rounded-full bg-gradient-to-l from-purple-400/10 to-indigo-400/10 blur-lg"></div>
          <div className="absolute top-1/4 right-1/4 w-[140px] h-[140px] rounded-full bg-gradient-to-br from-teal-400/9 to-green-400/9 blur-lg animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-[170px] h-[170px] rounded-full bg-gradient-to-tr from-rose-400/9 to-pink-400/9 blur-lg"></div>
        </div>
        
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            Hello, I'm Neura
          </h1>
          <p className={`mt-2 text-xs font-bold text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Ask anything. Get answers, code, and ideas instantly.
          </p>
          
          {/* Enhanced Mobile-Responsive Model Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 mt-6 max-w-full">
            {MODELS.map((model) => (
              <div 
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer text-left ${
                selectedModel === model.id
                    ? isDarkMode 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-500/5' 
                      : 'bg-blue-50/80 border-blue-500 shadow-lg shadow-blue-500/20'
                    : isDarkMode 
                      ? 'border-gray-700 hover:border-gray-600 bg-white/5' 
                      : 'bg-white/60 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${model.color}`}></div>
                  <span className="font-bold text-xs sm:text-sm">{model.name}</span>
                </div>
                <p className={`text-xs sm:text-xs leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {model.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Mobile-Responsive Quick Suggestions */}
          <div className="mt-6 flex flex-wrap justify-center gap-1 sm:gap-2">
            {[
              'Fix my Code',
              'Create me a Website',
              'Explain this error message',
              'Answer my Homework'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  requestAnimationFrame(() => textareaRef.current?.focus());
                }}
                className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-200 backdrop-blur-md whitespace-nowrap ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'
                    : 'bg-white/20 hover:bg-white/30 text-gray-700 border border-black/10'
                }`}
                title={suggestion}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className={`mt-4 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3 backdrop-blur-md ${
            isDarkMode ? 'bg-white/10 text-gray-300 border border-white/10' : 'bg-white/20 text-gray-700 border border-black/10'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Neura</span>
          </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
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
    // Process content to handle <think> tags and <br> tags
    const processContent = (text: string) => {
      // First, fix <br> tags
      let processed = text.replace(/<br\s*\/?>/gi, '\n');
      
      // Handle <think> tags by converting them to JSX
      const parts = processed.split(/(<think>[\s\S]*?<\/think>)/gi);
      
      return parts.map((part, index) => {
        if (part.match(/<think>[\s\S]*?<\/think>/i)) {
          const thinkContent = part.replace(/<\/?think>/gi, '').trim();
          return (
            <div key={index} className={`my-4 p-4 rounded-xl border-l-4 relative overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800/50 border-l-purple-500/60 text-gray-300 backdrop-blur-sm' 
                : 'bg-purple-50/50 border-l-purple-500/60 text-gray-700 backdrop-blur-sm'
            }`}>
              {/* Think bubble decoration */}
              <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-mono ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-purple-100 text-purple-600'
              }`}>
                💭 thinking
              </div>
              <div className="pr-20 text-sm leading-relaxed italic">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <div className="mb-2">{children}</div>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em>{children}</em>,
                  }}
                >
                  {thinkContent}
                </ReactMarkdown>
              </div>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none"></div>
            </div>
          );
        }
        
        return part ? (
          <ReactMarkdown
            key={index}
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
            {part}
          </ReactMarkdown>
        ) : null;
      });
    };
    
    return (
      <div className="prose prose-sm max-w-none font-sf-pro">
        {processContent(content)}
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
      <header className={`sticky top-0 z-50 border-b px-4 py-3 shadow-sm transition-colors duration-300 backdrop-blur-xl ${
        isDarkMode ? 'bg-[rgb(15_15_15)]/80 border-gray-800' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Neura GPT
            </h1>
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
      <div className="flex-1 overflow-y-auto relative" onScroll={handleScroll}>
        {/* Enhanced Chat Area Background Blobs - Full Screen Coverage */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Primary Extra Large Blobs */}
          <div className="absolute top-10 left-10 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/12 via-purple-500/10 to-pink-500/12 blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-10 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-cyan-500/10 via-blue-500/8 to-purple-500/10 blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-purple-500/11 via-pink-500/9 to-red-500/11 blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-20 right-20 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-emerald-500/9 via-cyan-500/7 to-blue-500/9 blur-3xl"></div>
          
          {/* Secondary Large Blobs */}
          <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-lime-500/8 via-green-500/6 to-emerald-500/8 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-full bg-gradient-to-l from-orange-500/8 via-red-500/6 to-pink-500/8 blur-2xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-violet-500/9 via-indigo-500/7 to-blue-500/9 blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/4 right-1/3 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-teal-500/8 via-cyan-500/6 to-blue-500/8 blur-2xl"></div>
          
          {/* Medium Floating Blobs */}
          <div className="absolute top-32 left-1/3 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-rose-500/7 via-pink-500/5 to-red-500/7 blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-32 right-1/4 w-[320px] h-[320px] rounded-full bg-gradient-to-tl from-indigo-500/8 via-purple-500/6 to-violet-500/8 blur-xl"></div>
          <div className="absolute top-2/3 left-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-r from-yellow-500/6 via-orange-500/4 to-red-500/6 blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/2 right-1/2 w-[290px] h-[290px] rounded-full bg-gradient-to-l from-green-500/7 via-emerald-500/5 to-teal-500/7 blur-xl"></div>
          
          {/* Small Accent Blobs */}
          <div className="absolute top-16 right-1/3 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-sky-500/6 to-blue-500/6 blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute bottom-16 left-1/3 w-[180px] h-[180px] rounded-full bg-gradient-to-bl from-purple-500/7 to-indigo-500/7 blur-lg"></div>
          <div className="absolute top-3/4 right-20 w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-pink-500/6 to-rose-500/6 blur-lg animate-pulse" style={{animationDelay: '3.5s'}}></div>
          <div className="absolute bottom-3/4 left-16 w-[190px] h-[190px] rounded-full bg-gradient-to-tl from-cyan-500/7 to-teal-500/7 blur-lg"></div>
          
          {/* Corner and Edge Fill Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-blue-400/6 via-purple-400/4 to-pink-400/6 blur-2xl"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-t from-emerald-400/6 via-cyan-400/4 to-blue-400/6 blur-2xl animate-pulse" style={{animationDelay: '4.5s'}}></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-purple-400/6 via-violet-400/4 to-indigo-400/6 blur-2xl"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-l from-orange-400/6 via-red-400/4 to-pink-400/6 blur-2xl animate-pulse" style={{animationDelay: '5s'}}></div>
          
          {/* Additional Micro Blobs for Full Coverage */}
          <div className="absolute top-1/5 left-1/5 w-[150px] h-[150px] rounded-full bg-gradient-to-br from-lime-400/5 to-green-400/5 blur-md animate-pulse" style={{animationDelay: '6s'}}></div>
          <div className="absolute top-4/5 right-1/5 w-[160px] h-[160px] rounded-full bg-gradient-to-bl from-violet-400/5 to-purple-400/5 blur-md"></div>
          <div className="absolute bottom-1/5 left-4/5 w-[140px] h-[140px] rounded-full bg-gradient-to-tr from-teal-400/5 to-cyan-400/5 blur-md animate-pulse" style={{animationDelay: '7s'}}></div>
          <div className="absolute top-3/5 right-3/5 w-[170px] h-[170px] rounded-full bg-gradient-to-tl from-rose-400/5 to-pink-400/5 blur-md"></div>
        </div>

        {isFirstLoad && messages.length <= 1 ? (
          <WelcomeArea />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 relative z-10">
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Enhanced Input Area - Improved Blob Design */}
      <div className={`border-t px-4 py-6 transition-colors duration-300 overflow-hidden ${
        isDarkMode ? 'border-gray-900/20' : 'border-gray-50/20'
      }`}>
        
        {/* Enhanced Background Blobs for Input Area - More Coverage */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main Ultra-Wide Gradient Blob */}
          <div className={`absolute -bottom-40 -left-40 w-[120vw] h-[500px] rounded-full blur-3xl transition-all duration-1000 ${
            isInputFocused 
              ? 'bg-gradient-to-r from-blue-500/35 via-purple-500/30 to-pink-500/35 scale-110' 
              : 'bg-gradient-to-r from-blue-500/25 via-purple-500/20 to-pink-500/25 scale-100'
          }`}></div>
          
          {/* Secondary Wide Sweep Blob */}
          <div className={`absolute -bottom-30 -right-50 w-[100vw] h-[450px] rounded-full blur-3xl transition-all duration-1000 ${
            isInputFocused 
              ? 'bg-gradient-to-l from-cyan-500/30 via-purple-500/25 to-blue-500/30 scale-110' 
              : 'bg-gradient-to-l from-cyan-500/20 via-purple-500/15 to-blue-500/20 scale-100'
          }`}></div>
          
          {/* Top Accent Sweep */}
          <div className={`absolute -top-20 left-0 right-0 w-full h-[300px] rounded-full blur-2xl transition-all duration-1500 ${
            input.trim() 
              ? 'bg-gradient-to-b from-pink-500/25 via-purple-500/20 to-transparent scale-105 opacity-100' 
              : 'bg-gradient-to-b from-pink-500/15 via-purple-500/10 to-transparent scale-90 opacity-60'
          }`}></div>
          
          {/* Side Accent Blobs */}
          <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-2xl transition-all duration-1200 ${
            isInputFocused 
              ? 'bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-blue-500/20' 
              : 'bg-gradient-to-tr from-emerald-500/12 via-cyan-500/8 to-blue-500/12'
          }`}></div>
          <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full blur-2xl transition-all duration-1200 ${
            isInputFocused 
              ? 'bg-gradient-to-tl from-orange-500/18 via-red-500/13 to-pink-500/18' 
              : 'bg-gradient-to-tl from-orange-500/10 via-red-500/7 to-pink-500/10'
          }`}></div>
          
          {/* Dynamic Typing Indicator Blobs */}
          {isLoading && (
            <>
              <div className="absolute bottom-10 left-1/4 w-[200px] h-[200px] rounded-full bg-blue-500/15 blur-xl animate-pulse"></div>
              <div className="absolute bottom-8 right-1/4 w-[150px] h-[150px] rounded-full bg-purple-500/15 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full bg-pink-500/12 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </>
          )}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Enhanced Input Container - Ultra Clear Glass with Better Blob Integration */}
          <div className={`relative rounded-2xl transition-all duration-300 ${
            input.trim() || isInputFocused 
              ? 'transform scale-[1.005]' 
              : 'transform scale-100'
          }`}>
            
            {/* Glass Background with Enhanced Blur */}
            <div className={`absolute inset-0 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-black/20 border border-white/10' 
                : 'bg-white/20 border border-black/10'
            } ${
              isInputFocused
                ? isDarkMode 
                  ? 'bg-black/30 border-blue-400/30 shadow-2xl shadow-blue-500/20' 
                  : 'bg-white/30 border-blue-500/30 shadow-2xl shadow-blue-500/30'
                : ''
            }`}></div>

            {/* Floating Label - Minimal Style */}
            <label className={`absolute left-5 transition-all duration-300 pointer-events-none select-none font-medium z-20 ${
              (isInputFocused || input.trim()) 
                ? `top-3 text-xs ${
                    isDarkMode 
                      ? isInputFocused ? 'text-blue-400/90' : 'text-gray-400/80' 
                      : isInputFocused ? 'text-blue-600/90' : 'text-gray-500/80'
                  }`
                : `top-1/2 transform -translate-y-1/2 text-sm ${
                    isDarkMode ? 'text-gray-500/60' : 'text-gray-400/70'
                  }`
            }`}>
              {(isInputFocused || input.trim()) 
                ? 'Message' 
                : 'Ask Anything ...'}
            </label>

            {/* Input Container */}
            <div className="relative flex items-end gap-3 px-2 py-2">
              {/* Textarea - Ultra Clean */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className={`flex-1 border-none outline-none resize-none bg-transparent text-sm leading-relaxed transition-all duration-300 ${
                  (isInputFocused || input.trim()) 
                    ? 'pt-8 pb-3' 
                    : 'pt-4 pb-3'
                } px-3 ${
                  isDarkMode 
                    ? 'text-white/95 placeholder-transparent' 
                    : 'text-gray-800/95 placeholder-transparent'
                }`}
                rows={1}
                disabled={isLoading}
                style={{ minHeight: '44px' }}
              />

              {/* Action Buttons - Minimal & Clean */}
              <div className="flex items-center gap-2 pb-1">
                
                {/* Model Selection - Clean Style */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg transition-all duration-300 focus:outline-none hover:scale-105 ${
                      isDarkMode 
                        ? 'hover:bg-white/10 text-gray-400/70 hover:text-gray-300/90' 
                        : 'hover:bg-black/5 text-gray-500/70 hover:text-gray-700/90'
                    }`}
                    title="Select Model"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${MODELS.find(m => m.id === selectedModel)?.color}`}></div>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                        
                  {/* Ultra Clear Model Dropdown */}
                  {isModelDropdownOpen && (
                    <div className={`absolute bottom-full right-0 mb-3 w-64 origin-bottom-right rounded-xl shadow-2xl py-2 z-30 backdrop-blur-xl transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-black/40 border border-white/[0.08]' 
                        : 'bg-white/60 border border-black/[0.05]'
                    }`}>
                      <div className={`px-3 py-1.5 text-xs font-medium ${
                        isDarkMode ? 'text-gray-400/80' : 'text-gray-500/80'
                      }`}>
                        AI Models
                      </div>
                      {MODELS.map(model => (
                        <div 
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`mx-1 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedModel === model.id 
                              ? isDarkMode 
                                ? 'bg-blue-500/10 border border-blue-400/20' 
                                : 'bg-blue-50/80 border border-blue-200/50' 
                              : isDarkMode 
                                ? 'hover:bg-white/[0.03]' 
                                : 'hover:bg-black/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${model.color}`}></div>
                            <div className="flex-1">
                              <div className="font-medium text-xs">{model.name}</div>
                              <div className={`text-xs mt-0.5 ${
                                isDarkMode ? 'text-gray-400/60' : 'text-gray-500/60'
                              }`}>
                                {model.description}
                              </div>
                            </div>
                            {selectedModel === model.id && (
                              <div className={`${
                                isDarkMode ? 'text-blue-400/80' : 'text-blue-500/80'
                              }`}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Button - Enhanced with Blob Colors */}
                {input.trim() && (
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading}
                    className={`p-3 rounded-full transition-all duration-300 relative overflow-hidden ${
                      isLoading
                        ? isDarkMode
                          ? 'bg-gray-700/50 text-gray-500/50 cursor-not-allowed'
                          : 'bg-gray-300/50 text-gray-400/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {/* Button Glow Effect */}
                    {!isLoading && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-md opacity-75"></div>
                    )}
                    <div className="relative z-10">
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Character Counter - Subtle */}
            {input && (
              <div className={`absolute bottom-2 left-5 text-xs transition-opacity duration-300 ${
                isDarkMode ? 'text-gray-400/50' : 'text-gray-400/60'
              }`}>
                {input.length}
              </div>
            )}

            {/* Enhanced Focus Glow Effect with Blob Colors */}
            {isInputFocused && (
              <div className={`absolute -inset-1 rounded-2xl opacity-60 blur-lg transition-all duration-500 -z-10 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500/30 via-purple-500/25 to-pink-500/30' 
                  : 'bg-gradient-to-r from-blue-400/25 via-purple-400/20 to-pink-400/25'
              }`}></div>
            )}
          </div>

          {/* Minimal Quick Actions */}
          <div className="flex items-center justify-center gap-3 mt-3 opacity-50 hover:opacity-80 transition-opacity duration-300">
            <button 
              onClick={() => setInput('')}
              className={`text-xs px-2.5 py-1 rounded-md transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'hover:bg-white/5 text-gray-300/70 hover:text-gray-400/90' 
                  : 'hover:bg-black/5 text-gray-900/70 hover:text-gray-600/90'
              }`}
            >
              Clear
            </button>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300/50' : 'text-gray-900/60'}`}>
              Press Enter to send • Shift + Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
