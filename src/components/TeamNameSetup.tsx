import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TeamNameSetupProps {
  onComplete: () => void;
}

export const TeamNameSetup: React.FC<TeamNameSetupProps> = ({ onComplete }) => {
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateTeamName } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a name for your team.",
        variant: "destructive"
      });
      return;
    }

    if (teamName.trim().length < 3) {
      toast({
        title: "Team Name Too Short",
        description: "Team name must be at least 3 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (teamName.trim().length > 30) {
      toast({
        title: "Team Name Too Long",
        description: "Team name must be 30 characters or less.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create your team.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateTeamName(teamName.trim());

      if (!success) {
        throw new Error("Failed to update team name");
      }

      toast({
        title: "Team Name Set!",
        description: `Welcome to Touchline SA, ${teamName}!`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving team name:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save team name. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 text-white p-3 rounded-full">
              <Trophy className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Welcome to Touchline SA!
          </CardTitle>
          <CardDescription>
            Before you start building your dream team, give your squad a name that will strike fear into your opponents.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-sm font-medium">
                Team Name
              </Label>
              <Input
                id="teamName"
                type="text"
                placeholder="Enter your team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={30}
                className="text-center text-lg font-semibold"
                autoFocus
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3-30 characters</span>
                <span>{teamName.length}/30</span>
              </div>
            </div>

            {teamName.trim() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Team Preview:</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-lg font-bold text-green-800">
                    {teamName.trim()}
                  </div>
                  <div className="text-sm text-green-600">
                    Manager: {user?.email || 'Unknown Manager'}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!teamName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating Team...' : 'Create My Team'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-xs text-muted-foreground">
              Don't worry, you can change your team name later in settings.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};