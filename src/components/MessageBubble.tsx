
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SourcesModal from './SourcesModal';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [showSources, setShowSources] = useState(false);

  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[70%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gray-900 text-white ml-auto'
              : 'bg-gray-50 text-gray-900 border border-gray-100'
          }`}
        >
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* Sources Button */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSources(true)}
              className="text-xs h-7 px-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 rounded-full"
            >
              <FileText className="h-3 w-3 mr-1" />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {/* Sources Modal */}
        {message.sources && (
          <SourcesModal
            sources={message.sources}
            isOpen={showSources}
            onClose={() => setShowSources(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
