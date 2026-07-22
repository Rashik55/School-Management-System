import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { dbService } from './services/dbService';
import { UserProfile } from './types';
import { GraduationCap } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if user session is active on mount
    const active = dbService.getCurrentUser();
    setUser(active);
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleLogout = async () => {
    try {
      await dbService.logout();
      setUser(null);
    } catch (err) {
      console.error("Failed to sign out cleanly:", err);
    }
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} 
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  );
}
