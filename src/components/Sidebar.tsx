import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  ClipboardList, 
  Megaphone, 
  Calendar, 
  DollarSign, 
  Award, 
  BookOpen, 
  Settings, 
  LayoutDashboard,
  Library,
  X,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  userRole: UserRole;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  userRole, 
  activeTab, 
  onChangeTab, 
  isOpen, 
  onClose 
}) => {

  const adminMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Library Hub', icon: Library },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'fees', label: 'Fee Invoices', icon: DollarSign },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  const teacherMenu = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'library', label: 'Library Hub', icon: Library },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'results', label: 'Gradebook', icon: Award },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'My Hub', icon: LayoutDashboard },
    { id: 'library', label: 'Library Catalog', icon: Library },
    { id: 'attendance', label: 'My Attendance', icon: ClipboardList },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'results', label: 'Exam Grades', icon: Award },
    { id: 'notices', label: 'School Notices', icon: Megaphone },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'fees', label: 'Fee Portal', icon: DollarSign },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  const getMenu = () => {
    switch (userRole) {
      case 'admin': return adminMenu;
      case 'teacher': return teacherMenu;
      case 'student': return studentMenu;
      default: return [];
    }
  };

  const menuItems = getMenu();

  return (
    <>
      {/* Mobile Backdrop Overlay with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel - Sticky Desktop & Animated Slide Drawer Mobile */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-64 border-r border-slate-800/80 bg-slate-900 z-50 transition-transform duration-300 ease-out transform md:transform-none ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-slate-950/80' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        {/* Brand Banner */}
        <div className="h-20 flex items-center justify-between px-6 bg-slate-950 flex-shrink-0 border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-white tracking-tight text-lg block leading-none">
                School <span className="text-blue-400 font-normal">Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Smart Management
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 md:hidden transition-all cursor-pointer"
            aria-label="Close menu drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              Navigation Menu
            </span>
            <span className="text-[10px] text-blue-400 font-mono font-medium px-2 py-0.5 rounded bg-blue-950/50 border border-blue-900/40">
              {menuItems.length} Tabs
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeTab(item.id);
                  onClose(); // auto close on mobile menu tap
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 font-semibold' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                <span className="truncate">{item.label}</span>

                {isSelected && (
                  <motion.div 
                    layoutId="activeTabPill"
                    className="absolute right-3 w-2 h-2 rounded-full bg-white shadow-xs"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Device & Role Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Responsive View</span>
              </div>
              <span className="text-xs font-bold text-slate-200 capitalize mt-0.5 block">
                {userRole} Account
              </span>
            </div>
            <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold text-[10px] rounded-lg uppercase">
              {userRole}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
