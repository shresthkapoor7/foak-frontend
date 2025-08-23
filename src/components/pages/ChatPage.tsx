import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Site } from '../../models';
import { sampleSites } from '../../data/sampleSites';
import { geminiService } from '../../services/geminiService';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message with sites context
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Hello! I'm your AI assistant with access to your complete sites database (${sampleSites.length} sites). I can help you with:

• Site comparisons and recommendations
• Investment opportunity analysis
• Market trend insights
• Financial incentive optimization
• Portfolio analysis and planning

Ask me anything about your sites or energy project planning!`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        sampleSites,
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '10px' : '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#495057' }}>
            AI Chat Assistant
            <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#6c757d' }}> - Sites Portfolio</span>
          </h3>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: isMobile ? '8px 12px' : '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>


        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: message.isUser ? '#007bff' : '#f1f3f4',
              color: message.isUser ? 'white' : '#000000'
            }}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '5px'
              }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: '#f1f3f4',
              color: '#6c757d'
            }}>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your sites portfolio, comparisons, or investment insights..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #dee2e6',
              borderRadius: '20px',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '120px',
              fontSize: '14px',
              outline: 'none'
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              backgroundColor: inputMessage.trim() && !isLoading ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '20px',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '70px'
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
