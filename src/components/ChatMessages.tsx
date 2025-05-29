
import React from 'react';
import MessageBubble from './MessageBubble';
import ErrorMessage from './ErrorMessage';
import ProgressIndicator from './ProgressIndicator';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isSearching: boolean;
  isLoading: boolean;
  searchProgress?: { callId: string; indexUid: string; query: string } | null;
  onShowSources: (sources: Array<{ title: string; url: string; snippet: string }>) => void;
  onDismissError: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({
  messages,
  isSearching,
  isLoading,
  searchProgress,
  onShowSources,
  onDismissError,
  messagesEndRef
}: ChatMessagesProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message) => {
          if (message.type === 'error') {
            return (
              <ErrorMessage
                key={message.id}
                message={message.content}
                onDismiss={() => onDismissError(message.id)}
              />
            );
          }
          return (
            <MessageBubble
              key={message.id}
              message={message}
              onShowSources={onShowSources}
            />
          );
        })}

        {/* Only show search progress when we have actual search data */}
        {isSearching && searchProgress && (
          <ProgressIndicator
            message={`Searching in index "${searchProgress.indexUid}" for: *${searchProgress.query}*`}
          />
        )}

        {isLoading && !isSearching && messages.length > 0 && messages[messages.length - 1].content.trim().length === 0 && (
          <ProgressIndicator message="Generating response..." />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
