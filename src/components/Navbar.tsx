import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { LogOut, Sun, Moon, Bell, Menu, GraduationCap, Megaphone, Banknote, Award, User, Trash2, Check } from 'lucide-react';
import { UserProfile, SystemNotification } from '../types';
import { dbService } from '../services/dbService';
import { Modal } from './Modal';

interface NavbarProps {
  user: UserProfile;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await dbService.getNotifications(user.role);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [user.role]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 8 seconds for new notifications
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dbService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectNotification = async (n: SystemNotification) => {
    setSelectedNotification(n);
    setIsOpen(false);
    if (!n.read) {
      try {
        await dbService.markNotificationAsRead(n.id);
        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dbService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dbService.markAllNotificationsAsRead(user.role);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await dbService.clearNotifications(user.role);
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 md:px-8 h-20 flex items-center justify-between flex-shrink-0 transition-colors">
      {/* Brand logo & mobile trigger */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button 
          onClick={onToggleMobileSidebar}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 md:hidden transition-all shadow-xs border border-blue-100 dark:border-slate-700 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Menu</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 md:hidden shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-slate-900 dark:text-white tracking-tight text-lg sm:text-xl">
            School <span className="text-blue-600 dark:text-blue-400 font-normal">Portal</span>
          </span>
        </div>
      </div>

      {/* Right control utilities */}
      <div className="flex items-center space-x-4">
        {/* Dark/Light mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 animate-pulse" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900 leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <>
              {/* Back-overlay for closing */}
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              
              <div className="absolute right-0 mt-2.5 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-gray-950 dark:text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] rounded-md">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/40">
                  {notifications.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850/50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">All caught up! No notifications.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const Icon = n.type === 'notice' ? Megaphone
                                  : n.type === 'fee' ? Banknote
                                  : n.type === 'grade' ? Award
                                  : n.type === 'user' ? User
                                  : Bell;
                      const iconBg = n.type === 'notice' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                   : n.type === 'fee' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                   : n.type === 'grade' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                                   : n.type === 'user' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                   : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400';
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleSelectNotification(n)}
                          className={`p-3.5 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-850/20 relative group cursor-pointer ${!n.read ? 'bg-blue-50/10 dark:bg-blue-950/5' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-start justify-between gap-1.5 mb-0.5">
                              <p className={`text-xs font-bold leading-snug truncate ${!n.read ? 'text-gray-950 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {n.title}
                              </p>
                              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">{n.timeAgo}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal line-clamp-2">
                              {n.content}
                            </p>
                          </div>

                          {/* Quick Actions overlay */}
                          <div className="absolute right-2 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 shadow-sm pl-1 rounded-md border border-slate-100 dark:border-slate-800">
                            {!n.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(n.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {!n.read && (
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                    <button
                      onClick={handleClearAll}
                      className="w-full py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50/30 dark:hover:bg-rose-950/10 cursor-pointer"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User profile capsule */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">
              {user.name}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1 block">
              {user.role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center select-none shadow-xs border border-blue-100 dark:border-blue-900/50">
            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>

          {/* Quick Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <Modal 
          isOpen={!!selectedNotification} 
          onClose={() => setSelectedNotification(null)}
          title="Notification Details"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${
                  selectedNotification.type === 'notice' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50' :
                  selectedNotification.type === 'fee' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' :
                  selectedNotification.type === 'grade' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50' :
                  'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                }`}>
                  {selectedNotification.type}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {selectedNotification.timeAgo}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {selectedNotification.title}
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedNotification.content}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={(e) => {
                  handleDeleteNotification(selectedNotification.id, e);
                  setSelectedNotification(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              <button
                onClick={() => setSelectedNotification(null)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
};
