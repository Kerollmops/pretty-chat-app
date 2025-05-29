
import { OpenAIMessage } from '@/types/chatTypes';
import { createSystemMessage } from '@/config/openai';
import { MeiliReportErrorParams, MeiliSearchProgressArguments, MeiliSearchProgressParams, MeiliSearchSourcesParams } from '@/services/toolInterceptorService';

interface SearchQuery {
  callId: string;
  indexUid: string;
  query: string;
}

interface SourcesByQuery {
  callId: string;
  indexUid: string;
  query: string;
  sources: Array<object>;
}

class ConversationManager {
  private static instance: ConversationManager;
  private conversationMessages: OpenAIMessage[] = [createSystemMessage()];
  private listeners: ((messages: OpenAIMessage[]) => void)[] = [];
  private progressListeners: ((progress: SearchQuery) => void)[] = [];
  private errorListeners: ((error: { code: string; message: string }) => void)[] = [];
  private sourcesListeners: ((sources: SourcesByQuery) => void)[] = [];
  private searchQueries: Map<string, SearchQuery> = new Map();

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

  public subscribeToProgress(listener: (progress: SearchQuery) => void): () => void {
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

  public subscribeToSources(listener: (sources: SourcesByQuery) => void): () => void {
    this.sourcesListeners.push(listener);
    return () => {
      this.sourcesListeners = this.sourcesListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.conversationMessages));
  }

  private notifyProgressListeners(progress: SearchQuery): void {
    this.progressListeners.forEach(listener => listener(progress));
  }

  private notifyErrorListeners(error: { code: string; message: string }): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  private notifySourcesListeners(sources: SourcesByQuery): void {
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
      const params: MeiliSearchProgressArguments = JSON.parse(progress.function_arguments);
      const searchQuery: SearchQuery = {
        callId: progress.call_id,
        indexUid: params.index_uid,
        query: params.q
      };

      // Store the search query for later reference
      this.searchQueries.set(progress.call_id, searchQuery);

      this.notifyProgressListeners(searchQuery);

      // When a tool call is made we must register a newline
      const messages = this.getMessages();
      if (messages.length > 0) {
        if (messages[messages.length - 1].content) {
          messages[messages.length - 1].content.concat('\n');
        }
      }

      if (originalProgressFn) {
        originalProgressFn(progress);
      }
    };

    const originalErrorFn = window['_meiliReportError'];
    window['_meiliReportError'] = (error: MeiliReportErrorParams) => {
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
      // Get the associated search query
      const searchQuery = this.searchQueries.get(sources.call_id);

      if (searchQuery) {
        const sourcesByQuery: SourcesByQuery = {
          callId: sources.call_id,
          indexUid: searchQuery.indexUid,
          query: searchQuery.query,
          sources: sources.sources
        };

        this.notifySourcesListeners(sourcesByQuery);
      }

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
