
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const ChatInputArea = ({
  input,
  setInput,
  onSend,
  onKeyPress,
  isLoading,
  textareaRef
}: ChatInputAreaProps) => {
  return (
    <div className="bg-background p-4 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative border border-border rounded-xl overflow-hidden hover:shadow-lg focus-within:shadow-md transition-shadow duration-200">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={onKeyPress}
            placeholder="Ask anything about the content of the indexes"
            className="resize-none min-h-[60px] border-0 focus:ring-0 focus-visible:ring-0 text-base px-4 py-4 pr-12"
            disabled={isLoading}
            data-enable-grammarly="false"
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <Button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;
