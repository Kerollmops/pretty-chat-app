
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    // Simulate AI response with sources
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". This is a simulated response to demonstrate the chat interface. The actual AI integration would go here, where you'd connect to your preferred AI service like OpenAI's GPT, Anthropic's Claude, or Mistral AI.

This response shows how the interface handles longer messages with proper formatting and line breaks. The sources button below will show relevant references that would typically come from the AI's response.`,
        sources: [
          {
            title: "OpenAI GPT Documentation",
            url: "https://platform.openai.com/docs",
            snippet: "Official documentation for integrating GPT models into applications."
          },
          {
            title: "Anthropic Claude API Guide", 
            url: "https://docs.anthropic.com/claude/docs",
            snippet: "Comprehensive guide for using Claude AI in your applications."
          },
          {
            title: "Mistral AI Documentation",
            url: "https://docs.mistral.ai/",
            snippet: "Technical documentation for Mistral AI models and API usage."
          }
        ],
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800">AI Chat Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">Powered by advanced AI models</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden relative">
        {!hasStartedChat ? (
          // Centered initial state
          <div className="flex items-center justify-center h-full px-6">
            <div className="w-full max-w-2xl animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  What can I help you with today?
                </h2>
                <p className="text-gray-600">
                  Ask me anything and I'll provide detailed responses with sources.
                </p>
              </div>
              
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="resize-none min-h-[120px] pr-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-lg focus:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Messages view
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Bottom Input (appears after first message) */}
        {hasStartedChat && (
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4 animate-slide-in-right">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="resize-none min-h-[60px] pr-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:shadow-lg transition-all duration-200"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
