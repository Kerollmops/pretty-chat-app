
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'tool';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  type: "function";
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface UseOpenAIChatOptions {
  onError?: (message: string) => void;
}
