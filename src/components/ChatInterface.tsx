import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatWelcome from './ChatWelcome';
import ChatMessages from './ChatMessages';
import ChatInputArea from './ChatInputArea';
import SourcesPanel from './SourcesPanel';
import SettingsModal from './SettingsModal';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { isConfigValid } from '@/config/openai';
import ConversationManager from '@/utils/conversationManager';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

interface SourcesByQuery {
  callId: string;
  indexUid: string;
  query: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sourcesByQuery, setSourcesByQuery] = useState<SourcesByQuery[]>([]);
  const [isApiKeySet, setIsApiKeySet] = useState(isConfigValid());
  const [searchProgress, setSearchProgress] = useState<{ callId: string; indexUid: string; query: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { streamChatCompletion, isLoading, isSearching } = useOpenAIChat({
    onError: (errorMessage) => addErrorMessage(errorMessage)
  });

  // Subscribe to ConversationManager events
  useEffect(() => {
    const conversationManager = ConversationManager.getInstance();

    const unsubscribeProgress = conversationManager.subscribeToProgress((progress) => {
      setSearchProgress(progress);
    });

    const unsubscribeErrors = conversationManager.subscribeToErrors((error) => {
      addErrorMessage(`${error.code}: ${error.message}`);
    });

    const unsubscribeSources = conversationManager.subscribeToSources((sourcesData) => {
      // Format sources for display
      const formattedSources = sourcesData.sources.map((source: object, index) => ({
        title: source["title"] || `Source ${index + 1}`,
        url: source["url"] || '#',
        snippet: source["snippet"] || JSON.stringify(source).substring(0, 150) + '...'
      }));

      const newSourcesByQuery: SourcesByQuery = {
        callId: sourcesData.callId,
        indexUid: sourcesData.indexUid,
        query: sourcesData.query,
        sources: formattedSources
      };

      // Add to sources by query
      setSourcesByQuery(prev => [...prev, newSourcesByQuery]);

      // Update the latest assistant message with sources
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastAssistantIndex = updatedMessages.map(m => m.type).lastIndexOf('assistant');

        if (lastAssistantIndex !== -1) {
          updatedMessages[lastAssistantIndex] = {
            ...updatedMessages[lastAssistantIndex],
            sources: (updatedMessages[lastAssistantIndex].sources || []).concat(formattedSources)
          };
        }

        return updatedMessages;
      });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeErrors();
      unsubscribeSources();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear search progress when not searching
    if (!isSearching) {
      setSearchProgress(null);
    }
  }, [isSearching]);

  const handleShowSources = (sources: Array<{ title: string; url: string; snippet: string }>) => {
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
    setSourcesByQuery([]);
    setHasStartedChat(false);
    setSearchProgress(null);
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
              searchProgress={searchProgress}
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
        sourcesByQuery={sourcesByQuery}
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
