import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Site } from '../../models';
import { sampleSites } from '../../data/sampleSites';
import { apiService } from '../../services/apiService';
import { geminiService } from '../../services/geminiService';
import '../common/MarkdownStyles.css';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConversationHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch sites data from API
  useEffect(() => {
    // TODO: Uncomment when API CORS issues are resolved
    // const fetchSites = async () => {
    //   setSitesLoading(true);
    //   setSitesError(null);
    //
    //   const response = await apiService.getLatestSiteAnalyses();
    //
    //   if (response.error) {
    //     setSitesError(response.error);
    //     setSites([]);
    //   } else {
    //     setSites(response.data);
    //   }
    //
    //   setSitesLoading(false);
    // };
    // fetchSites();

    // Temporarily using sample sites directly
    setSitesLoading(true);
    setTimeout(() => {
      setSites(sampleSites);
      setSitesLoading(false);
    }, 300);
  }, []);

  // Add welcome message with sites context
  useEffect(() => {
    if (!sitesLoading) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: sitesError
          ? `Hello! I'm your AI assistant. Unfortunately, I'm having trouble accessing your sites database right now due to: ${sitesError}. You can still ask me general questions about energy project planning and CO2 utilization!`
          : `# Welcome to FOAK AI Assistant!

I have access to your complete sites database (**${sites.length} sites**) and can help you with:

## **Core Capabilities:**
- **Site comparisons and recommendations**
- **Investment opportunity analysis**
- **Market trend insights**
- **Financial incentive optimization**
- **Portfolio analysis and planning**

## **What I Can Do:**
1. Analyze site profitability scores
2. Compare CO2 utilization opportunities
3. Provide market insights and trends
4. Help optimize financial incentives
5. Generate portfolio recommendations

---

*Ask me anything about your sites or energy project planning!*`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [sitesLoading, sitesError, sites.length]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when chat is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if Gemini is configured
    if (!geminiService.isConfigured()) {
      alert('Gemini API key is not configured. Please add REACT_APP_GEMINI_API_KEY to your environment variables.');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

        setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add user message to conversation history
    setConversationHistory(prev => [...prev, { role: 'user', content: inputMessage }]);

    try {
      // Get AI response with all sites context and conversation history
      const response = await geminiService.sendMessage(
        inputMessage,
        undefined,
        sites.length > 0 ? sites : undefined,
        conversationHistory
      );

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add AI response to conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="chat-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: '100vh'
      }}
    >

      {/* Header */}
      <div style={{
        padding: isMobile ? '20px' : '25px 30px',
        background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }}>
        <div>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#ffffff',
            color: '#ffffff',
            border: 'none',
            padding: isMobile ? '12px 20px' : '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Back
        </button>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: '1 1 auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isMobile ? '20px' : '30px',
        background: '#ffffff',
        zIndex: 2,
        position: 'relative',
        minHeight: 0,
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              animation: 'fadeInUp 0.3s ease-out'
            }}
          >
            <div style={{
              maxWidth: isMobile ? '85%' : '70%',
              padding: isMobile ? '16px 20px' : '20px 24px',
              borderRadius: message.isUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
              background: message.isUser
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.95)',
              color: message.isUser ? 'white' : '#2d3748',
              boxShadow: message.isUser
                ? '0 8px 25px rgba(102, 126, 234, 0.3)'
                : '0 8px 25px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: message.isUser
                ? 'none'
                : '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Message content */}
              <div style={{
                fontSize: isMobile ? '16px' : '15px',
                lineHeight: '1.6',
                fontWeight: '400'
              }}>
                {message.isUser ? (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.text}
                  </div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '20px',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <div style={{
              padding: isMobile ? '16px 20px' : '20px 24px',
              borderRadius: '24px 24px 24px 8px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#4a5568',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #e2e8f0',
                borderTop: '2px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '15px', fontWeight: '500' }}>
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

                {/* CSS Animations and Custom Scrollbar */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            transition: background 0.2s ease;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }

          /* Prevent body scroll */
          body {
            overflow: hidden;
          }

          /* Ensure chat container doesn't cause page scroll */
          .chat-container {
            overflow: hidden;
            height: 100vh;
            max-height: 100vh;
          }

          /* Chat-specific markdown styles */
          .markdown-content h1, .markdown-content h2, .markdown-content h3 {
            margin: 16px 0 8px 0;
            color: #2d3748;
            font-weight: 600;
          }

          .markdown-content h1 {
            font-size: 20px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }

          .markdown-content h2 {
            font-size: 18px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }

          .markdown-content h3 {
            font-size: 16px;
          }

          .markdown-content p {
            margin: 8px 0;
            line-height: 1.6;
          }

          .markdown-content ul, .markdown-content ol {
            margin: 8px 0;
            padding-left: 24px;
          }

          .markdown-content li {
            margin: 4px 0;
            line-height: 1.5;
          }

          .markdown-content code {
            background: #f7fafc;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            border: 1px solid #e2e8f0;
          }

          .markdown-content pre {
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            overflow-x: auto;
            margin: 16px 0;
          }

          .markdown-content pre code {
            background: none;
            padding: 0;
            border: none;
            font-size: 14px;
          }

          .markdown-content blockquote {
            border-left: 4px solid #667eea;
            margin: 16px 0;
            padding: 8px 16px;
            background: #f7fafc;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #4a5568;
          }

          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            font-size: 14px;
          }

          .markdown-content th, .markdown-content td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }

          .markdown-content th {
            background: #f7fafc;
            font-weight: 600;
            color: #2d3748;
          }

          .markdown-content strong {
            font-weight: 600;
            color: #2d3748;
          }

          .markdown-content em {
            font-style: italic;
            color: #4a5568;
          }

          .markdown-content a {
            color: #667eea;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-bottom 0.2s ease;
          }

          .markdown-content a:hover {
            border-bottom: 1px solid #667eea;
          }
        `}</style>
      </div>

      {/* Input Container */}
      <div style={{
        padding: isMobile ? '20px' : '25px 30px',
        background: '#ffffff',
        zIndex: 2,
        position: 'relative',
        flexShrink: 0,
        minHeight: 'fit-content'
      }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end',
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
            background: '#ffffff',
            borderRadius: '25px',
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your sites portfolio, comparisons, or investment insights..."
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                borderRadius: '25px',
                resize: 'none',
                minHeight: '50px',
                maxHeight: '120px',
                fontSize: '16px',
                outline: 'none',
                background: 'transparent',
                color: '#2d3748',
                fontFamily: 'inherit',
                lineHeight: '1.5'
              }}
              rows={1}
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              background: inputMessage.trim() && !isLoading
                ? '#007bff'
                : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '25px',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              minWidth: '80px',
              boxShadow: inputMessage.trim() && !isLoading
                ? '0 4px 12px rgba(0, 123, 255, 0.3)'
                : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() && !isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputMessage.trim() && !isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>...</span>
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>

        {/* Input helper text */}
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '14px',
          color: '#6c757d',
          fontWeight: '400'
        }}>
          Tip: Ask about site comparisons, investment analysis, or market insights
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
