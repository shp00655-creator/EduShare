import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getApiBaseUrl } from '../utils/api';
import { resolveFileUrl } from '../utils/url';
import { 
  Star, 
  Bookmark, 
  Eye, 
  Download, 
  Tag, 
  FileText, 
  GraduationCap, 
  User,
  Trash2
} from 'lucide-react';

const NoteCard = ({ note, onViewClick, onDeleteSuccess, showStatus = false }) => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [bookmarking, setBookmarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloads, setDownloads] = useState(note.downloads);

  // Check if current user has bookmarked this note
  const isBookmarked = user?.bookmarks?.some(
    (bookmark) => (bookmark._id || bookmark) === note._id
  );

  const isOwner = user?._id === note.uploadedBy?._id || user?._id === note.uploadedBy;

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.warning('Please log in to bookmark notes.');
      return;
    }

    setBookmarking(true);
    try {
      const { data } = await api.post(`/notes/${note._id}/bookmark`);
      await refreshUser(); // Update bookmarks list in Auth State
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to toggle bookmark.');
    } finally {
      setBookmarking(false);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.warning('Please log in to download notes.');
      return;
    }

    const apiBase = getApiBaseUrl();
    const token = localStorage.getItem('token');
    const downloadUrl = `${apiBase}/notes/${note._id}/download-file?token=${token}`;
    
    // Trigger download in a new tab
    window.open(downloadUrl, '_blank');

    // Update download metric locally
    setDownloads((prev) => prev + 1);

    // Refresh credits on frontend
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${note.title}"?`)) return;

    setDeleting(true);
    try {
      const { data } = await api.delete(`/notes/${note._id}`);
      toast.success(data.message);
      await refreshUser(); // Recalculate credits
      if (onDeleteSuccess) onDeleteSuccess(note._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper for stars
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${
            i <= rating 
              ? 'text-amber-400 fill-amber-400' 
              : 'text-slate-600'
          }`} 
        />
      );
    }
    return stars;
  };

  const isQuestionPaper = note.resourceType === 'question_paper';

  return (
    <div 
      onClick={() => onViewClick(note._id)}
      className="group relative flex flex-col justify-between rounded-2xl glass-card p-5 cursor-pointer h-full"
    >
      <div>
        {/* Top Header Card */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary-light text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              {note.branch} • Sem {note.semester}
            </span>
            {isQuestionPaper ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                📝 Question Paper
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
                📚 Notes
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {isOwner && (
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="p-1.5 rounded-lg text-slate-500 hover:text-accent-rose hover:bg-oxford-800/80 transition-all disabled:opacity-50"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              disabled={bookmarking}
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-all ${
                isBookmarked 
                  ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                  : 'text-slate-500 hover:text-slate-200 hover:bg-oxford-800/80'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status indicator on Dashboard */}
        {showStatus && note.status && (
          <div className="mt-2.5">
            {note.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold animate-pulse">
                ⏳ Verification Pending
              </span>
            )}
            {note.status === 'approved' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                ✅ Approved & Live
              </span>
            )}
            {note.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-semibold" title={note.rejectionReason || 'Rejected'}>
                ❌ Rejected {note.rejectionReason ? `(${note.rejectionReason})` : ''}
              </span>
            )}
          </div>
        )}

        {/* Note title */}
        <h3 className="mt-3 font-semibold text-lg text-slate-100 group-hover:text-primary-light transition-colors line-clamp-1">
          {note.title}
        </h3>

        {/* Subject and code details (Instructor removed per requirement) */}
        <p className="text-sm font-medium text-slate-400 mt-1">
          {note.subjectCode && (
            <span className="font-mono text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.5 rounded mr-1">
              {note.subjectCode}
            </span>
          )}
          {note.subject} {note.unit ? `(Unit ${note.unit})` : ''}
        </p>

        {/* Rating stars & count */}
        <div className="flex items-center gap-1.5 mt-3">
          <div className="flex">{renderStars(note.averageRating || 0)}</div>
          <span className="text-xs font-bold text-slate-400">
            {note.averageRating > 0 ? note.averageRating.toFixed(1) : 'No rating'}
          </span>
          <span className="text-[10px] text-slate-500">
            ({note.ratings?.length || 0})
          </span>
        </div>

        {/* Note tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-oxford-700/40 border border-slate-700/20 text-slate-400 text-[10px] font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] text-slate-500 font-bold self-center">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Details */}
      <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
        {/* Contributor */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">
            {note.uploadedBy?.name ? note.uploadedBy.name : 'Contributor'}
          </span>
        </div>

        {/* Stats and action */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500" title="Views">
            <Eye className="w-3.5 h-3.5" />
            {note.views}
          </span>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-primary-light transition-colors group/btn" 
            title="Download note"
          >
            <Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
            {downloads}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
