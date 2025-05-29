
import React from 'react';
import ChatInputArea from './ChatInputArea';

interface ChatWelcomeProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const ChatWelcome = ({
  input,
  setInput,
  onSend,
  onKeyPress,
  isLoading,
  textareaRef
}: ChatWelcomeProps) => {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-normal mb-6">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground text-lg">
            Chat with Meilisearch to find information quickly. Ask questions about your documents and get personalized results from your indexes. Meilisearch makes finding information natural and effortless by searching through your data to deliver relevant answers to your queries.
          </p>
        </div>

        <div className="relative">
          <div className="relative border border-border rounded-xl overflow-hidden hover:shadow-lg focus-within:shadow-md transition-shadow duration-200">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={onKeyPress}
              placeholder="Ask anything about the content of the indexes"
              className="resize-none min-h-[60px] border-0 focus:ring-0 text-base px-4 py-4 pr-12 w-full bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
              disabled={isLoading}
              data-enable-grammarly="false"
              autoFocus
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                onClick={onSend}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
