
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key, Info } from 'lucide-react';

export const ApiSetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Load existing key on mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('rapid_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConnected(true);
    }
  }, []);

  const handleConnect = () => {
    if (apiKey.trim()) {
      localStorage.setItem('rapid_api_key', apiKey.trim());
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('rapid_api_key');
    setApiKey('');
    setIsConnected(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>RapidAPI (API-Football) Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Connect to RapidAPI (API-Football) to population your database with real teams and players.
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">RapidAPI Key</label>
              <Input
                type="password"
                placeholder="Enter your RapidAPI Key"
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
                  href="https://rapidapi.com/api-sports/api/api-football"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Get Free Key</span>
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-green-600">
                ✅ API Connected! You can now populate your database.
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect API
            </Button>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Note:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>The free plan allows 100 requests/day.</li>
            <li>Populating the database uses ~20 requests.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
