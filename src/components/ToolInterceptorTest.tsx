import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, ChevronRight } from 'lucide-react';

// Define the tool interfaces
interface MeiliSearchProgressParams {
  call_id?: string;
  function_name: string;
  function_parameters: string;
}

interface MeiliAppendConversationMessageParams {
  role: string;
  content: string;
  tool_calls: Array<{
    id: string;
    type: string;
    function?: {
      name: string;
      arguments: string;
    };
  }> | null;
  tool_call_id: string | null;
}

interface MeiliSearchSourcesParams {
  call_id: string;
  documents: object;
}

interface MeiliReportErrorParams {
  error_code: string;
  message: string;
}

const ToolInterceptorTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('search-progress');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const testSearchProgress = () => {
    if (typeof window['_meiliSearchProgress'] === 'function') {
      const params: MeiliSearchProgressParams = {
        call_id: `test-${Date.now()}`,
        function_name: 'search',
        function_parameters: JSON.stringify({ query: 'test query', index: 'products' })
      };
      
      window['_meiliSearchProgress'](params);
      addLog(`Called _meiliSearchProgress with params: ${JSON.stringify(params)}`);
    } else {
      addLog('Error: _meiliSearchProgress is not registered');
    }
  };

  const testAppendConversationMessage = () => {
    if (typeof window['_meiliAppendConversationMessage'] === 'function') {
      const params: MeiliAppendConversationMessageParams = {
        role: 'assistant',
        content: 'This is a test message from the assistant',
        tool_calls: null,
        tool_call_id: null
      };
      
      window['_meiliAppendConversationMessage'](params);
      addLog(`Called _meiliAppendConversationMessage with params: ${JSON.stringify(params)}`);
    } else {
      addLog('Error: _meiliAppendConversationMessage is not registered');
    }
  };

  const testSearchSources = () => {
    if (typeof window['_meiliSearchSources'] === 'function') {
      const params: MeiliSearchSourcesParams = {
        call_id: `test-${Date.now()}`,
        documents: {
          hits: [
            { title: 'Test Document 1', content: 'This is test content 1' },
            { title: 'Test Document 2', content: 'This is test content 2' }
          ]
        }
      };
      
      window['_meiliSearchSources'](params);
      addLog(`Called _meiliSearchSources with params: ${JSON.stringify(params)}`);
    } else {
      addLog('Error: _meiliSearchSources is not registered');
    }
  };

  const testReportError = () => {
    if (typeof window['_meiliReportError'] === 'function') {
      const params: MeiliReportErrorParams = {
        error_code: 'TEST_ERROR',
        message: 'This is a test error message'
      };
      
      window['_meiliReportError'](params);
      addLog(`Called _meiliReportError with params: ${JSON.stringify(params)}`);
    } else {
      addLog('Error: _meiliReportError is not registered');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Tool Interceptor Test</CardTitle>
          <CardDescription>
            Test the tool interception functionality with dummy calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search-progress" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="search-progress">Search Progress</TabsTrigger>
              <TabsTrigger value="append-message">Append Message</TabsTrigger>
              <TabsTrigger value="search-sources">Search Sources</TabsTrigger>
              <TabsTrigger value="report-error">Report Error</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search-progress" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-medium">Test _meiliSearchProgress</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates a search progress update with a function name and parameters
                </p>
              </div>
              <Button 
                onClick={testSearchProgress}
                className="w-full"
              >
                Test Search Progress <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>
            
            <TabsContent value="append-message" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-medium">Test _meiliAppendConversationMessage</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates appending a new message to the conversation
                </p>
              </div>
              <Button 
                onClick={testAppendConversationMessage}
                className="w-full"
              >
                Test Append Message <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>
            
            <TabsContent value="search-sources" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-medium">Test _meiliSearchSources</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates providing search sources for a previous query
                </p>
              </div>
              <Button 
                onClick={testSearchSources}
                className="w-full"
              >
                Test Search Sources <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>
            
            <TabsContent value="report-error" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-medium">Test _meiliReportError</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates reporting an error during the process
                </p>
              </div>
              <Button 
                onClick={testReportError}
                className="w-full"
                variant="destructive"
              >
                Test Report Error <AlertCircle className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <Label htmlFor="logs">Execution Logs</Label>
              <Button 
                onClick={clearLogs} 
                variant="outline" 
                size="sm"
              >
                Clear Logs
              </Button>
            </div>
            <Textarea 
              id="logs"
              className="font-mono mt-2 h-60"
              value={logs.join('\n')}
              readOnly
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            Tool interceptors registered
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Tools
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ToolInterceptorTest;