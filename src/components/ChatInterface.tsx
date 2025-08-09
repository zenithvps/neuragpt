import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, RotateCcw, Check } from 'lucide-react';
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
    description: 'Fast response and efficient for general and daily tasks',
    color: 'bg-blue-600'
  },
  { 
    id: 'moonshotai/kimi-k2:free', 
    name: 'Neura Code',
    description: 'Code and Math logic solutions',
    color: 'bg-cyan-500'
  },
  { 
    id: 'deepseek/deepseek-chat-v3-0324:free', 
    name: 'Neura Thinking',
    description: 'Advanced searching and thinking Model',
    color: 'bg-yellow-500'
  }
];

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const WelcomeArea = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold bg-blue-500 bg-clip-text text-transparent">
            Hello, I'm Neura
          </h1>
          <div className={`p-4 rounded-lg`}>
            <p className="text-xl font-semibold">
              Ask me anything
            </p>
          </div>
        </div>
      </div>
    );
  };

  const createNewMessage = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "# Welcome to AI Assistant! 👋\n\nI'm here to help you with:\n- **Answering questions** on any topic\n- **Writing and editing** content\n- **Problem solving** and analysis\n- **Code assistance** and debugging\n- **Creative tasks** and brainstorming\n\nFeel free to ask me anything! How can I assist you today?",
      timestamp: new Date()
    }]);
    setIsFirstLoad(true);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

 const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const generatingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, userMessage, generatingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...getChatHistory(), { role: 'user', content: userMessage.content }],
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
              const jsonString = line.slice(6);
              if (jsonString === '[DONE]') continue;
              
              try {
                const jsonData = JSON.parse(jsonString);
                const content = jsonData.choices[0]?.delta?.content || '';
                accumulatedContent += content;
                
                setMessages(prev => prev.map(msg => 
                  msg.id === generatingMessage.id 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
              } catch (e) {
                console.error('Error parsing JSON:', e);
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
    return (
      <div className="prose prose-sm max-w-none">
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
                  className={`px-1.5 py-0.5 rounded text-sm font-mono ${
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
              <h1 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className={`text-xl font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className={`mb-3 leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className={`mb-3 ml-4 space-y-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className={`mb-3 ml-4 space-y-1 ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className={`border-l-4 pl-4 py-2 my-4 italic ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-800 text-gray-300' 
                  : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}>
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className={`min-w-full border-collapse ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className={`border px-3 py-2 text-left font-semibold ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-200' 
                  : 'border-gray-300 bg-gray-100 text-gray-800'
              }`}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className={`border px-3 py-2 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-200' 
                  : 'border-gray-300 text-gray-700'
              }`}>
                {children}
              </td>
            ),
            strong: ({ children }) => (
              <strong className={`font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className={`italic ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {children}
              </em>
            )
          }}
        >
          {content}
        </ReactMarkdown>
        {isGenerating && (
          <span className={`inline-block w-2 h-5 animate-pulse ml-1 ${
            isDarkMode ? 'bg-gray-400' : 'bg-gray-600'
          }`} />
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[rgb(21_21_21)] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
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
      <div className="flex-1 overflow-y-auto">
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
                    <div className="whitespace-pre-wrap leading-relaxed">
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

      {/* Model Selection (Moved to bottom) */}
      <div className={`px-4 py-2 transition-colors duration-300 ${
        isDarkMode ? '' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="relative group w-full">
            <button
              className={`flex items-center justify-between w-full px-4 py-2 rounded-xl border text-l font-bold transition-colors duration-300 focus:outline-none ${
                isDarkMode 
                  ? 'text-white' 
                  : 'bg-white text-gray-900 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${MODELS.find(m => m.id === selectedModel)?.color}`}></div>
                {MODELS.find(m => m.id === selectedModel)?.name}
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`absolute bottom-full left-0 mb-1 w-full origin-bottom rounded-lg shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {MODELS.map(model => (
                <div 
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${
                    selectedModel === model.id 
                      ? isDarkMode 
                        ? 'bg-gray-700' 
                        : 'bg-gray-100' 
                      : isDarkMode 
                        ? 'hover:bg-gray-700' 
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${model.color}`}></div>
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {model.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={`border-t px-4 py-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-[rgb(15_15_15)] border-gray-900' : 'bg-white border-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-end gap-3 rounded-xl p-3 transition-colors duration-300 ${
            isDarkMode ? 'bg-[rgb(17_18_20)] border-gray-900' : 'bg-gray-100'
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className={`flex-1 border-none outline-none resize-none min-h-[30px] max-h-[120px] py-1 bg-transparent transition-colors duration-300 ${
                isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
              }`}
              rows={1}
              disabled={isLoading}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-white' 
                  : 'hover:bg-gray-600 text-gray-800'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
