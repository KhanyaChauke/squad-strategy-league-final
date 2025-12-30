
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Target, Shield } from 'lucide-react';

const LandingPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await login(loginData.email, loginData.password);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to Touchline SA"
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please verify your email before logging in.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await register(registerData.fullName, registerData.email, registerData.password);

      if (success) {
        toast({
          title: "Welcome!",
          description: "Account created successfully."
        });
        // No need to clear data or switch tabs, the app will redirect to Team Name Setup
      } else {
        toast({
          title: "Registration Failed",
          description: "Email already exists or invalid credentials.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Hero Section */}
      <div className="field-bg text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Trophy className="h-16 w-16 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Touchline SA
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-100">
              The Ultimate South African Fantasy Soccer
            </p>
            <p className="text-lg mb-8 text-green-200 max-w-2xl mx-auto">
              Build your dream PSL squad, manage your budget, and compete with the best players from South African football.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Touchline SA?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Real PSL Players</h3>
              <p className="text-gray-600 text-sm">Build squads with authentic player statistics and ratings</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Budget Management</h3>
              <p className="text-gray-600 text-sm">Strategic team building with R1 billion budget constraint</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600 text-sm">Safe user authentication and data protection</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Competitive</h3>
              <p className="text-gray-600 text-sm">Track performance and compete with other managers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Join Touchline SA Today</CardTitle>
                <CardDescription>
                  Start building your dream PSL squad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full gradient-bg hover:opacity-90"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                      <p className="text-sm text-center text-gray-600 mt-4">
                        Demo: demo@touchlinesa.com / demo123
                      </p>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registerEmail">Email</Label>
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full gradient-bg hover:opacity-90"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
