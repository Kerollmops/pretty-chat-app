import OpenAI from 'openai';

// Define interfaces for cleaner typing
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface StreamOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream: boolean;
  tools?: Tool[];
  tool_choice?: string | object;
}

// Tool call related interfaces
export interface ToolCall {
  type: string;
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

// Create a singleton OpenAI client instance
class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;

  private constructor(baseURL: string, apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true // Note: This is for client-side usage. In production, proxy through your backend.
    });
  }

  public static getInstance(baseURL: string, apiKey: string): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService(baseURL, apiKey);
    }
    return OpenAIService.instance;
  }

  /**
   * Stream chat completions from OpenAI
   * @param options Chat completion options
   * @param onChunk Callback function to handle each chunk of the stream
   * @param onError Callback function to handle errors
   * @param onComplete Callback function to execute when the stream is complete
   */
  public async streamChatCompletions(
    options: StreamOptions,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        stream: true,
        tools: options.tools,
        tool_choice: options.tool_choice,
      });

      // Process the stream using the OpenAI SDK
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }

        // Check for tool calls (this is where we would intercept them)
        const toolCall = chunk.choices[0]?.delta?.tool_calls?.[0];
        if (toolCall) {
          this.processToolCall(toolCall as Partial<ToolCall>);
        }
      }

      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  /**
   * Process a tool call from the LLM
   * @param toolCall The tool call object from the OpenAI API
   */
  private processToolCall(toolCall: Partial<ToolCall>): void {
    try {
      const toolName = toolCall.function?.name;
      const toolArgs = toolCall.function?.arguments;

      if (toolName && typeof window[toolName] === 'function') {
        console.log(`Executing tool call: ${toolName}`);

        // Parse arguments and call the tool function
        const args = toolArgs ? JSON.parse(toolArgs) : {};
        window[toolName](args);
      }
    } catch (error) {
      console.error('Error processing tool call:', error);

      // Report error using the error reporting tool if available
      if (typeof window['_meiliReportError'] === 'function') {
        window['_meiliReportError']({
          error_code: 'TOOL_CALL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error processing tool call'
        });
      }
    }
  }

  /**
   * Get non-streamed chat completions from OpenAI
   * @param options Chat completion options without stream flag
   * @returns Promise with the completion response
   */
  public async getChatCompletions(
    options: Omit<StreamOptions, 'stream'>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return this.client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      stream: false,
      tools: options.tools,
      tool_choice: options.tool_choice,
    });
  }
}

export default OpenAIService;
