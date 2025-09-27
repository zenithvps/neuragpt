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
