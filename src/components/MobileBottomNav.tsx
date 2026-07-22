import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  DollarSign, 
  Award, 
  Menu,
  Calendar,
  Megaphone,
  Library
} from 'lucide-react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  userRole: UserRole;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  userRole,
  onOpenMore
}) => {
  const getQuickTabs = () => {
    switch (userRole) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Hub', icon: LayoutDashboard },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'fees', label: 'Fees', icon: DollarSign },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'assignments', label: 'Homework', icon: BookOpen },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'fees', label: 'Invoices', icon: DollarSign },
          { id: 'notices', label: 'Notices', icon: Megaphone },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        ];
    }
  };

  const quickTabs = getQuickTabs();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 md:hidden shadow-lg transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 cursor-pointer group focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabHighlight"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-950/60 rounded-xl -z-10 border border-blue-200/50 dark:border-blue-800/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 scale-110'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              />

              <span
                className={`text-[11px] font-semibold mt-0.5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={onOpenMore}
          className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5">All Menu</span>
        </button>
      </div>
    </nav>
  );
};
