
import { ChatMessage, OpenAIMessage, UseOpenAIChatOptions } from '@/types/chatTypes';
import OpenAIService from '@/services/openaiService';
import { OPENAI_CONFIG, isConfigValid } from '@/config/openai';
import { createChatTools } from './chatTools';
import ConversationManager from './conversationManager';

export class ChatStreamHandler {
  private conversationManager: ConversationManager;

  constructor() {
    this.conversationManager = ConversationManager.getInstance();
  }

  async streamChatCompletion(
    uiMessages: ChatMessage[],
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setIsSearching: (searching: boolean) => void,
    setIsLoading: (loading: boolean) => void,
    options?: UseOpenAIChatOptions,
    onComplete?: () => void
  ): Promise<void> {
    if (!isConfigValid()) {
      options?.onError?.('OpenAI API key is not configured');
      return;
    }

    // Add the latest user message to conversationMessages
    const latestUserMessage = uiMessages[uiMessages.length - 1];
    if (latestUserMessage && latestUserMessage.type === 'user') {
      const userOpenAIMessage: OpenAIMessage = {
        role: 'user',
        content: latestUserMessage.content
      };
      
      this.conversationManager.addMessage(userOpenAIMessage);
    }

    // Create a placeholder message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsSearching(true);

    try {
      // Simulate search phase
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSearching(false);
      setIsLoading(true);

      const openAIService = OpenAIService.getInstance(OPENAI_CONFIG.apiUrl, OPENAI_CONFIG.apiKey);
      const tools = createChatTools();
      const conversationMessages = this.conversationManager.getMessages();

      console.log('Sending conversationMessages to OpenAI:', conversationMessages);

      await openAIService.streamChatCompletions(
        {
          model: OPENAI_CONFIG.model,
          messages: conversationMessages,
          temperature: OPENAI_CONFIG.defaultParams.temperature,
          max_tokens: OPENAI_CONFIG.defaultParams.max_tokens,
          stream: true,
          tools: tools,
          tool_choice: "auto",
        },
        // Handle each chunk of the stream
        (chunk: string) => {
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === assistantMessageId) {
                return { ...msg, content: msg.content + chunk };
              }
              return msg;
            })
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
          
          // Get the final assistant message content and add to conversation
          setMessages(prev => {
            const finalMessage = prev.find(msg => msg.id === assistantMessageId);
            if (finalMessage && finalMessage.content) {
              const assistantOpenAIMessage: OpenAIMessage = {
                role: 'assistant',
                content: finalMessage.content
              };
              this.conversationManager.addMessage(assistantOpenAIMessage);
            }

            // Add sources when complete
            return prev.map(msg =>
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
            );
          });

          onComplete?.();
        }
      );
    } catch (error) {
      setIsLoading(false);
      setIsSearching(false);
      options?.onError?.(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
}
