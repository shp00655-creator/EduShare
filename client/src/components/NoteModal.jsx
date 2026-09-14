import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getApiBaseUrl } from '../utils/api';
import CommentSection from './CommentSection';
import { resolveFileUrl } from '../utils/url';
import { 
  X, 
  Download, 
  Eye, 
  Star, 
  Calendar, 
  User, 
  GraduationCap, 
  ExternalLink,
  BookOpen,
  Flag
} from 'lucide-react';

const NoteModal = ({ noteId, onClose }) => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  // User Reporting States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Spam / Automated Upload');
  const [reportDetails, setReportDetails] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  const handleReportUser = async () => {
    if (!user) {
      toast.warning('Please sign in to report users.');
      return;
    }
    setSendingReport(true);
    try {
      const fullReason = `${reportReason}: ${reportDetails.trim()}`;
      const { data } = await api.post('/auth/report-user', {
        reportedUserId: note.uploadedBy._id,
        reportedNoteId: note._id,
        reason: fullReason,
      });
      toast.success(data.message || 'Report submitted successfully.');
      setShowReportModal(false);
      setReportDetails('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit user report.';
      toast.error(errorMsg);
    } finally {
      setSendingReport(false);
    }
  };

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const { data } = await api.get(`/notes/${noteId}`);
        setNote(data);

        // Pre-fill user rating if they have rated
        const currentRating = data.ratings.find(
          (r) => (r.user?._id || r.user) === user?._id
        );
        if (currentRating) {
          setUserRating(currentRating.score);
        }
      } catch (error) {
        toast.error('Failed to load note details.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNoteDetails();
    }
  }, [noteId, user?._id]);

  const handleRatingSubmit = async (score) => {
    if (!user) {
      toast.warning('Please sign in to rate notes.');
      return;
    }

    setSubmittingRating(true);
    try {
      const { data } = await api.post(`/notes/${note._id}/rate`, { score });
      setUserRating(score);
      toast.success(data.message);
      
      // Update note rating in modal view
      const updatedNote = { ...note };
      const ratingIdx = updatedNote.ratings.findIndex(
        (r) => (r.user?._id || r.user) === user._id
      );

      if (ratingIdx > -1) {
        updatedNote.ratings[ratingIdx].score = score;
      } else {
        updatedNote.ratings.push({ user: user._id, score });
      }

      // Pre-save calculates avg in mongoose, we can update it locally or re-fetch.
      // Re-fetching or calculation locally:
      const sum = updatedNote.ratings.reduce((acc, curr) => acc + curr.score, 0);
      updatedNote.averageRating = Number((sum / updatedNote.ratings.length).toFixed(1));
      
      setNote(updatedNote);
      await refreshUser(); // Update credit display
    } catch (error) {
      toast.error('Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownload = () => {
    if (!note) return;

    const apiBase = getApiBaseUrl();
    const token = localStorage.getItem('token');
    const downloadUrl = `${apiBase}/notes/${note._id}/download-file?token=${token}`;
    
    // Trigger download in a new tab
    window.open(downloadUrl, '_blank');

    // Update download count locally
    setNote((prev) => ({ ...prev, downloads: prev.downloads + 1 }));

    // Refresh credits on frontend
    setTimeout(() => {
      refreshUser();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-oxford-950/80 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!note) return null;

  const absoluteUrl = resolveFileUrl(note.fileUrl);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const isPdf = note.fileUrl.toLowerCase().includes('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(note.fileUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oxford-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-slate-800 shadow-glass flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-oxford-900/80 text-slate-400 hover:text-slate-200 border border-slate-850 hover:bg-oxford-850 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Preview or Document Icon */}
        <div className="flex-1 bg-oxford-950/40 p-6 flex flex-col justify-center border-r border-slate-850">
          <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-400">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Document Preview</span>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[300px] md:min-h-[450px] bg-oxford-950/60 border border-slate-850 rounded-xl overflow-hidden relative">
            {isPdf ? (
              isMobile ? (
                <div className="text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto animate-pulse">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">PDF Reader Ready</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Mobile browsers do not support rendering inline PDF documents. Tap below to read.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex h-9 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-xs font-bold transition-all shadow-md"
                  >
                    <Eye className="w-4 h-4" /> Open PDF
                  </button>
                </div>
              ) : (
                <iframe 
                  src={`${absoluteUrl}#toolbar=0`} 
                  title={note.title} 
                  className="w-full h-full border-none min-h-[350px] md:min-h-[450px]"
                />
              )
            ) : isImage ? (
              <img 
                src={absoluteUrl} 
                alt={note.title} 
                className="max-w-full max-h-[450px] object-contain rounded-lg p-2"
              />
            ) : (
              <div className="text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto animate-pulse">
                  <ExternalLink className="w-10 h-10" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Preview not available for this file type</p>
                <p className="text-xs text-slate-500">Please download to review the full contents of this note.</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex h-9 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-4 text-xs font-bold transition-all shadow-md"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details, Ratings, Comments */}
        <div className="w-full md:w-[350px] p-6 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary-light text-[10px] font-semibold uppercase tracking-wider">
                {note.branch}
              </span>
              <h3 className="text-xl font-bold text-slate-100 mt-2">{note.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{note.subject} • Sem {note.semester}</p>
            </div>

            {note.description && (
              <div className="bg-oxford-950/30 border border-slate-850 p-3 rounded-xl">
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{note.description}</p>
              </div>
            )}

            {/* Note Metadata Details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                <span>Unit: {note.unit || 'All'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Uploaded by: <strong className="text-slate-300">{note.uploadedBy?.name}</strong></span>
              </div>
            </div>

            {/* Rating Section */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Submit Your Rating</h4>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={submittingRating}
                      onClick={() => handleRatingSubmit(star)}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= userRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-600 hover:text-amber-400/50'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  Avg: {note.averageRating.toFixed(1)} ({note.ratings?.length || 0})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-all"
              >
                <Download className="w-4 h-4" /> Download Note
              </button>
              {note.uploadedBy && user && note.uploadedBy._id !== user._id && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex-1 inline-flex h-9 items-center gap-1.5 justify-center rounded-xl bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose border border-accent-rose/20 text-xs font-semibold shadow-sm transition-all"
                >
                  <Flag className="w-3.5 h-3.5" /> Report Note / Content
                </button>
              )}
            </div>

            {/* Comments Component */}
            <CommentSection 
              noteId={note._id} 
              initialComments={note.comments}
              onCommentsUpdate={(updatedComments) => {
                setNote(prev => ({ ...prev, comments: updatedComments }));
              }}
            />
          </div>
        </div>

      </div>

      {/* Report User Modal Overlay */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-oxford-900 border border-slate-800 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-accent-rose" />
              Report Note & Uploader
            </h3>
            <p className="text-xs text-slate-400">
              Report note <strong className="text-slate-200">"{note.title}"</strong> and uploader <strong className="text-slate-200">{note.uploadedBy?.name}</strong> for publishing content that violates community standards.
            </p>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Reason
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oxford-950 border border-slate-850 text-slate-200 text-sm focus:border-primary focus:outline-none"
              >
                <option value="Spam / Automated Upload">Spam / Automated Upload</option>
                <option value="Plagiarism / Copyright Violation">Plagiarism / Copyright Violation</option>
                <option value="Incorrect / Misleading Content">Incorrect / Misleading Content</option>
                <option value="Inappropriate Profile Details">Inappropriate Profile Details</option>
                <option value="Harassment or Abuse">Harassment or Abuse</option>
                <option value="Other Violations">Other Violations</option>
              </select>

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
                Detailed Explanation
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Explain why this user or their note should be flagged..."
                className="w-full p-3 rounded-xl bg-oxford-950 border border-slate-850 text-slate-200 text-xs focus:border-primary focus:outline-none resize-none font-sans"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 transition-all border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportUser}
                disabled={sendingReport || !reportDetails.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent-rose text-white hover:bg-accent-rose/90 transition-all shadow-md disabled:opacity-50"
              >
                {sendingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteModal;
