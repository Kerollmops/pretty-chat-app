
import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Trash, AlertTriangle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SourcesPanel from './SourcesPanel';
import SettingsModal from './SettingsModal';
import ProgressIndicator from './ProgressIndicator';
import ErrorMessage from './ErrorMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { isConfigValid } from '@/config/openai';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSources, setCurrentSources] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  const [isApiKeySet, setIsApiKeySet] = useState(isConfigValid());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use our custom OpenAI chat hook with the streaming implementation
  const { streamChatCompletion, isLoading, isSearching } = useOpenAIChat({
    onError: (errorMessage) => addErrorMessage(errorMessage)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleShowSources = (sources: Array<{ title: string; url: string; snippet: string }>) => {
    setCurrentSources(sources);
    setShowSources(true);
  };

  const addErrorMessage = (errorMessage: string) => {
    const errorMsg: Message = {
      id: Date.now().toString(),
      type: 'error',
      content: errorMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMsg]);
  };

  // Function to clear all messages
  const handleClearChat = () => {
    setMessages([]);
    setHasStartedChat(false);
  };

  const dismissError = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check if API key is set
    if (!isApiKeySet) {
      setShowSettings(true);
      addErrorMessage("Meilisearch API key is not set. Please configure your API key in settings.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    try {
      // Use the OpenAI streaming chat completion with the official SDK
      await streamChatCompletion([...messages, userMessage], setMessages);
    } catch (error) {
      console.error("Error during chat completion:", error);
      addErrorMessage(error instanceof Error ? error.message : "An error occurred during chat completion");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check API key validity when settings modal closes
  const handleSettingsClose = () => {
    setShowSettings(false);
    setIsApiKeySet(isConfigValid());
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Chat Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showSources ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleClearChat}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-medium">Dialogue with Meilisearch</h1>

            {!isApiKeySet && (
              <div className="flex items-center ml-2 text-amber-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-xs">API key not set</span>
              </div>
            )}
          </div>
        </div>

        {!hasStartedChat ? (
          // Centered initial state
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-3xl animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-normal mb-6">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Ask anything to Meilisearch that you would like to know about the content of the indexes or any other topic.
                  Meilisearch will respond with the most relevant information.
                </p>
              </div>

              <div className="relative">
                <div className="relative border border-border rounded-xl overflow-hidden hover:shadow-md focus-within:shadow-lg transition-shadow duration-200">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about the content of the indexes"
                    className="resize-none min-h-[60px] border-0 focus:ring-0 focus-visible:ring-0 text-base px-4 py-4 pr-12"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => {
                  if (message.type === 'error') {
                    return (
                      <ErrorMessage
                        key={message.id}
                        message={message.content}
                        onDismiss={() => dismissError(message.id)}
                      />
                    );
                  }
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onShowSources={handleShowSources}
                    />
                  );
                })}

                {isSearching && (
                  <ProgressIndicator message="Searching for documents..." />
                )}

                {isLoading && !isSearching && (
                  <ProgressIndicator message="Generating response..." />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Input */}
            <div className="border-t border-border bg-background p-4 flex-shrink-0">
              <div className="max-w-3xl mx-auto">
                <div className="relative border border-border rounded-xl overflow-hidden hover:shadow-md focus-within:shadow-lg transition-shadow duration-200">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about the content of the indexes"
                    className="resize-none min-h-[60px] border-0 focus:ring-0 focus-visible:ring-0 text-base px-4 py-4 pr-12"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sources Panel */}
      <SourcesPanel
        sources={currentSources}
        isOpen={showSources}
        onClose={() => setShowSources(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
      />
    </div>
  );
};

export default ChatInterface;
