
import React from 'react';
import { Settings, Trash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isApiKeySet: boolean;
  onShowSettings: () => void;
  onClearChat: () => void;
}

const ChatHeader = ({ isApiKeySet, onShowSettings, onClearChat }: ChatHeaderProps) => {
  return (
    <div className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={onShowSettings}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onClick={onClearChat}
        >
          <Trash className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-medium">Dialogue with Meilisearch</h1>

        {!isApiKeySet && (
          <div className="flex items-center ml-2 text-amber-500">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-xs">API key not set</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
