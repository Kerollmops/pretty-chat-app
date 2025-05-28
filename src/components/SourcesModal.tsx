
import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface SourcesModalProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

const SourcesModal = ({ sources, isOpen, onClose }: SourcesModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Sources</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
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
      </DialogContent>
    </Dialog>
  );
};

export default SourcesModal;
