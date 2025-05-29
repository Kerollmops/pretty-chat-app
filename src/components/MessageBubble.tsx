
import React, { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'tool';
  content: string;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  timestamp: Date;
  tool_calls?: Array<{
    id: string;
    type: string;
    function?: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
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
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none mb-4",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
          "prose-p:leading-7 prose-p:my-4 first:prose-p:mt-0 last:prose-p:mb-0",
          "prose-li:my-1",
          "prose-code:rounded prose-code:bg-muted prose-code:p-1 prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:rounded-md",
          "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
          "prose-img:rounded-md prose-img:max-w-full",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-table:border prose-table:border-border",
          "prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted",
          "prose-td:border prose-td:border-border prose-td:p-2"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize, rehypeRaw]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                  {props.children}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              ),
              pre: ({ node, ...props }) => (
                <pre {...props} className="p-4 overflow-x-auto" />
              ),
              code: ({ node, inline, className, children, ...props }) => (
                inline ?
                <code className={className} {...props}>{children}</code> :
                <code className={cn("block text-sm p-4", className)} {...props}>{children}</code>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
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
              <FileText className="h-3 w-3" />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
