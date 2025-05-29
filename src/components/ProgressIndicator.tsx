
import React from 'react';

interface ProgressIndicatorProps {
  message?: string;
}

const ProgressIndicator = ({ message = "Searching for documents..." }: ProgressIndicatorProps) => {
  // Parse the message for italic formatting
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs border border-border">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <span className="text-sm text-muted-foreground">{formatMessage(message)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
