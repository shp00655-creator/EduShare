import React from 'react';

export const NoteCardSkeleton = () => {
  return (
    <div className="rounded-2xl glass-card p-5 h-[280px] flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top line (branch, sem, bookmark) */}
        <div className="flex items-center justify-between">
          <div className="w-28 h-5 rounded shimmer"></div>
          <div className="w-7 h-7 rounded-lg shimmer"></div>
        </div>

        {/* Title */}
        <div className="w-3/4 h-6 rounded mt-5 shimmer"></div>

        {/* Subject */}
        <div className="w-1/2 h-4 rounded mt-2 shimmer"></div>

        {/* Rating stars */}
        <div className="flex items-center gap-1.5 mt-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-3.5 h-3.5 rounded shimmer"></div>
            ))}
          </div>
          <div className="w-10 h-3 rounded shimmer"></div>
        </div>

        {/* Tag pills */}
        <div className="flex gap-2 mt-5">
          <div className="w-14 h-5 rounded-md shimmer"></div>
          <div className="w-14 h-5 rounded-md shimmer"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full shimmer"></div>
          <div className="w-16 h-3 rounded shimmer"></div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-4 rounded shimmer"></div>
          <div className="w-8 h-4 rounded shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export const NoteGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <NoteCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const LeaderboardRowSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800/40 bg-oxford-800/20 shimmer h-16">
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 rounded-full bg-slate-700"></div>
        <div className="w-10 h-10 rounded-full bg-slate-700"></div>
        <div className="space-y-2">
          <div className="w-24 h-4 rounded bg-slate-700"></div>
          <div className="w-16 h-3 rounded bg-slate-700"></div>
        </div>
      </div>
      <div className="w-16 h-5 rounded bg-slate-700"></div>
    </div>
  );
};
