
import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface SourcesPanelProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

const SourcesPanel = ({ sources, isOpen, onClose }: SourcesPanelProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sources Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Sources</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-65px)] p-4">
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div
                key={index}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-card-foreground text-sm leading-tight">
                    {source.title}
                  </h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:text-primary/80 transition-colors duration-200 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  {source.snippet}
                </p>
                
                <div className="text-xs text-muted-foreground break-all">
                  {source.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SourcesPanel;
