import React from 'react';

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          id={`skeleton-card-${i}`}
          className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-xs animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-1/2"></div>
        </div>
      ))}
    </>
  );
};

export const SkeletonTable: React.FC<{ rows?: number, cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
      <div className="bg-gray-50 dark:bg-slate-850 h-12 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-250 dark:bg-slate-750 rounded-sm flex-1 mx-2"></div>
        ))}
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, ri) => (
          <div key={ri} className="flex items-center">
            {Array.from({ length: cols }).map((_, ci) => (
              <div key={ci} className="h-4 bg-gray-150 dark:bg-slate-800 rounded-sm flex-1 mx-2"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          id={`skeleton-list-${i}`}
          className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center space-x-4 animate-pulse"
        >
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-md w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
