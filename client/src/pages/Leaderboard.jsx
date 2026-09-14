import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { LeaderboardRowSkeleton } from '../components/SkeletonLoaders';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles, TrendingUp } from 'lucide-react';
import { resolveFileUrl } from '../utils/url';

const Leaderboard = () => {
  const toast = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/notes/leaderboard');
        setLeaderboard(data);
      } catch (error) {
        toast.error('Failed to load leaderboard standings.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-oxford-950 min-h-[calc(100vh-4rem)] space-y-6">
        <div className="w-1/3 h-10 rounded shimmer mb-8"></div>
        {/* Top 3 Skeleton */}
        <div className="flex gap-4 items-end justify-center h-48 mb-10">
          <div className="w-24 h-32 rounded-xl bg-slate-800/40 shimmer"></div>
          <div className="w-24 h-40 rounded-xl bg-slate-800/40 shimmer"></div>
          <div className="w-24 h-28 rounded-xl bg-slate-800/40 shimmer"></div>
        </div>
        {[1, 2, 3].map(s => <LeaderboardRowSkeleton key={s} />)}
      </div>
    );
  }

  // Segment leaderboard into top 3 and runner-ups
  const topThree = leaderboard.slice(0, 3);
  const runnersUp = leaderboard.slice(3);

  // Rearrange top 3 for classic podium look: [Rank 2, Rank 1, Rank 3]
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2 });
  if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1 });
  if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3 });

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 2: return 'text-slate-350 border-slate-400/30 bg-slate-400/10';
      case 3: return 'text-amber-600 border-amber-600/30 bg-amber-600/10';
      default: return 'text-slate-400 border-slate-800 bg-oxford-850';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8 bg-oxford-950 min-h-[calc(100vh-4rem)] relative">
      
      {/* Background Accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-white font-sans flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-400" /> Leaderboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Top contributors ranked by resource upload quality and interaction count.
        </p>
      </div>

      {/* Top 3 Podium Displays */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-4 sm:gap-6 mb-12 mt-6">
          {podiumOrder.map((user) => {
            const isRank1 = user.rank === 1;
            const heightClass = isRank1 ? 'h-48' : user.rank === 2 ? 'h-40' : 'h-36';
            const avatarSize = isRank1 ? 'w-16 h-16' : 'w-12 h-12';
            
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: user.rank * 0.1 }}
                className={`flex flex-col items-center justify-end flex-1 max-w-[150px]`}
              >
                {/* User avatar and Rank Tag */}
                <div className="relative mb-3 flex flex-col items-center">
                  {user.profilePicture ? (
                    <img 
                      src={resolveFileUrl(user.profilePicture)} 
                      alt={user.name} 
                      className={`${avatarSize} rounded-full border-2 border-slate-750 object-cover`}
                    />
                  ) : (
                    <div className={`${avatarSize} rounded-full bg-oxford-800 flex items-center justify-center font-black text-slate-300 border-2 border-slate-750`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Floating badge */}
                  <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full border text-[9px] font-bold shadow-md ${getRankBadgeColor(user.rank)}`}>
                    Rank {user.rank}
                  </div>
                </div>

                {/* Podium pillar box */}
                <div className={`w-full rounded-t-2xl flex flex-col items-center justify-center p-3 text-center border-t border-x border-slate-800/60 shadow-glass ${heightClass} ${
                  isRank1 ? 'bg-primary/20 border-primary/30' : 'bg-oxford-900/65'
                }`}>
                  <span className="text-xs font-bold text-slate-200 truncate w-full px-1">{user.name}</span>
                  <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">{user.branch}</span>
                  
                  <div className="flex items-center gap-1 mt-4 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>{user.credits}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Runner ups List */}
      {runnersUp.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Leading Contributors
          </h3>
          {runnersUp.map((user, index) => {
            const currentRank = index + 4;
            
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-805/30 bg-oxford-900/40 backdrop-blur-sm hover:border-slate-700/40 hover:bg-oxford-850/30 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank badge */}
                  <span className="w-6 text-sm font-bold text-slate-500 text-center">#{currentRank}</span>
                  
                  {/* Profile avatar */}
                  {user.profilePicture ? (
                    <img 
                      src={resolveFileUrl(user.profilePicture)} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full border border-slate-800 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-oxford-800/80 border border-slate-800 flex items-center justify-center font-bold text-slate-400 uppercase shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name and branch info */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">{user.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{user.branch} {user.semester ? `• Sem ${user.semester}` : ''}</p>
                  </div>
                </div>

                {/* Credits count badge */}
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-oxford-800 border border-slate-700/30 text-amber-400 text-xs font-bold">
                  <Medal className="w-3.5 h-3.5" />
                  <span>{user.credits} Cr</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : topThree.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-oxford-900/10">
          <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-slate-350 font-semibold text-lg">Empty Standings</h3>
          <p className="text-slate-500 text-sm mt-1">
            Be the first to upload and dominate the leaderboard!
          </p>
        </div>
      ) : null}

    </div>
  );
};

export default Leaderboard;
