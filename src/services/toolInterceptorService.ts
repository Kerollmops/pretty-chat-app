import { useState, useEffect, useCallback } from 'react';

// Define the tool interfaces based on tools.txt
export interface MeiliSearchProgressParams {
  // The call id is associated to the search progress call id.
  // Use it to track the index uid and query in the sources.
  call_id: string;
  // Will always be _meiliSearchInIndex
  function_name: string;
  function_arguments: string;
}

export interface MeiliSearchProgressArguments {
  index_uid: string;
  q: string;
}

interface ToolCall {
  type: string;
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface MeiliAppendConversationMessageParams {
  role: string;
  content: string;
  tool_calls: ToolCall[] | null;
  tool_call_id: string | null;
}

export interface MeiliSearchSourcesParams {
  // The call id is associated to the search progress call id.
  // Use it to track the index uid and query in the sources.
  call_id: string;
  // Sources are composed of raw JSON objects with arbitrary fields.
  sources: Array<object>;
}

interface ToolFunctions {
  _meiliSearchProgress: (params: MeiliSearchProgressParams) => void;
  _meiliAppendConversationMessage: (params: MeiliAppendConversationMessageParams) => void;
  _meiliSearchSources: (params: MeiliSearchSourcesParams) => void;
}

class ToolInterceptorService {
  private static instance: ToolInterceptorService | null = null;
  private originalWindow: Window & typeof globalThis;
  private registeredTools: boolean = false;

  private constructor() {
    this.originalWindow = window;
    this.registerToolInterceptors();
  }

  public static getInstance(): ToolInterceptorService {
    if (!ToolInterceptorService.instance) {
      ToolInterceptorService.instance = new ToolInterceptorService();
    }
    return ToolInterceptorService.instance;
  }

  private registerToolInterceptors(): void {
    if (this.registeredTools) {
      return;
    }

    // Define the tool interceptors
    const toolFunctions: ToolFunctions = {
      _meiliSearchProgress: (params: MeiliSearchProgressParams) => {
        console.log('Intercepted _meiliSearchProgress:', params);
        // Dummy implementation - just log the call
      },

      _meiliAppendConversationMessage: (params: MeiliAppendConversationMessageParams) => {
        console.log('Intercepted _meiliAppendConversationMessage:', params);
        // Message is automatically added to the OpenAI conversation context
      },

      _meiliSearchSources: (params: MeiliSearchSourcesParams) => {
        console.log('Intercepted _meiliSearchSources:', params);
        // Dummy implementation - just log the call
      },
    };

    // Register the tools on the global window object
    Object.entries(toolFunctions).forEach(([name, fn]) => {
      (window as unknown as Record<string, (...args: unknown[]) => unknown>)[name] = fn;
    });

    this.registeredTools = true;
    console.log('Tool interceptors registered successfully');
  }

  /**
   * Reset the tools to their original state (if needed)
   */
  public resetTools(): void {
    // If needed, implement logic to restore original functions
    console.log('Tool interceptors reset');
    this.registeredTools = false;
    this.registerToolInterceptors();
  }
}

export default ToolInterceptorService;
