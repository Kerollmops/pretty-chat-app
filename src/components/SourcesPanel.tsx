
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
        fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-65px)] p-4">
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {source.title}
                  </h3>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                  {source.snippet}
                </p>
                
                <div className="text-xs text-gray-500 break-all">
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
