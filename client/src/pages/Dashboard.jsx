import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { NoteGridSkeleton } from '../components/SkeletonLoaders';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Award, 
  FileText, 
  Download, 
  Eye, 
  Bookmark, 
  FolderPlus, 
  TrendingUp 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'bookmarks'
  const [resourceSection, setResourceSection] = useState('all'); // 'all', 'notes', 'question_paper'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/notes/user/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleDeleteSuccess = (deletedNoteId) => {
    // Remove the note from local uploads list
    setStats(prev => ({
      ...prev,
      totalUploads: Math.max(0, prev.totalUploads - 1),
      uploads: prev.uploads.filter(note => note._id !== deletedNoteId)
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-oxford-950 min-h-[calc(100vh-4rem)]">
        {/* Header Skeleton */}
        <div className="w-1/3 h-10 rounded shimmer mb-8"></div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="h-28 rounded-2xl shimmer"></div>
          ))}
        </div>
        {/* Tabs Skeleton */}
        <div className="w-64 h-10 rounded shimmer mb-6"></div>
        {/* Grid Skeleton */}
        <NoteGridSkeleton count={3} />
      </div>
    );
  }

  const rawCardsData = activeTab === 'uploads' ? stats?.uploads : stats?.bookmarks;
  
  let cardsData = rawCardsData || [];
  if (resourceSection !== 'all') {
    cardsData = cardsData.filter(n => (n.resourceType || 'notes') === resourceSection);
  }
  if (activeTab === 'uploads' && statusFilter !== 'all') {
    cardsData = cardsData.filter(n => (n.status || 'approved') === statusFilter);
  }

  const notesCount = (rawCardsData || []).filter(n => (n.resourceType || 'notes') === 'notes').length;
  const qpCount = (rawCardsData || []).filter(n => n.resourceType === 'question_paper').length;

  const statWidgets = [
    { label: 'Credits Earned', value: stats?.credits || 0, icon: Award, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Total Uploads', value: stats?.totalUploads || 0, icon: FileText, color: 'text-primary-light bg-primary/10 border-primary/20' },
    { label: 'Downloads Triggered', value: stats?.totalDownloads || 0, icon: Download, color: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20' },
    { label: 'Resource Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 bg-oxford-950 min-h-[calc(100vh-4rem)] relative">
      
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans flex items-center gap-2">
            Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your contributions, analytics, verification status, and bookmarked notes.
          </p>
        </div>
        <Link 
          to="/upload" 
          className="inline-flex h-11 items-center gap-2 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-sm font-semibold shadow-lg hover:shadow-primary/20 transition-all self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" /> Upload Material
        </Link>
      </div>

      {/* Analytics Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statWidgets.map((widget, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-md glass-card ${widget.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{widget.label}</span>
              <widget.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-white mt-4 font-sans">{widget.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 mb-6 gap-3">
        <div className="flex">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'uploads'
                ? 'text-primary border-primary'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Uploads ({stats?.totalUploads || 0})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'text-primary border-primary'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Bookmarks ({stats?.bookmarks?.length || 0})
          </button>
        </div>

        {/* Section Pill Switches: Notes vs Question Papers */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center p-1 bg-oxford-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setResourceSection('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                resourceSection === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setResourceSection('notes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                resourceSection === 'notes'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📚 Notes ({notesCount})
            </button>
            <button
              onClick={() => setResourceSection('question_paper')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                resourceSection === 'question_paper'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📝 Question Papers ({qpCount})
            </button>
          </div>

          {activeTab === 'uploads' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl glass-input bg-oxford-900 border-slate-800"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved & Live</option>
              <option value="pending">Pending Verification</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {cardsData && cardsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardsData.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                showStatus={activeTab === 'uploads'}
                onViewClick={(id) => setSelectedNoteId(id)}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-oxford-900/10">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mx-auto mb-4">
              {activeTab === 'uploads' ? <FolderPlus className="w-8 h-8" /> : <Bookmark className="w-8 h-8" />}
            </div>
            <h3 className="text-slate-300 font-semibold text-lg">
              {activeTab === 'uploads' ? 'No uploads yet' : 'No bookmarked notes'}
            </h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              {activeTab === 'uploads' 
                ? 'Share your lecture notes, summaries, or papers to earn credits and climb the leaderboard!' 
                : 'Save notes while browsing to quickly access them here later.'}
            </p>
            {activeTab === 'uploads' ? (
              <Link 
                to="/upload" 
                className="inline-flex h-9 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-4 text-xs font-bold mt-4 transition-all"
              >
                Upload First Note
              </Link>
            ) : (
              <Link 
                to="/explore" 
                className="inline-flex h-9 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-4 text-xs font-bold mt-4 transition-all"
              >
                Explore Notes
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Note Detail Modal */}
      {selectedNoteId && (
        <NoteModal 
          noteId={selectedNoteId} 
          onClose={() => {
            setSelectedNoteId(null);
            fetchDashboardStats(); // Refresh stats on close to sync ratings/views/comments count
          }} 
        />
      )}

    </div>
  );
};

export default Dashboard;
