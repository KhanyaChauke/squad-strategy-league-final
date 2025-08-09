
import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { TeamNameSetup } from '@/components/TeamNameSetup';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FPSL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Show team name setup if user doesn't have a team name
  if (!user.teamName) {
    return <TeamNameSetup onComplete={() => window.location.reload()} />;
  }

  return <Dashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
