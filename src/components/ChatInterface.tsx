
import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatWelcome from './ChatWelcome';
import ChatMessages from './ChatMessages';
import ChatInputArea from './ChatInputArea';
import SourcesPanel from './SourcesPanel';
import SettingsModal from './SettingsModal';
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
      id: `error-${Date.now()}`,
      type: 'error',
      content: errorMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMsg]);
  };

  const handleClearChat = () => {
    setMessages([]);
    setHasStartedChat(false);
  };

  const dismissError = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isApiKeySet) {
      setShowSettings(true);
      addErrorMessage("Meilisearch API key is not set. Please configure your API key in settings.");
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    try {
      await streamChatCompletion(updatedMessages, setMessages);
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

  const handleSettingsClose = () => {
    setShowSettings(false);
    setIsApiKeySet(isConfigValid());
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showSources ? 'mr-80' : ''}`}>
        <ChatHeader
          isApiKeySet={isApiKeySet}
          onShowSettings={() => setShowSettings(true)}
          onClearChat={handleClearChat}
        />

        {!hasStartedChat ? (
          <ChatWelcome
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
            textareaRef={textareaRef}
          />
        ) : (
          <>
            <ChatMessages
              messages={messages}
              isSearching={isSearching}
              isLoading={isLoading}
              onShowSources={handleShowSources}
              onDismissError={dismissError}
              messagesEndRef={messagesEndRef}
            />
            <ChatInputArea
              input={input}
              setInput={setInput}
              onSend={handleSend}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              textareaRef={textareaRef}
            />
          </>
        )}
      </div>

      <SourcesPanel
        sources={currentSources}
        isOpen={showSources}
        onClose={() => setShowSources(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
      />
    </div>
  );
};

export default ChatInterface;
