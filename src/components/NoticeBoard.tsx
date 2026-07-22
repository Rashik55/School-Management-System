import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { SchoolNotice, UserRole } from '../types';
import { Plus, Bell, Trash, Megaphone, Calendar } from 'lucide-react';
import { Modal } from './Modal';

interface NoticeBoardProps {
  userRole: UserRole;
  authorName: string;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ userRole, authorName }) => {
  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Notice Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'all' | 'teachers' | 'students'>('all');
  const [important, setImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const allNotices = await dbService.getNotices();
      // Filter notices based on role
      if (userRole === 'student') {
        setNotices(allNotices.filter(n => n.target === 'all' || n.target === 'students'));
      } else if (userRole === 'teacher') {
        setNotices(allNotices.filter(n => n.target === 'all' || n.target === 'teachers'));
      } else {
        setNotices(allNotices); // Admin sees everything
      }
    } catch (err) {
      console.error("Error loading notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await dbService.addNotice({
        title,
        content,
        target,
        important,
        date: new Date().toISOString().split('T')[0],
        author: authorName
      });
      // reset form
      setTitle('');
      setContent('');
      setTarget('all');
      setImportant(false);
      setIsModalOpen(false);
      // reload
      fetchNotices();
    } catch (err) {
      console.error("Failed to add notice:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await dbService.deleteNotice(id);
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error("Failed to delete notice:", err);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Megaphone className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-gray-950 dark:text-white">Notice Board</h3>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/10"
          >
            <Plus className="w-4 h-4" /> Add Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 py-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-4 p-4 border border-gray-50 dark:border-slate-800 rounded-xl">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-150 dark:bg-slate-800 rounded-md w-1/4"></div>
                <div className="h-3 bg-gray-150 dark:bg-slate-800 rounded-md w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          No announcements registered currently.
        </div>
      ) : (
        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-4 rounded-xl border relative transition-all duration-200 group ${
                notice.important
                  ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
                  : 'bg-slate-50/50 dark:bg-slate-850/40 border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    notice.important 
                      ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {notice.important ? 'Urgent' : 'General'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {notice.date}
                  </span>
                </div>
                
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete notice"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h4 className="font-display font-bold text-gray-900 dark:text-white text-sm md:text-base mb-1.5">
                {notice.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                {notice.content}
              </p>
              
              <div className="mt-3 text-[11px] font-medium text-gray-400 dark:text-gray-500 text-right">
                Posted by: <span className="text-blue-600 dark:text-blue-400">{notice.author}</span>
                {userRole === 'admin' && ` (Audience: ${notice.target})`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Adding Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Announcement"
      >
        <form onSubmit={handleAddNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Notice Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Summer Holiday Schedule"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Notice Content
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide clear announcement details here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              >
                <option value="all">Everyone (All)</option>
                <option value="teachers">Teachers Only</option>
                <option value="students">Students Only</option>
              </select>
            </div>

            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={e => setImportant(e.target.checked)}
                  className="w-4.5 h-4.5 rounded-md border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Important
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/10 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
