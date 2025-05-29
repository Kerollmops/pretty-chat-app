
import { useState, useCallback, useEffect } from 'react';
import OpenAIService, { Message as OpenAIMessage, ToolCall, Tool } from '@/services/openaiService';
import { OPENAI_CONFIG, createSystemMessage, isConfigValid } from '@/config/openai';
import ToolInterceptorService from '@/services/toolInterceptorService';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'tool';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface UseOpenAIChatOptions {
  onError?: (message: string) => void;
}

export const useOpenAIChat = (options?: UseOpenAIChatOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<OpenAIMessage[]>([createSystemMessage()]);

  // Ensure tool interceptor is initialized
  useEffect(() => {
    ToolInterceptorService.getInstance();

    // Override the original _meiliAppendConversationMessage function
    const originalFn = window['_meiliAppendConversationMessage'];
    window['_meiliAppendConversationMessage'] = (newMessage: OpenAIMessage) => {
      console.log('Tool message intercepted:', newMessage);
      // Append message to conversationMessages
      setConversationMessages(prev => {
        console.log('Appending message:', newMessage);
        return [...prev, newMessage];
      });

      if (originalFn) {
        originalFn(newMessage);
      }
    };

    return () => {
      // Restore the original function when component unmounts
      window['_meiliAppendConversationMessage'] = originalFn;
    };
  }, []);

  const streamChatCompletion = useCallback(
    async (
      uiMessages: ChatMessage[],
      setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
      onComplete?: () => void
    ): Promise<void> => {

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
        
        setConversationMessages(prev => [...prev, userOpenAIMessage]);
      }

      // Create a placeholder message for streaming with a distinctive ID
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        sources: [] // Empty sources initially
      };

      // Add empty message that will be updated with stream
      setMessages(prev => [...prev, assistantMessage]);

      // Set searching state
      setIsSearching(true);

      try {
        // Simulate search phase
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSearching(false);
        setIsLoading(true);

        // Initialize OpenAI service with API key
        const openAIService = OpenAIService.getInstance(OPENAI_CONFIG.apiUrl, OPENAI_CONFIG.apiKey);

        // Register tool functions for the LLM to call
        const tools: Tool[] = [
          {
            type: "function",
            function: {
              name: "_meiliSearchProgress",
              description: "Provides information about the current Meilisearch search operation",
              parameters: {
                type: "object",
                properties: {
                  call_id: {
                    type: "string",
                    description: "The call ID to track the sources of the search"
                  },
                  function_name: {
                    type: "string",
                    description: "The name of the function we are executing"
                  },
                  function_parameters: {
                    type: "string",
                    description: "The parameters of the function we are executing, encoded in JSON"
                  }
                },
                required: ["function_name", "function_parameters"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "_meiliAppendConversationMessage",
              description: "Append a new message to the conversation based on what happened internally",
              parameters: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    description: "The role of the messages author, either `role` or `assistant`"
                  },
                  content: {
                    type: "string",
                    description: "The contents of the `assistant` or `tool` message. Required unless `tool_calls` is specified."
                  },
                  tool_calls: {
                    type: ["array", "null"],
                    description: "The tool calls generated by the model, such as function calls",
                    items: {
                      type: "object",
                      properties: {
                        function: {
                          type: "object",
                          description: "The function that the model called",
                          properties: {
                            name: {
                              type: "string",
                              description: "The name of the function to call"
                            },
                            arguments: {
                              type: "string",
                              description: "The arguments to call the function with, as generated by the model in JSON format. Note that the model does not always generate valid JSON, and may hallucinate parameters not defined by your function schema. Validate the arguments in your code before calling your function."
                            }
                          },
                          required: ["name", "arguments"],
                          additionalProperties: false
                        },
                        id: {
                          type: "string",
                          description: "The ID of the tool call"
                        },
                        type: {
                          type: "string",
                          description: "The type of the tool. Currently, only function is supported"
                        }
                      }
                    }
                  },
                  tool_call_id: {
                    type: ["string", "null"],
                    description: "Tool call that this message is responding to"
                  }
                },
                required: ["role", "content", "tool_calls", "tool_call_id"],
                additionalProperties: false
              }
            }
          },
          {
            type: "function",
            function: {
              name: "_meiliSearchSources",
              description: "Provides sources of the search",
              parameters: {
                type: "object",
                properties: {
                  call_id: {
                    type: "string",
                    description: "The call ID to track the original search associated to those sources"
                  },
                  documents: {
                    type: "object",
                    description: "The documents associated with the search (call_id). Only the displayed attributes of the documents are returned"
                  }
                },
                required: ["call_id", "documents"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "_meiliReportError",
              description: "Report dynamic errors that can happen while talking to the LLM",
              parameters: {
                type: "object",
                properties: {
                  error_code: {
                    type: "string",
                    description: "An error string that eases detecting the kind of error that happened"
                  },
                  message: {
                    type: "string",
                    description: "An error message to help understand what happened"
                  }
                },
                required: ["error_code", "message"]
              }
            }
          }
        ];

        console.log('Sending conversationMessages to OpenAI:', conversationMessages);

        // Use conversationMessages directly instead of formatting UI messages
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
            // Find and update only the assistant message with the matching ID
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
            
            // Get the final assistant message content
            setMessages(prev => {
              const finalMessage = prev.find(msg => msg.id === assistantMessageId);
              if (finalMessage && finalMessage.content) {
                // Add the assistant's response to conversationMessages
                const assistantOpenAIMessage: OpenAIMessage = {
                  role: 'assistant',
                  content: finalMessage.content
                };
                setConversationMessages(prevConv => [...prevConv, assistantOpenAIMessage]);
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
    },
    [conversationMessages, options]
  );

  return {
    streamChatCompletion,
    isLoading,
    isSearching
  };
};

export default useOpenAIChat;
