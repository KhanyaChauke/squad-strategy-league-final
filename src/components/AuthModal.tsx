
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onOpenChange, defaultTab = 'login' }) => {
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
                onOpenChange(false);
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
                onOpenChange(false);
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
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <CardHeader className="px-0">
                            <CardTitle>Login</CardTitle>
                            <CardDescription>
                                Sign in to manage your squad
                            </CardDescription>
                        </CardHeader>
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
                        <CardHeader className="px-0">
                            <CardTitle>Register</CardTitle>
                            <CardDescription>
                                Create an account to start playing
                            </CardDescription>
                        </CardHeader>
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
            </DialogContent>
        </Dialog>
    );
};
