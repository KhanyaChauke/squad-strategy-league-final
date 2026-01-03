import React, { useState } from 'react';
import { syncPlayersToFirestore } from '@/services/playerSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlayersView } from '@/components/PlayersView';
import { SquadView } from '@/components/SquadView';
import { PSLDashboard } from '@/components/PSLDashboard';
import { NewsView } from '@/components/NewsView';
import { LiveGamesView } from '@/components/LiveGamesView';
import { LeaderboardView } from '@/components/LeaderboardView';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Trophy,
  Users,
  DollarSign,
  Target,
  LogOut,
  UserCircle,
  Database,
  Newspaper,
  Layout,
  Menu
} from 'lucide-react';

type DashboardView = 'home' | 'players' | 'squad' | 'psl' | 'news' | 'live-games' | 'leaderboard' | 'fpls';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('news');
  const { user, logout, simulateGameweekForUser, simulateGameweekForAllUsers } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSyncPlayers = async () => {
    if (!user?.isAdmin) return;
    toast({ title: "Syncing Players", description: "Fetching from API and saving to database..." });
    try {
      const count = await syncPlayersToFirestore();
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${count} players to the database.`,
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync players. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleSimulateGameweek = async () => {
    toast({ title: "Simulation Started", description: "Simulating gameweek matches..." });
    const result = await simulateGameweekForUser();
    if (result) {
      toast({
        title: `Gameweek ${result.gameweek} Complete!`,
        description: `You scored ${result.totalPoints} points!`,
        className: "bg-green-50 border-green-200"
      });
    } else {
      toast({ title: "Simulation Failed", variant: "destructive" });
    }
  };

  const handleSimulateAllUsers = async () => {
    if (!user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Only admins can perform this action",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Admin Action",
      description: "Simulating gameweek for ALL users. This may take a moment..."
    });

    const success = await simulateGameweekForAllUsers();

    if (success) {
      toast({
        title: "Success!",
        description: "Gameweek simulated for all users with squads",
        className: "bg-green-50 border-green-200"
      });
    } else {
      toast({
        title: "Simulation Failed",
        description: "Failed to simulate gameweek for all users",
        variant: "destructive"
      });
    }
  };

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

  const NavButton = ({ view, icon: Icon, label, onClick }: { view: DashboardView, icon: any, label: string, onClick?: () => void }) => (
    <Button
      variant={currentView === view ? 'default' : 'ghost'}
      onClick={() => {
        setCurrentView(view);
        onClick?.();
      }}
      className={`flex items-center space-x-2 ${currentView === view ? '' : 'text-gray-600'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );

  const renderNavigation = () => (
    <div className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('news')}>
            <Trophy className="h-8 w-8 text-green-600" />
            <span className="text-xl md:text-2xl font-bold text-green-600">Touchline SA</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <nav className="flex space-x-1 lg:space-x-2">
              <NavButton view="news" icon={Newspaper} label="News" />
              <NavButton view="fpls" icon={UserCircle} label="Fpls" />
              <NavButton view="leaderboard" icon={Trophy} label="Leaderboard" />
              <NavButton view="psl" icon={Trophy} label="PSL Table" />
              <NavButton view="live-games" icon={Layout} label="Live Games" />
            </nav>

            <div className="h-6 w-px bg-gray-200 mx-2" />

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium max-w-[100px] truncate">{user?.fullName}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-2">
            <div className="flex items-center mr-2">
              <span className="text-sm font-medium mr-2 truncate max-w-[80px]">{user?.fullName?.split(' ')[0]}</span>
            </div>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-green-600" />
                    <span className="font-bold text-green-600">Touchline SA</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 mb-2 px-2">Menu</p>
                    <div className="grid gap-1">
                      <Button variant={currentView === 'news' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => { setCurrentView('news'); setIsMobileMenuOpen(false); }}>
                        <Newspaper className="mr-2 h-4 w-4" /> News
                      </Button>
                      <Button variant={currentView === 'fpls' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => { setCurrentView('fpls'); setIsMobileMenuOpen(false); }}>
                        <UserCircle className="mr-2 h-4 w-4" /> Fpls (My Team)
                      </Button>
                      <Button variant={currentView === 'leaderboard' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => { setCurrentView('leaderboard'); setIsMobileMenuOpen(false); }}>
                        <Trophy className="mr-2 h-4 w-4" /> Leaderboard
                      </Button>
                      <Button variant={currentView === 'psl' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => { setCurrentView('psl'); setIsMobileMenuOpen(false); }}>
                        <Trophy className="mr-2 h-4 w-4" /> PSL Table
                      </Button>
                      <Button variant={currentView === 'live-games' ? 'default' : 'ghost'} className="justify-start w-full" onClick={() => { setCurrentView('live-games'); setIsMobileMenuOpen(false); }}>
                        <Layout className="mr-2 h-4 w-4" /> Live Games
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2 px-2">Account</p>
                    <div className="flex items-center space-x-2 p-2 mb-2 bg-gray-50 rounded-md">
                      <UserCircle className="h-8 w-8 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.fullName}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={logout}
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomeView = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
        <p className="text-green-100">Ready to build your dream PSL squad?</p>
      </div>

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
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squad Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.squad.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.totalPoints || 0}</div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.squad.length ?
                Math.round(user.squad.reduce((sum, player) => sum + player.rating, 0) / user.squad.length)
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

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

            {user?.isAdmin && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Admin Zone</p>
                  <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleSimulateGameweek}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Simulate My Gameweek
                  </Button>
                  <Button
                    onClick={handleSimulateAllUsers}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Simulate ALL Users Gameweek
                  </Button>
                  <Button
                    onClick={handleSyncPlayers}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Sync Players from API
                  </Button>
                </div>
              </div>
            )}
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
            <div className="flex space-x-4 mb-6 text-sm">
              <Button onClick={() => setCurrentView('squad')} variant="outline" size="sm">My Squad</Button>
              <Button onClick={() => setCurrentView('players')} variant="outline" size="sm">Transfer Market</Button>
              <Button onClick={() => setCurrentView('leaderboard')} variant="outline" size="sm">Leaderboard</Button>
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
        {currentView === 'leaderboard' && <LeaderboardView />}
        {currentView === 'psl' && <PSLDashboard />}
        {currentView === 'live-games' && <LiveGamesView />}
      </div>
    </div>
  );
};

export default Dashboard;
