import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ArrowUp, Copy, RotateCcw, Check, Sparkles } from 'lucide-react';
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

// Single default model (no dropdown)
const DEFAULT_MODEL = 'openai/gpt-oss-20b:free';

// Use an env var in production. Keep empty string as placeholder here.
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Respect reduced motion & tab visibility to disable animations when needed
  const [animateEnabled, setAnimateEnabled] = useState(true);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReduced = () => setAnimateEnabled(!mediaQuery.matches);
    handleReduced();
    mediaQuery.addEventListener('change', handleReduced);

    const handleVisibility = () => setAnimateEnabled(!document.hidden && !mediaQuery.matches);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mediaQuery.removeEventListener('change', handleReduced);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Detect system color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const WelcomeArea = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Hello, I'm Neura
          </h1>
          <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ask anything. Get clear answers, code, and ideas.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Fix my Code', 'Create me a Website', 'Explain this error', 'Help with Homework'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                className={`text-xs px-3 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${isDarkMode ? 'bg-white/6 border-white/8 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
                aria-label={`Quick suggestion: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className={`mt-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/6 text-gray-200' : 'bg-white/50 text-gray-800'}`}>
              <Sparkles className="w-4 h-4" aria-hidden />
              <span>Welcome to Neura</span>
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

  // Simple shimmer loader for assistant typing
  const ShimmerLoader: React.FC = () => {
    return (
      <div className="w-full mt-2">
        <div
          className={`h-3 rounded-full overflow-hidden ${animateEnabled ? 'animate-shimmer' : ''}`}
          style={{ background: isDarkMode ? 'linear-gradient(90deg,#1f1f1f,#2b2b2b,#1f1f1f)' : 'linear-gradient(90deg,#f3f4f6,#e6edf3,#f3f4f6)' }}
          aria-hidden
        />
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const smoothScrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 16);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 120;
    setShouldAutoScroll(isNearBottom);
  };

  useLayoutEffect(() => {
    smoothScrollToBottom();
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    return () => { if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, []);

  useEffect(() => setIsFirstLoad(true), []);

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
    return messages.filter(m => !m.isGenerating).map(m => ({ role: m.role, content: m.content }));
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent ?? input.trim();
    if (!content) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsFirstLoad(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const generatingMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date(), isGenerating: true };
    setMessages(prev => [...prev, generatingMessage]);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: DEFAULT_MODEL, messages: [...getChatHistory(), { role: 'user', content }], temperature: 0.4, max_tokens: 4096, stream: true })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

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
                  accumulated += content;
                  setMessages(prev => prev.map(msg => msg.id === generatingMessage.id ? { ...msg, content: accumulated } : msg));
                }
              } catch (e) {
                // ignore incomplete JSON
              }
            }
          }
        }
      }

      // finalize
      setMessages(prev => prev.map(msg => msg.id === generatingMessage.id ? { ...msg, isGenerating: false } : msg));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== generatingMessage.id));
      const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: '**Error**: Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMessage = (messageId: string) => {
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;
    const prevUser = messages[idx - 1];
    if (prevUser && prevUser.role === 'user') {
      // remove assistant message and re-send
      setMessages(prev => prev.slice(0, idx));
      sendMessage(prevUser.content);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (e) { console.error('copy failed', e); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const MarkdownRenderer: React.FC<{ content: string; isGenerating: boolean }> = ({ content, isGenerating }) => {
    const processContent = (text: string) => {
      let processed = text.replace(/<br\s*\/?>/gi, '\n');
      const parts = processed.split(/(<think>[\s\S]*?<\/think>)/gi);
      return parts.map((part, idx) => {
        if (part.match(/<think>[\s\S]*?<\/think>/i)) {
          const thinkContent = part.replace(/<\/?think>/gi, '').trim();
          return (
            <div key={idx} className={`my-3 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-gray-800/60 border-purple-500/70 text-gray-200' : 'bg-purple-50/60 border-purple-500/60 text-gray-800'}`}>
              <div className="text-xs italic mb-1">💭 thinking</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkContent}</ReactMarkdown>
            </div>
          );
        }

        return part ? (
          <ReactMarkdown
            key={idx}
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                if (!inline && language) {
                  return (
                    <div className="relative my-2">
                      <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>{language}</div>
                      <SyntaxHighlighter style={isDarkMode ? oneDark : oneLight} language={language} PreTag="div" className="rounded-md">
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className={`px-1 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`} {...props}>{children}</code>
                );
              },
              p: ({ children }) => <p className={`mb-2 leading-7 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</p>,
              ul: ({ children }) => <ul className={`mb-2 ml-4 list-disc ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ul>,
              ol: ({ children }) => <ol className={`mb-2 ml-4 list-decimal ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{children}</ol>,
              blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 italic my-2 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-600'}`}>{children}</blockquote>,
              br: () => <br />
            }}
          >
            {part}
          </ReactMarkdown>
        ) : null;
      });
    };

    return (
      <div className="max-w-none">
        {processContent(content)}
        {isGenerating && <ShimmerLoader />}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#0b0b0b] text-white' : 'bg-white text-gray-900'}`}>
      <header className={`sticky top-0 z-50 border-b px-4 py-3 ${isDarkMode ? 'bg-[#0b0b0b]/95 border-gray-800' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Neura GPT</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={createNewMessage}
              className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-white/6 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
              aria-label="New Chat"
              title="New Chat"
            >
              New Chat
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Subtle single background accent - reduced decorations */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className={`absolute inset-0 ${animateEnabled ? 'opacity-100' : 'opacity-90'}`} style={{ background: isDarkMode ? 'linear-gradient(180deg,#060606,transparent)' : 'linear-gradient(180deg,#ffffff,transparent)' }} />
        </div>

        {isFirstLoad && messages.length <= 1 ? (
          <WelcomeArea />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-full max-w-[70%] rounded-2xl px-4 py-3 relative ${message.role === 'user' ? (isDarkMode ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-900') : (isDarkMode ? 'bg-[#111214] text-gray-100' : 'bg-white shadow-sm text-gray-900')}`} style={{ lineHeight: 1.7 }}>
                  {message.role === 'user' ? (
                    <div className="text-sm font-medium whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <div aria-live="polite"><MarkdownRenderer content={message.content} isGenerating={!!message.isGenerating} /></div>
                  )}

                  {/* Always visible actions for assistant messages (touch friendly) */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-opacity-10">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        aria-label="Copy message"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-white/2 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                      >
                        {copiedMessageId === message.id ? <Check className="w-4 h-4 text-green-400" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                        <span className="hidden sm:inline">Copy</span>
                      </button>

                      <button
                        onClick={() => regenerateMessage(message.id)}
                        aria-label="Regenerate response"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-white/2 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                      >
                        <RotateCcw className="w-4 h-4" aria-hidden />
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className={`border-t px-4 py-4 ${isDarkMode ? 'border-gray-900/20' : 'border-gray-100'}`}>
        <div className="max-w-3xl mx-auto relative">
          <div className={`relative rounded-lg ${isInputFocused || input.trim() ? (isDarkMode ? 'bg-[#0d0d0d]/80' : 'bg-white') : (isDarkMode ? 'bg-[#070707]/60' : 'bg-white') } border p-3`}>
            <label className={`absolute left-4 top-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isInputFocused || input.trim() ? 'Message' : 'Ask anything...'}</label>

            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none bg-transparent text-sm leading-7 outline-none placeholder-gray-400 py-1 pl-2 pr-3 max-h-36"
                rows={1}
                aria-label="Message input"
                disabled={isLoading}
                style={{ minHeight: 44 }}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInput('')}
                  className={`px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-white/2 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                  aria-label="Clear input"
                >
                  Clear
                </button>

                {input.trim() && (
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading}
                    aria-label="Send message"
                    className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${isLoading ? 'opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'}`}
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden /> : <ArrowUp className="w-4 h-4" aria-hidden />}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-400">Press Enter to send • Shift + Enter for new line</div>
          </div>
        </div>
      </footer>

      {/* Minimal custom styles for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
