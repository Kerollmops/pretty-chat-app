
import { OpenAIMessage } from '@/types/chatTypes';
import { createSystemMessage } from '@/config/openai';

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
    const originalFn = window['_meiliAppendConversationMessage'];
    window['_meiliAppendConversationMessage'] = (newMessage: OpenAIMessage) => {
      console.log('Tool message intercepted:', newMessage);
      this.addMessage(newMessage);

      if (originalFn) {
        originalFn(newMessage);
      }
    };
  }

  public restoreOriginalFunction(): void {
    // This would need to store the original function reference
    // For now, we'll leave it as is since it's a global override
  }
}

export default ConversationManager;
