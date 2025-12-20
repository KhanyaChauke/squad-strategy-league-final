import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlayersView } from '@/components/PlayersView';
import { SquadView } from '@/components/SquadView';
import { PSLDashboard } from '@/components/PSLDashboard';
import { NewsView } from '@/components/NewsView';
import { ApiSetup } from '@/components/ApiSetup';
import { LiveGamesView } from '@/components/LiveGamesView';
import {
  Trophy,
  Users,
  DollarSign,
  Target,
  LogOut,
  Home,
  UserCircle,
  Database,
  Download,
  Newspaper,
  Layout
} from 'lucide-react';

type DashboardView = 'home' | 'players' | 'squad' | 'psl' | 'news' | 'live-games' | 'fpls' | 'settings';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('news');
  const [isPopulating, setIsPopulating] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPositionCount = (position: string) => {
    return user?.squad.filter(player => player.position === position).length || 0;
  };

  const handlePopulateDatabase = async () => {
    const apiKey = localStorage.getItem('rapid_api_key');
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please connect your RapidAPI key in the Settings tab first.",
        variant: "destructive",
      });
      return;
    }

    setIsPopulating(true);
    try {
      const { populateDatabaseWithApiData } = await import('@/utils/populateDatabase');
      const result = await populateDatabaseWithApiData(apiKey);

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to populate database",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Database populated with ${result.count} players!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to populate database",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleMigrateLocalData = async () => {
    toast({
      title: "Info",
      description: "Migration feature coming soon for Firebase",
    });
  };

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">PSL</span>
            </div>

            <nav className="flex space-x-4">
              <Button
                variant={currentView === 'news' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('news')}
                className="flex items-center space-x-2"
              >
                <Newspaper className="h-4 w-4" />
                <span>News</span>
              </Button>
              <Button
                variant={currentView === 'fpls' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('fpls')}
                className="flex items-center space-x-2"
              >
                <UserCircle className="h-4 w-4" />
                <span>Fpls</span>
              </Button>
              <Button
                variant={currentView === 'psl' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('psl')}
                className="flex items-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>PSL Table</span>
              </Button>
              <Button
                variant={currentView === 'live-games' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('live-games')}
                className="flex items-center space-x-2"
              >
                <Layout className="h-4 w-4" />
                <span>Live Games</span>
              </Button>
              <Button
                variant={currentView === 'settings' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('settings')}
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>API Setup</span>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserCircle className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{user?.fullName}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div >
  );

  const renderHomeView = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
        <p className="text-green-100">Ready to build your dream PSL squad?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(user?.budget || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              of R1,000,000,000 total
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.squad.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              of 11 players maximum
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Value</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                user?.squad.reduce((total, player) => total + player.price, 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spent on players
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.squad.length ?
                Math.round(user.squad.reduce((sum, player) => sum + player.rating, 0) / user.squad.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Squad overall rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Squad Formation Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Squad Formation</CardTitle>
            <CardDescription>Current team composition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Goalkeepers</span>
                <Badge variant={getPositionCount('GK') > 0 ? 'default' : 'secondary'}>
                  {getPositionCount('GK')}/1
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Defenders</span>
                <Badge variant={getPositionCount('DEF') >= 3 ? 'default' : 'secondary'}>
                  {getPositionCount('DEF')}/4
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Midfielders</span>
                <Badge variant={getPositionCount('MID') >= 3 ? 'default' : 'secondary'}>
                  {getPositionCount('MID')}/4
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Attackers</span>
                <Badge variant={getPositionCount('ATT') >= 2 ? 'default' : 'secondary'}>
                  {getPositionCount('ATT')}/3
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your squad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full gradient-bg hover:opacity-90"
              onClick={() => setCurrentView('players')}
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Players
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentView('squad')}
            >
              <Target className="h-4 w-4 mr-2" />
              View My Squad
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handlePopulateDatabase}
              disabled={isPopulating}
            >
              <Database className="h-4 w-4 mr-2" />
              {isPopulating ? 'Populating...' : 'Populate Database'}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMigrateLocalData}
              disabled={isPopulating}
            >
              <Download className="h-4 w-4 mr-2" />
              {isPopulating ? 'Migrating...' : 'Migrate Local Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}

      <div className="container mx-auto px-4 py-8">
        {currentView === 'news' && <NewsView />}
        {currentView === 'fpls' && (
          <div className="space-y-6">
            <div className="flex space-x-4 mb-6">
              <Button onClick={() => setCurrentView('squad')} variant="outline">My Squad</Button>
              <Button onClick={() => setCurrentView('players')} variant="outline">Transfer Market</Button>
            </div>
            {renderHomeView()}
          </div>
        )}
        {currentView === 'squad' && (
          <div>
            <Button onClick={() => setCurrentView('fpls')} variant="ghost" className="mb-4">← Back to Fpls</Button>
            <SquadView />
          </div>
        )}
        {currentView === 'players' && (
          <div>
            <Button onClick={() => setCurrentView('fpls')} variant="ghost" className="mb-4">← Back to Fpls</Button>
            <PlayersView />
          </div>
        )}
        {currentView === 'psl' && <PSLDashboard />}
        {currentView === 'live-games' && <LiveGamesView />}
        {currentView === 'settings' && <ApiSetup />}
      </div>
    </div>
  );
};

export default Dashboard;
