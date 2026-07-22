import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { UserProfile } from '../types';
import { Save, User, Mail, Phone, MapPin, Calendar, Key, AlertCircle } from 'lucide-react';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [address, setAddress] = useState(user.address || '');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdating(true);
    setSuccess(false);
    setError('');

    try {
      const updated = await dbService.updateProfile(user.uid, {
        name,
        phoneNumber: phone,
        address
      });
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile details.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-150 dark:border-gray-800">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Details</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Update personal information</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl font-medium">
            Profile saved and synchronized successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address (ReadOnly)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-100/50 dark:bg-slate-850 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="+977 9801234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Authorization Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Key className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  disabled
                  value={user.role.toUpperCase()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-100/50 dark:bg-slate-850 text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed font-semibold uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
              Home / Physical Address
            </label>
            <div className="relative">
              <span className="absolute top-3 left-0 flex items-start pl-3.5 text-gray-400 dark:text-gray-500">
                <MapPin className="w-4.5 h-4.5" />
              </span>
              <textarea
                rows={3}
                placeholder="Street address, city, state, zip..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Role specific descriptors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            {user.rollNo && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Student Roll: <strong className="text-gray-700 dark:text-gray-300">{user.rollNo}</strong>
              </span>
            )}
            {user.classId && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Allocated Class: <strong className="text-gray-700 dark:text-gray-300">{user.classId}</strong>
              </span>
            )}
            {user.employeeId && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Employee ID: <strong className="text-gray-700 dark:text-gray-300">{user.employeeId}</strong>
              </span>
            )}
            {user.subject && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Department Subject: <strong className="text-gray-700 dark:text-gray-300">{user.subject}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Account Created: <strong className="text-gray-700 dark:text-gray-300">{user.createdAt}</strong>
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs disabled:opacity-50"
            >
              <Save className="w-4.5 h-4.5" />
              {updating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
