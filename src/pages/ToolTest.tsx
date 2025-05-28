import React from 'react';
import ToolInterceptorTest from '@/components/ToolInterceptorTest';

const ToolTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-xl font-semibold">Meilisearch Tool Interception Test</h1>
      </header>
      
      <main className="flex-1 py-8">
        <ToolInterceptorTest />
      </main>
      
      <footer className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
        Tool interception testing environment
      </footer>
    </div>
  );
};

export default ToolTest;