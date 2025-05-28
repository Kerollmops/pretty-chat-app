
import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Plus className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-medium text-gray-900">ChatGPT</h1>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden relative">
        {!hasStartedChat ? (
          // Centered initial state
          <div className="flex items-center justify-center h-full px-4">
            <div className="w-full max-w-3xl animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-normal text-gray-800 mb-6">
                  Comment puis-je vous aider ?
                </h2>
              </div>
              
              <div className="relative">
                <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Poser une question"
                    className="resize-none min-h-[60px] border-0 focus:ring-0 focus-visible:ring-0 text-base px-4 py-4 pr-12"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Messages view
          <div className="h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 max-w-xs border border-gray-100">
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
          <div className="border-t border-gray-100 bg-white p-4 animate-slide-in-right">
            <div className="max-w-3xl mx-auto">
              <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Demander au Chat ou @mentionner un agent"
                  className="resize-none min-h-[60px] border-0 focus:ring-0 focus-visible:ring-0 text-base px-4 py-4 pr-12"
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
