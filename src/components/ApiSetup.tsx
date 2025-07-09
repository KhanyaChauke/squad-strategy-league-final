
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key, Info } from 'lucide-react';

export const ApiSetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (apiKey.trim()) {
      localStorage.setItem('football_data_api_key', apiKey);
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('football_data_api_key');
    setApiKey('');
    setIsConnected(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>Football-Data.org API Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Connect to Football-Data.org API to get real player data. 
            Get your free API key from their website.
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="Enter your Football-Data.org API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleConnect} disabled={!apiKey.trim()}>
                Connect API
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://www.football-data.org/client/register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Get API Key</span>
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ API connected successfully! Player data will be enhanced with real information.
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect API
            </Button>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Features with API:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Real player names and teams</li>
            <li>Updated player positions</li>
            <li>Expanded player database</li>
            <li>Balanced pricing for budget management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
