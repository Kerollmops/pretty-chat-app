import { useState, useCallback } from 'react';
import OpenAIService, { Message as OpenAIMessage } from '@/services/openaiService';
import { OPENAI_CONFIG, createSystemMessage, isConfigValid } from '@/config/openai';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

interface UseOpenAIChatOptions {
  onError?: (message: string) => void;
}

export const useOpenAIChat = (options?: UseOpenAIChatOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Convert our app message format to OpenAI message format
  const formatMessages = (messages: ChatMessage[]): OpenAIMessage[] => {
    // Start with system message
    const formattedMessages: OpenAIMessage[] = [createSystemMessage()];
    
    // Add conversation history
    messages.forEach(message => {
      if (message.type === 'user' || message.type === 'assistant') {
        formattedMessages.push({
          role: message.type,
          content: message.content
        });
      }
    });
    
    return formattedMessages;
  };

  const streamChatCompletion = useCallback(
    async (
      messages: ChatMessage[],
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      onComplete?: () => void
    ): Promise<void> => {
      if (!isConfigValid()) {
        options?.onError?.('OpenAI API key is not configured');
        return;
      }

      // Create a placeholder message for streaming
      const assistantMessageId = Date.now().toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        sources: [] // Empty sources initially
      };

      // Add empty message that will be updated with stream
      setMessages(prev => [...prev, assistantMessage]);
      
      // Set searching state (this could be connected to a real search in the future)
      setIsSearching(true);
      
      try {
        // Simulate search phase - replace with actual search implementation if needed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSearching(false);
        setIsLoading(true);
        
        // Initialize OpenAI service with API key
        const openAIService = OpenAIService.getInstance(OPENAI_CONFIG.apiKey);
        
        // Start streaming with the official OpenAI SDK
        await openAIService.streamChatCompletions(
          {
            model: OPENAI_CONFIG.model,
            messages: formatMessages(messages),
            temperature: OPENAI_CONFIG.defaultParams.temperature,
            max_tokens: OPENAI_CONFIG.defaultParams.max_tokens,
            stream: true,
          },
          // Handle each chunk of the stream
          (chunk: string) => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          // Handle errors
          (error: Error) => {
            setIsLoading(false);
            options?.onError?.(error.message);
          },
          // Handle completion
          () => {
            setIsLoading(false);
            
            // Add sources when complete (replace with real sources if available)
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId
                  ? { 
                      ...msg, 
                      sources: [
                        {
                          title: "OpenAI Documentation",
                          url: "https://platform.openai.com/docs",
                          snippet: "Official documentation for OpenAI's API and models."
                        },
                        {
                          title: "Meilisearch Documentation",
                          url: "https://docs.meilisearch.com/",
                          snippet: "Learn how to integrate and use Meilisearch for powerful search capabilities."
                        }
                      ]
                    }
                  : msg
              )
            );
            
            onComplete?.();
          }
        );
      } catch (error) {
        setIsLoading(false);
        setIsSearching(false);
        options?.onError?.(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    },
    [options]
  );

  return {
    streamChatCompletion,
    isLoading,
    isSearching
  };
};

export default useOpenAIChat;