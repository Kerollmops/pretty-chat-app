import OpenAI from 'openai';

// Define interfaces for cleaner typing
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream: boolean;
}

// Create a singleton OpenAI client instance
class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;

  private constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: This is for client-side usage. In production, proxy through your backend.
    });
  }

  public static getInstance(apiKey: string): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService(apiKey);
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
      });

      // Process the stream using the OpenAI SDK
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }

      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
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
    });
  }
}

export default OpenAIService;