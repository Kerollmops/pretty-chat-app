
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OPENAI_CONFIG } from '@/config/openai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('1000');

  // Load settings from localStorage when component mounts
  useEffect(() => {
    if (isOpen) {
      setApiUrl(localStorage.getItem('api_url') || '');
      setApiKey(localStorage.getItem('api_key') || '');
      setModel(localStorage.getItem('model') || OPENAI_CONFIG.model);
      setTemperature(localStorage.getItem('temperature') || OPENAI_CONFIG.defaultParams.temperature.toString());
      setMaxTokens(localStorage.getItem('max_tokens') || OPENAI_CONFIG.defaultParams.max_tokens.toString());
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('api_url', apiUrl);
    localStorage.setItem('api_key', apiKey);
    localStorage.setItem('model', model);
    localStorage.setItem('temperature', temperature);
    localStorage.setItem('openai_max_tokens', maxTokens);

    // Update runtime config (would need app-wide state in a real app)
    // This is simplified for this example
    window.location.reload(); // Reload to apply new settings

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Meilisearch Settings</DialogTitle>
          <DialogDescription>
            Configure your Meilisearch API settings for chat completions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:7700"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-3.5-turbo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="0.7"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min="1"
                max="4096"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                placeholder="1000"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
