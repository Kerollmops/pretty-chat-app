import { useState, useEffect, useCallback } from 'react';

// Define the tool interfaces based on tools.txt
interface MeiliSearchProgressParams {
  call_id?: string;
  function_name: string;
  function_parameters: string;
}

interface MeiliAppendConversationMessageParams {
  role: string;
  content: string;
  tool_calls: any[] | null;
  tool_call_id: string | null;
}

interface MeiliSearchSourcesParams {
  call_id: string;
  documents: object;
}

interface MeiliReportErrorParams {
  error_code: string;
  message: string;
}

interface ToolFunctions {
  _meiliSearchProgress: (params: MeiliSearchProgressParams) => void;
  _meiliAppendConversationMessage: (params: MeiliAppendConversationMessageParams) => void;
  _meiliSearchSources: (params: MeiliSearchSourcesParams) => void;
  _meiliReportError: (params: MeiliReportErrorParams) => void;
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
        // Dummy implementation - just log the call
      },

      _meiliSearchSources: (params: MeiliSearchSourcesParams) => {
        console.log('Intercepted _meiliSearchSources:', params);
        // Dummy implementation - just log the call
      },

      _meiliReportError: (params: MeiliReportErrorParams) => {
        console.log('Intercepted _meiliReportError:', params);
        // Dummy implementation - just log the call
      }
    };

    // Register the tools on the global window object
    Object.entries(toolFunctions).forEach(([name, fn]) => {
      (window as any)[name] = fn;
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