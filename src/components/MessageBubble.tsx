
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onShowSources: (sources: Array<{ title: string; url: string; snippet: string }>) => void;
}

const MessageBubble = ({ message, onShowSources }: MessageBubbleProps) => {
  const isUser = message.type === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[70%] ml-12">
          <div className="rounded-2xl px-4 py-3 bg-gray-900 text-white ml-auto">
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - no bubble
  return (
    <div className="animate-fade-in">
      <div className="max-w-none mr-12">
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900 mb-4">
          {message.content}
        </div>
        
        {/* Sources Button */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowSources(message.sources!)}
              className="text-xs h-7 px-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 rounded-full"
            >
              <FileText className="h-3 w-3 mr-1" />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
