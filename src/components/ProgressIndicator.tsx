
import React from 'react';

interface ProgressIndicatorProps {
  message?: string;
}

const ProgressIndicator = ({ message = "Searching for documents..." }: ProgressIndicatorProps) => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 max-w-xs border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
