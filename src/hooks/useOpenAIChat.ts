import { useState, useCallback } from 'react';
import OpenAIService, { Message as OpenAIMessage, ToolCall } from '@/services/openaiService';
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

  // Ensure tool interceptor is initialized
  useCallback(() => {
    ToolInterceptorService.getInstance();
  }, []);

  // Convert our app message format to OpenAI message format
  const formatMessages = (messages: ChatMessage[]): OpenAIMessage[] => {
    // Start with system message
    const formattedMessages: OpenAIMessage[] = [createSystemMessage()];

    // Add conversation history
    messages.forEach(message => {
      if (message.type === 'user' || message.type === 'assistant' || message.type === 'tool') {
        const formattedMessage: any = {
          role: message.type,
          content: message.content
        };

        // Add tool calls if present
        if (message.tool_calls) {
          formattedMessage.tool_calls = message.tool_calls;
        }

        // Add tool call ID if this is a tool response
        if (message.tool_call_id) {
          formattedMessage.tool_call_id = message.tool_call_id;
        }

        formattedMessages.push(formattedMessage);
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
      // Make sure this message is always added at the end
      setMessages(prev => [...prev, assistantMessage]);

      // Set searching state (this could be connected to a real search in the future)
      setIsSearching(true);

      try {
        // Simulate search phase - replace with actual search implementation if needed
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSearching(false);
        setIsLoading(true);

        // Initialize OpenAI service with API key
        const openAIService = OpenAIService.getInstance(OPENAI_CONFIG.apiUrl, OPENAI_CONFIG.apiKey);

        // Register tool functions for the LLM to call
        const tools = [
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
              },
              strict: true
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

        // Start streaming with the official OpenAI SDK
        await openAIService.streamChatCompletions(
          {
            model: OPENAI_CONFIG.model,
            messages: formatMessages(messages),
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
