import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { AdminDashboard } from './admin/AdminDashboard';
import { TeacherDashboard } from './teacher/TeacherDashboard';
import { StudentDashboard } from './student/StudentDashboard';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Render proper layout based on role
  const renderRoleDashboardContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <AdminDashboard 
            user={user} 
            onUpdateUser={onUpdateUser} 
            activeTab={activeTab} 
          />
        );
      case 'teacher':
        return (
          <TeacherDashboard 
            user={user} 
            onUpdateUser={onUpdateUser} 
            activeTab={activeTab} 
          />
        );
      case 'student':
        return (
          <StudentDashboard 
            user={user} 
            onUpdateUser={onUpdateUser} 
            activeTab={activeTab} 
          />
        );
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            Unauthorized user session role authorization error.
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sidebar navigation panel */}
      <Sidebar 
        userRole={user.role} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main viewport panels */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header Navigation */}
        <Navbar 
          user={user} 
          onLogout={onLogout} 
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onUpdateUser={onUpdateUser}
        />

        {/* Dynamic page sub-views scroll area (pb-24 on mobile so bottom bar never obscures content) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {renderRoleDashboardContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for small screen viewports */}
      <MobileBottomNav 
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        userRole={user.role}
        onOpenMore={() => setIsMobileSidebarOpen(true)}
      />

    </div>
  );
};
