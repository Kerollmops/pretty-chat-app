// Get values from localStorage if available, fall back to defaults
const getStoredValue = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || defaultValue;
  }
  return defaultValue;
};

// OpenAI configuration
export const OPENAI_CONFIG = {
  // Default model to use for chat completions, use stored value if available
  model: getStoredValue('model', 'gpt-3.5-turbo'),

  // The API key should be set in localStorage or environment variable
  apiKey: getStoredValue('api_key', import.meta.env.VITE_OPENAI_API_KEY || ''),

  apiUrl: getStoredValue('api_url', 'http://localhost:7700'),

  // Default parameters for chat completions
  defaultParams: {
    temperature: Number(getStoredValue('temperature', '0.7')),
    max_tokens: Number(getStoredValue('max_tokens', '1000')),
    // Set to true for streaming responses
    stream: true,
  }
};

// Create system message for the chat
export const createSystemMessage = () => ({
  role: 'system' as const,
  content: 'You are a helpful AI assistant integrated with Meilisearch. Answer questions about the content of the indexes or any other topic with accurate and relevant information. Format your responses using Markdown to enhance readability. Use headings, lists, bold/italic text, code blocks, and other formatting when appropriate to structure your responses. Include code snippets with proper syntax highlighting when providing examples.'
});

// Validate that API key is set
export const isConfigValid = (): boolean => {
  // Refresh config from localStorage in case it was updated
  if (typeof window !== 'undefined') {
    OPENAI_CONFIG.apiKey = localStorage.getItem('api_key') || OPENAI_CONFIG.apiKey;
  }
  return !!OPENAI_CONFIG.apiKey;
};
