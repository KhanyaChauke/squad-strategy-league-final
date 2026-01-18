
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Share, Download, Smartphone } from 'lucide-react';

export const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // 2. Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // 3. Android/Desktop: Capture the install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Wait a small delay to not be annoying immediately
            setTimeout(() => setShowPrompt(true), 3000);
        };

        // 4. iOS: Just show it if logic implies (checking if not standalone)
        if (isIosDevice && !isStandalone) {
            // Check if user has dismissed it before in session
            const hasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
            if (!hasDismissed) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 md:left-auto md:right-4 md:w-96">
            <Card className="p-4 shadow-2xl border-green-500/50 bg-white/95 backdrop-blur border-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Smartphone className="h-5 w-5 text-green-700" />
                        </div>
                        <h4 className="font-bold text-gray-900">Install Touchline SA</h4>
                    </div>
                    <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 ml-1">
                    Install our free app for a better full-screen experience and instant access to your squad.
                </p>

                {isIOS ? (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-700">
                            <span>1. Tap the</span>
                            <Share className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">Share</span>
                            <span>button in Safari</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <span>2. Scroll & choose</span>
                            <span className="font-semibold flex items-center gap-1 border border-gray-300 bg-white px-1 rounded shadow-sm text-xs">
                                <span className="text-2xl leading-none leading-none -mt-1">+</span> Add to Home Screen
                            </span>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={handleInstallClick}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-lg shadow-green-200"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Install App Now
                    </Button>
                )}
            </Card>
        </div>
    );
};
