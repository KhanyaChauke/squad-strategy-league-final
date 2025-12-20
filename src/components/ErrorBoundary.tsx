import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <Card className="w-full max-w-md border-red-200 shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle className="text-xl text-red-700">Something went wrong</CardTitle>
                            <CardDescription>
                                The application encountered an unexpected error.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {this.state.error && (
                                <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 font-mono overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </div>
                            )}
                            <Button
                                onClick={this.handleReload}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                Reload Application
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
