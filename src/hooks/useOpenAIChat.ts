
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, UseOpenAIChatOptions } from '@/types/chatTypes';
import ConversationManager from '@/utils/conversationManager';
import { ChatStreamHandler } from '@/utils/chatStreamHandler';

export const useOpenAIChat = (options?: UseOpenAIChatOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationManager] = useState(() => ConversationManager.getInstance());
  const [streamHandler] = useState(() => new ChatStreamHandler());

  // Initialize tool interceptor
  useEffect(() => {
    conversationManager.initializeToolInterceptor();

    return () => {
      conversationManager.restoreOriginalFunction();
    };
  }, [conversationManager]);

  const streamChatCompletion = useCallback(
    async (
      uiMessages: ChatMessage[],
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      onComplete?: () => void
    ): Promise<void> => {
      return streamHandler.streamChatCompletion(
        uiMessages,
        setMessages,
        setIsSearching,
        setIsLoading,
        options,
        onComplete
      );
    },
    [streamHandler, options]
  );

  return {
    streamChatCompletion,
    isLoading,
    isSearching
  };
};

export default useOpenAIChat;
