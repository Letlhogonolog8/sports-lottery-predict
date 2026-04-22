import React from 'react';

export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-700 rounded w-24"></div>
        <div className="h-6 bg-slate-700 rounded w-16"></div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
          <div className="h-5 bg-slate-700 rounded w-32"></div>
        </div>
        <div className="h-8 bg-slate-700 rounded w-16"></div>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="h-5 bg-slate-700 rounded w-32"></div>
          <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="h-20 bg-slate-700 rounded-lg"></div>
        <div className="h-20 bg-slate-700 rounded-lg"></div>
        <div className="h-20 bg-slate-700 rounded-lg"></div>
      </div>

      <div className="h-10 bg-slate-700 rounded-lg"></div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-48 mb-6"></div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 bg-slate-700 rounded w-32"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
};
