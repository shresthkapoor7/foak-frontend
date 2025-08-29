import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Site } from '../../models';

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

  // 1. Queue for last 5 messages (for API calls)
  const [messageQueue, setMessageQueue] = useState<ConversationHistoryItem[]>([]);

  // 2. Sites data from API
  const [sitesData, setSitesData] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  // 3. All messages for UI and localStorage
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false); // 🔧 FIX: Track if messages are loaded

  // Other state
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔧 FIX: Load messages from localStorage on mount - runs only once
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setAllMessages(parsedMessages);
        updateMessageQueue(parsedMessages);
      }
      setMessagesLoaded(true); // Mark messages as loaded
    } catch (error) {
      console.warn('Failed to load messages from localStorage:', error);
      setMessagesLoaded(true); // Still mark as loaded even if failed
    }
  }, []); // Empty dependency array - runs only once

  // 🔧 FIX: Only save to localStorage when messages are loaded and not empty due to initialization
  useEffect(() => {
    if (messagesLoaded) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(allMessages));
      } catch (error) {
        console.warn('Failed to save messages to localStorage:', error);
      }
    }
  }, [allMessages, messagesLoaded]);

  // Check if API key is already configured
  useEffect(() => {
    const savedApiKey = geminiService.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Fetch sites data
  useEffect(() => {
    const fetchSites = async () => {
      setSitesLoading(true);
      setSitesError(null);

      try {
        const response = await apiService.getLatestSiteAnalyses();
        if (response.error) {
          setSitesError(response.error);
          setSitesData([]);
        } else {
          setSitesData(response.data);
        }
      } catch (error) {
        setSitesError('Failed to fetch sites data');
        setSitesData([]);
      }

      setSitesLoading(false);
    };
    fetchSites();
  }, []);

  // 🔧 FIX: Add welcome message with better conditions
  useEffect(() => {
    // Only add welcome message if:
    // 1. Sites have finished loading
    // 2. Messages have been loaded from localStorage
    // 3. No messages exist
    if (!sitesLoading && messagesLoaded && allMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: sitesError
          ? `Hello! I'm your AI assistant. Unfortunately, I'm having trouble accessing your sites database right now due to: ${sitesError}. You can still ask me general questions about energy project planning and CO2 utilization!`
          : `# Welcome to FOAK AI Assistant!

I have access to your complete sites database (**${sitesData.length} sites**) and can help you with:

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
      setAllMessages([welcomeMessage]);
    }
  }, [sitesLoading, messagesLoaded, allMessages.length, sitesError, sitesData.length]);
  // 🔧 FIX: Use allMessages.length instead of checking the whole array

  // Update message queue when allMessages change
  const updateMessageQueue = (messages: ChatMessage[]) => {
    // Simply get the last 5 messages, regardless of who sent them
    const lastMessages = messages.slice(-5);

    // Convert to conversation format
    const queueItems: ConversationHistoryItem[] = lastMessages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));

    setMessageQueue(queueItems);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // Prevent body scroll when chat is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      geminiService.setApiKey(apiKey.trim());
      setShowApiKeyModal(false);

      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        text: '✅ API key configured successfully! You can now start chatting.',
        isUser: false,
        timestamp: new Date()
      };

      setAllMessages(prev => [...prev, successMessage]);
    }
  };

  const handleClearApiKey = () => {
    geminiService.setApiKey('');
    setApiKey('');
    setShowApiKeyModal(false);
  };

  const handleClearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      setAllMessages([]);
      setMessageQueue([]);
      try {
        localStorage.removeItem('chat_messages');
      } catch (error) {
        console.warn('Failed to clear messages from localStorage:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if Gemini is configured
    if (!geminiService.isConfigured()) {
      setShowApiKeyModal(true);
      return;
    }

    // Add user message to all messages
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setAllMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to Gemini: messageQueue (last 5 messages) + sitesData
      const response = await geminiService.sendMessage(
        inputMessage,
        undefined,
        sitesData.length > 0 ? sitesData : undefined,
        messageQueue
      );

      // Add AI response to all messages
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setAllMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setAllMessages(prev => [...prev, errorMessage]);
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

  // Update message queue whenever allMessages change
  useEffect(() => {
    updateMessageQueue(allMessages);
  }, [allMessages]);

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowApiKeyModal(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#6c757d',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = '#495057';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6c757d';
            }}
            title="Configure API Key"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98c0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/>
            </svg>
          </button>
          <span style={{
            fontSize: '14px',
            color: '#6c757d',
            fontWeight: '500'
          }}>
            {geminiService.isConfigured() ? '✅ API Configured' : '⚠️ API Key Required'}
          </span>
          {allMessages.length > 1 && (
            <button
              onClick={handleClearChatHistory}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#dc3545',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#dc3545';
              }}
              title="Clear Chat History"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
          )}
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

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowApiKeyModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '5px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#495057';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#6c757d';
              }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px'
              }}>
                🔑
              </div>
              <h2 style={{
                margin: '0 0 10px 0',
                color: '#2d3748',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Configure Gemini API Key
              </h2>
              <p style={{
                margin: 0,
                color: '#6c757d',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Enter your Google Gemini API key to start using the AI assistant
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApiKeySubmit();
                  }
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleApiKeySubmit}
                disabled={!apiKey.trim()}
                style={{
                  background: apiKey.trim() ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  if (apiKey.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (apiKey.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                Configure
              </button>
              {geminiService.getApiKey() && (
                <button
                  onClick={handleClearApiKey}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Clear Key
                </button>
              )}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6c757d',
              lineHeight: '1.5'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: '600' }}>ℹ️ How to get your API key:</div>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the generated key and paste it above</li>
              </ol>
              <div style={{ marginTop: '12px', fontSize: '12px', fontStyle: 'italic' }}>
                Your API key is saved locally and will persist across browser sessions.
              </div>
            </div>
          </div>
        </div>
      )}

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
        {allMessages.map((message) => (
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
            border-radius: 8px';
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
            color: '#4a5568';
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
            color: '#4a5568';
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
              placeholder={geminiService.isConfigured() ? "Ask me about your sites portfolio, comparisons, or investment insights..." : "Please configure your API key first..."}
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
              disabled={isLoading || !geminiService.isConfigured()}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !geminiService.isConfigured()}
            style={{
              background: inputMessage.trim() && !isLoading && geminiService.isConfigured()
                ? '#007bff'
                : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '25px',
              cursor: inputMessage.trim() && !isLoading && geminiService.isConfigured() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: '600',
              minWidth: '80px',
              boxShadow: inputMessage.trim() && !isLoading && geminiService.isConfigured()
                ? '0 4px 12px rgba(0, 123, 255, 0.3)'
                : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() && !isLoading && geminiService.isConfigured()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputMessage.trim() && !isLoading && geminiService.isConfigured()) {
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
          {geminiService.isConfigured() ? 'Tip: Ask about site comparisons, investment analysis, or market insights' : 'Click the gear icon in the header to configure your API key'}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
