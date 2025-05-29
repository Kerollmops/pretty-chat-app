
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
  onShowSources: (sources: Array<{ title: string; url: string; snippet: string }>) => void;
  onDismissError: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({ 
  messages, 
  isSearching, 
  isLoading, 
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

        {isSearching && (
          <ProgressIndicator message="Searching for documents..." />
        )}

        {isLoading && !isSearching && (
          <ProgressIndicator message="Generating response..." />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
