import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { resolveFileUrl } from '../utils/url';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Edit2, Check, X, MessageSquare, CornerDownRight, MessageCircle } from 'lucide-react';

const CommentSection = ({ noteId, initialComments, onCommentsUpdate }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // States for editing comments
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [updating, setUpdating] = useState(false);

  // States for replying to comments
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Track expanded replies per comment
  const [expandedReplies, setExpandedReplies] = useState({});

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === false ? true : false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to add comments.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/notes/${noteId}/comments`, { text: newComment });
      setComments(data);
      setNewComment('');
      toast.success('Comment added');
      if (onCommentsUpdate) onCommentsUpdate(data);
    } catch (error) {
      toast.error('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/notes/${noteId}/comments/${commentId}`, { text: editText });
      setComments(data);
      setEditingId(null);
      toast.success('Comment updated');
      if (onCommentsUpdate) onCommentsUpdate(data);
    } catch (error) {
      toast.error('Failed to edit comment.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      const { data } = await api.delete(`/notes/${noteId}/comments/${commentId}`);
      setComments(data);
      toast.success('Comment deleted');
      if (onCommentsUpdate) onCommentsUpdate(data);
    } catch (error) {
      toast.error('Failed to delete comment.');
    }
  };

  // Reply Handlers
  const handleReplyClick = (commentId) => {
    if (!user) {
      toast.warning('Please log in to reply.');
      return;
    }
    setReplyingCommentId(commentId);
    setReplyText('');
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
  };

  const handleCancelReply = () => {
    setReplyingCommentId(null);
    setReplyText('');
  };

  const handleSubmitReply = async (commentId) => {
    if (!user) {
      toast.warning('Please log in to reply.');
      return;
    }
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const { data } = await api.post(`/notes/${noteId}/comments/${commentId}/replies`, {
        text: replyText.trim()
      });
      setComments(data);
      setReplyingCommentId(null);
      setReplyText('');
      toast.success('Reply added');
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      if (onCommentsUpdate) onCommentsUpdate(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply permanently?')) return;
    try {
      const { data } = await api.delete(`/notes/${noteId}/comments/${commentId}/replies/${replyId}`);
      setComments(data);
      toast.success('Reply deleted');
      if (onCommentsUpdate) onCommentsUpdate(data);
    } catch (error) {
      toast.error('Failed to delete reply.');
    }
  };

  // Total comment + reply count
  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="mt-6 border-t border-slate-800/80 pt-6">
      <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-primary" />
        Discussion & Comments ({totalCommentsCount})
      </h4>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a constructive comment or question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl glass-input placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center justify-center bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl px-4 py-2.5 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="bg-oxford-800/50 border border-slate-800 rounded-xl p-3 text-center text-xs text-slate-400 mb-6">
          Please <span className="text-primary hover:underline cursor-pointer" onClick={() => window.location.href='/auth'}>sign in</span> to join the discussion and post replies.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4">No comments yet. Start the conversation!</p>
          ) : (
            comments.map((comment) => {
              const isCommentOwner = user?._id === (comment.user?._id || comment.user) || user?.role === 'admin';
              const isEditing = editingId === comment._id;
              const isReplying = replyingCommentId === comment._id;
              const hasReplies = comment.replies && comment.replies.length > 0;
              const isExpanded = expandedReplies[comment._id] !== false; // defaults to expanded

              return (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-oxford-800/30 border border-slate-850 p-3.5 rounded-xl space-y-3"
                >
                  {/* Comment Item Header & Body */}
                  <div className="flex items-start gap-3">
                    {/* Left Avatar */}
                    {comment.user?.profilePicture ? (
                      <img
                        src={resolveFileUrl(comment.user.profilePicture)}
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-oxford-700/60 flex items-center justify-center font-bold text-xs text-slate-300 uppercase shrink-0 border border-slate-700">
                        {comment.userName?.charAt(0) || '?'}
                      </div>
                    )}

                    {/* Middle Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {comment.userName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg glass-input"
                            disabled={updating}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdate(comment._id)}
                            disabled={updating || !editText.trim()}
                            className="p-1 rounded-md bg-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/30 transition-all disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded-md bg-oxford-700 text-slate-400 hover:text-slate-200 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 mt-1 break-words leading-relaxed">
                          {comment.text}
                        </p>
                      )}

                      {/* Interaction Bar: Reply Button & Reply Count */}
                      <div className="flex items-center gap-3 mt-2">
                        {user && (
                          <button
                            type="button"
                            onClick={() => handleReplyClick(comment._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-primary transition-colors"
                          >
                            <CornerDownRight className="w-3 h-3" /> Reply
                          </button>
                        )}

                        {hasReplies && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(comment._id)}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-light transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {isExpanded ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right Owner Actions */}
                    {isCommentOwner && !isEditing && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(comment)}
                          className="p-1 rounded-md text-slate-500 hover:text-primary hover:bg-oxford-800 transition-all"
                          title="Edit Comment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment._id)}
                          className="p-1 rounded-md text-slate-500 hover:text-accent-rose hover:bg-oxford-800 transition-all"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Reply Input Box */}
                  {isReplying && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitReply(comment._id);
                      }}
                      className="ml-5 sm:ml-9 pl-3 border-l-2 border-primary/40 flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        placeholder={`Reply to @${comment.userName}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={submittingReply}
                        autoFocus
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg glass-input placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="p-1.5 rounded-lg bg-oxford-850 hover:bg-oxford-800 text-slate-400 hover:text-slate-200 text-xs transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}

                  {/* Nested Replies Section */}
                  {hasReplies && isExpanded && (
                    <div className="ml-5 sm:ml-9 pl-3 border-l-2 border-slate-800 space-y-2 pt-1">
                      {comment.replies.map((reply) => {
                        const isReplyOwner = user?._id === (reply.user?._id || reply.user) || user?.role === 'admin';

                        return (
                          <div
                            key={reply._id}
                            className="bg-oxford-900/70 border border-slate-850/80 p-2.5 rounded-lg flex items-start gap-2.5 group hover:border-slate-800 transition-colors"
                          >
                            {/* Reply Avatar */}
                            {reply.user?.profilePicture ? (
                              <img
                                src={resolveFileUrl(reply.user.profilePicture)}
                                alt={reply.userName}
                                className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-oxford-800 flex items-center justify-center font-bold text-[10px] text-slate-300 uppercase shrink-0 border border-slate-700">
                                {reply.userName?.charAt(0) || '?'}
                              </div>
                            )}

                            {/* Reply Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-200 truncate">
                                  {reply.userName}
                                </span>
                                <span className="text-[9px] text-slate-500">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5 break-words leading-relaxed">
                                {reply.text}
                              </p>
                            </div>

                            {/* Delete Reply Button */}
                            {isReplyOwner && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReply(comment._id, reply._id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-accent-rose hover:bg-oxford-800 transition-all shrink-0"
                                title="Delete Reply"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSection;
