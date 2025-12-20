
import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import { TeamNameSetup } from '@/components/TeamNameSetup';

const DebugOverlay = () => {
  const { user, isLoading, error } = useAuth();
  return (
    <div className="fixed top-0 right-0 bg-black/80 text-white p-4 z-50 text-xs font-mono pointer-events-none max-w-xs break-words">
      <p>Loading: {isLoading.toString()}</p>
      <p>User: {user ? user.email : 'null'}</p>
      <p>UID: {user ? user.id : 'null'}</p>
      {error && <p className="text-red-400">Error: {error}</p>}
    </div>
  );
};

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DebugOverlay />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FPSL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <DebugOverlay />
        <LandingPage />
      </>
    );
  }

  // Check if email is verified - DISABLED for now to allow easy testing
  // if (!user.emailVerified) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
  //         <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
  //         <p className="text-gray-600 mb-4">
  //           Please verify your email address before accessing the app. 
  //           Check your inbox for the verification link we sent to <strong>{user.email}</strong>.
  //         </p>
  //         <p className="text-sm text-gray-500">
  //           Didn't receive the email? Check your spam folder or contact support.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show team name setup if user doesn't have a team name
  if (!user.teamName) {
    return (
      <>
        <DebugOverlay />
        <TeamNameSetup onComplete={() => window.location.reload()} />
      </>
    );
  }

  return (
    <>
      <DebugOverlay />
      <Dashboard />
    </>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
