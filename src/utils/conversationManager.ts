
import { OpenAIMessage } from '@/types/chatTypes';
import { createSystemMessage } from '@/config/openai';
import { MeiliReportErrorParams, MeiliSearchProgressParams, MeiliSearchSourcesParams } from '@/services/toolInterceptorService';

class ConversationManager {
  private static instance: ConversationManager;
  private conversationMessages: OpenAIMessage[] = [createSystemMessage()];
  private listeners: ((messages: OpenAIMessage[]) => void)[] = [];

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

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.conversationMessages));
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
      // TODO: Display the progress of a search with the index_uid and q
      //       By using the ProgressIndicator.
      if (originalProgressFn) {
        originalProgressFn(progress);
      }
    };

    const originalErrorFn = window['_meiliReportError'];
    window['_meiliReportError'] = (error: MeiliReportErrorParams) => {
      // TODO: Display the error on the frontend
      if (originalErrorFn) {
        originalErrorFn(error);
      }
    };

    const originalSourceFn = window['_meiliSearchSources'];
    window['_meiliSearchSources'] = (sources: MeiliSearchSourcesParams) => {
      // TODO: Add the sources on the assistant message so
      //       that they can be seen on the side panel.
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
