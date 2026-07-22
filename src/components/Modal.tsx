import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Content Container */}
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        id="modal-container"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-none">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
