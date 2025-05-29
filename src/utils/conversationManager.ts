
import { OpenAIMessage } from '@/types/chatTypes';
import { createSystemMessage } from '@/config/openai';
import { MeiliReportErrorParams, MeiliSearchProgressArguments, MeiliSearchProgressParams, MeiliSearchSourcesParams } from '@/services/toolInterceptorService';

class ConversationManager {
  private static instance: ConversationManager;
  private conversationMessages: OpenAIMessage[] = [createSystemMessage()];
  private listeners: ((messages: OpenAIMessage[]) => void)[] = [];
  private progressListeners: ((progress: { indexUid: string; query: string }) => void)[] = [];
  private errorListeners: ((error: { code: string; message: string }) => void)[] = [];
  private sourcesListeners: ((sources: { callId: string; sources: Array<object> }) => void)[] = [];

  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  public getMessages(): OpenAIMessage[] {
    return [...this.conversationMessages];
  }

  public addMessage(message: OpenAIMessage): void {
    this.conversationMessages = [...this.conversationMessages, message];
    this.notifyListeners();
  }

  public setMessages(messages: OpenAIMessage[]): void {
    this.conversationMessages = messages;
    this.notifyListeners();
  }

  public subscribe(listener: (messages: OpenAIMessage[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeToProgress(listener: (progress: { indexUid: string; query: string }) => void): () => void {
    this.progressListeners.push(listener);
    return () => {
      this.progressListeners = this.progressListeners.filter(l => l !== listener);
    };
  }

  public subscribeToErrors(listener: (error: { code: string; message: string }) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  public subscribeToSources(listener: (sources: { callId: string; sources: Array<object> }) => void): () => void {
    this.sourcesListeners.push(listener);
    return () => {
      this.sourcesListeners = this.sourcesListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.conversationMessages));
  }

  private notifyProgressListeners(progress: { indexUid: string; query: string }): void {
    this.progressListeners.forEach(listener => listener(progress));
  }

  private notifyErrorListeners(error: { code: string; message: string }): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  private notifySourcesListeners(sources: { callId: string; sources: Array<object> }): void {
    this.sourcesListeners.forEach(listener => listener(sources));
  }

  public initializeToolInterceptor(): void {
    const originalAppendFn = window['_meiliAppendConversationMessage'];
    window['_meiliAppendConversationMessage'] = (newMessage: OpenAIMessage) => {
      this.addMessage(newMessage);
      if (originalAppendFn) {
        originalAppendFn(newMessage);
      }
    };

    const originalProgressFn = window['_meiliSearchProgress'];
    window['_meiliSearchProgress'] = (progress: MeiliSearchProgressParams) => {
      // Display the progress of a search with the index_uid and q
      const params: MeiliSearchProgressArguments = JSON.parse(progress.function_arguments);
      this.notifyProgressListeners({
        indexUid: params.index_uid,
        query: params.q
      });

      if (originalProgressFn) {
        originalProgressFn(progress);
      }
    };

    const originalErrorFn = window['_meiliReportError'];
    window['_meiliReportError'] = (error: MeiliReportErrorParams) => {
      // Display the error on the frontend by notifying error listeners
      this.notifyErrorListeners({
        code: error.error_code,
        message: error.message
      });

      if (originalErrorFn) {
        originalErrorFn(error);
      }
    };

    const originalSourceFn = window['_meiliSearchSources'];
    window['_meiliSearchSources'] = (sources: MeiliSearchSourcesParams) => {
      // Add the sources to be integrated with assistant messages
      this.notifySourcesListeners({
        callId: sources.call_id,
        sources: sources.sources
      });

      if (originalSourceFn) {
        originalSourceFn(sources);
      }
    };
  }

  public restoreOriginalFunction(): void {
    // This would need to store the original function reference
    // For now, we'll leave it as is since it's a global override
  }
}

export default ConversationManager;
