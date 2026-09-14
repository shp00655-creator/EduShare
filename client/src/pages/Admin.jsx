import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { resolveFileUrl } from '../utils/url';
import { 
  Shield, 
  Cpu, 
  HardDrive, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FileSignature, 
  Search,
  Eye,
  ExternalLink,
  Tag,
  BookOpen,
  Plus,
  CheckCheck,
  FileCheck,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('verification'); // 'health', 'verification', 'subjects', 'users', 'notes', 'reports'
  
  // Data States
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [previewingNote, setPreviewingNote] = useState(null);

  // Verification Queue States
  const [pendingNotesList, setPendingNotesList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [rejectModalNote, setRejectModalNote] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Does not meet academic curriculum standards');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Subject Management States
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [searchSubject, setSearchSubject] = useState('');
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    branch: 'Computer Science',
    semester: '1'
  });
  const [submittingSubject, setSubmittingSubject] = useState(false);
  
  // Loading & Action States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Search States
  const [searchUser, setSearchUser] = useState('');
  const [searchNote, setSearchNote] = useState('');
  
  // Edit Credits Modal/Form State
  const [editingUserId, setEditingUserId] = useState(null);
  const [editCreditsValue, setEditCreditsValue] = useState('');
  const [submittingCredits, setSubmittingCredits] = useState(false);

  // Fetching System Health & Aggregates
  const fetchStats = async (showLoading = false) => {
    if (showLoading) setLoadingStats(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to retrieve system status metrics.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetching Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get(`/admin/users?search=${searchUser}`);
      setUsersList(data);
    } catch (error) {
      toast.error('Failed to load user list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetching Notes
  const fetchNotes = async (searchTerm = searchNote) => {
    setLoadingNotes(true);
    try {
      const params = {};
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      const { data } = await api.get('/admin/notes', { params });
      setNotesList(data);
    } catch (error) {
      toast.error('Failed to load notes catalog.');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Fetching Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data } = await api.get('/admin/reports');
      setReportsList(data);
    } catch (error) {
      toast.error('Failed to fetch reported users queue.');
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch Pending Verification Notes
  const fetchPendingNotes = async () => {
    setLoadingPending(true);
    try {
      const { data } = await api.get('/admin/notes/pending');
      setPendingNotesList(data);
    } catch (error) {
      toast.error('Failed to retrieve pending verification notes.');
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch Curriculum Subjects
  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data } = await api.get('/subjects');
      setSubjectsList(data);
    } catch (error) {
      toast.error('Failed to load curriculum subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Approve Note Handler
  const handleApproveNote = async (noteId, noteTitle) => {
    setSubmittingAction(true);
    try {
      const { data } = await api.put(`/admin/notes/${noteId}/approve`);
      toast.success(data.message || `"${noteTitle}" approved and published!`);
      setPendingNotesList(prev => prev.filter(n => n._id !== noteId));
      fetchStats(false);
      if (previewingNote?._id === noteId) setPreviewingNote(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve note.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Reject Note Handler
  const handleRejectNote = async () => {
    if (!rejectModalNote) return;
    setSubmittingAction(true);
    try {
      const { data } = await api.put(`/admin/notes/${rejectModalNote._id}/reject`, {
        reason: rejectionReason
      });
      toast.success(data.message || `Note "${rejectModalNote.title}" rejected.`);
      setPendingNotesList(prev => prev.filter(n => n._id !== rejectModalNote._id));
      setRejectModalNote(null);
      setRejectionReason('Does not meet academic curriculum standards');
      fetchStats(false);
      if (previewingNote?._id === rejectModalNote._id) setPreviewingNote(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject note.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Add Subject Handler
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim() || !newSubject.code.trim()) {
      toast.warning('Both Subject Name and Subject Code are required.');
      return;
    }
    setSubmittingSubject(true);
    try {
      const { data } = await api.post('/subjects', {
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        branch: newSubject.branch,
        semester: newSubject.semester
      });
      toast.success(data.message || 'Subject added to curriculum successfully.');
      setNewSubject(prev => ({ ...prev, name: '', code: '' }));
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject.');
    } finally {
      setSubmittingSubject(false);
    }
  };

  // Delete Subject Handler
  const handleDeleteSubject = async (subjectId, subjectCode, subjectName) => {
    if (!window.confirm(`Are you sure you want to remove subject "${subjectCode} - ${subjectName}" from the curriculum?`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/subjects/${subjectId}`);
      toast.success(data.message || 'Subject deleted from curriculum.');
      setSubjectsList(prev => prev.filter(s => s._id !== subjectId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subject.');
    }
  };

  // Poll stats every 10 seconds, fetch on mount
  useEffect(() => {
    fetchStats(true);
    const interval = setInterval(() => fetchStats(false), 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Tab-specific data
  useEffect(() => {
    if (activeTab === 'verification') fetchPendingNotes();
    if (activeTab === 'subjects') fetchSubjects();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'notes') fetchNotes();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  // Handle User Search Submit
  const handleUserSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Handle Note Search Submit
  const handleNoteSearch = (e) => {
    if (e) e.preventDefault();
    fetchNotes(searchNote);
  };

  // Clear Note Search
  const handleClearNoteSearch = () => {
    setSearchNote('');
    fetchNotes('');
  };

  // Filter notes directly by clicking a tag
  const handleFilterByTag = (tag) => {
    setSearchNote(tag);
    fetchNotes(tag);
  };

  // Update Credits Handler
  const handleUpdateCreditsSubmit = async (userId) => {
    if (isNaN(Number(editCreditsValue)) || Number(editCreditsValue) < 0) {
      toast.warning('Please enter a valid positive number for credits.');
      return;
    }
    setSubmittingCredits(true);
    try {
      const { data } = await api.put(`/admin/users/${userId}/credits`, {
        credits: Number(editCreditsValue)
      });
      toast.success(data.message);
      setEditingUserId(null);
      // Update locally
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, credits: Number(editCreditsValue) } : u));
      fetchStats(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user credits.');
    } finally {
      setSubmittingCredits(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you absolutely sure you want to delete user "${userName}"?\nThis deletes all their uploads, reviews, bookmarks, and reports permanently.`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/admin/users/${userId}`);
      toast.success(data.message);
      setUsersList(prev => prev.filter(u => u._id !== userId));
      setReportsList(prev => prev.filter(r => r.reportedUser?._id !== userId && r.reportedBy?._id !== userId));
      fetchStats(false);
    } catch (error) {
      toast.error('Failed to remove user account.');
    }
  };

  // Toggle Ban User Handler
  const handleToggleBan = async (userId, userName, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} user "${userName}"?`)) {
      return;
    }
    try {
      const { data } = await api.put(`/admin/users/${userId}/ban`);
      toast.success(data.message);
      
      // Update local state
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !isBanned } : u));
      setReportsList(prev => prev.map(r => r.reportedUser?._id === userId ? { ...r, reportedUser: { ...r.reportedUser, isBanned: !isBanned } } : r));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user.`);
    }
  };

  // Delete Note Handler
  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!window.confirm(`Are you sure you want to remove the note "${noteTitle}" from the platform?`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/admin/notes/${noteId}`);
      toast.success(data.message);
      setNotesList(prev => prev.filter(n => n._id !== noteId));
      setReportsList(prev => prev.map(r => {
        if (r.reportedNote && (r.reportedNote._id === noteId || r.reportedNote === noteId)) {
          return { ...r, reportedNote: null, noteDeleted: true };
        }
        return r;
      }));
      fetchStats(false);
      if (previewingNote && previewingNote._id === noteId) {
        setPreviewingNote(null);
      }
    } catch (error) {
      toast.error('Failed to delete note from system.');
    }
  };

  // Delete Reported Content Handler (directly from Reports Queue without switching tabs)
  const handleDeleteReportedContent = async (noteId, noteTitle, reportId) => {
    if (!window.confirm(`Are you sure you want to permanently delete the reported note "${noteTitle}" from the platform?\nThis deletes the file, deducts 10 credits from the uploader, and removes the content.`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/admin/notes/${noteId}`);
      toast.success(data.message || 'Reported content deleted successfully.');
      
      // Update reports list state locally so admin sees content removed immediately without switching tab
      setReportsList(prev => prev.map(r => {
        if (r._id === reportId || (r.reportedNote && (r.reportedNote._id === noteId || r.reportedNote === noteId))) {
          return { ...r, reportedNote: null, noteDeleted: true };
        }
        return r;
      }));

      // Also update notes list if it was loaded
      setNotesList(prev => prev.filter(n => n._id !== noteId));
      fetchStats(false);
      
      if (previewingNote && previewingNote._id === noteId) {
        setPreviewingNote(null);
      }
    } catch (error) {
      toast.error('Failed to delete reported content.');
    }
  };

  // Resolve Report Handler
  const handleResolveReport = async (reportId) => {
    try {
      const { data } = await api.put(`/admin/reports/${reportId}/resolve`);
      toast.success(data.message);
      setReportsList(prev => prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
      fetchStats(false);
    } catch (error) {
      toast.error('Failed to resolve report.');
    }
  };

  // Helper: Format Uptime
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const dDisplay = d > 0 ? `${d}d ` : '';
    const hDisplay = h > 0 ? `${h}h ` : '';
    const mDisplay = m > 0 ? `${m}m ` : '';
    const sDisplay = `${s}s`;
    return dDisplay + hDisplay + mDisplay + sDisplay;
  };

  // Helper: Format Bytes to MB
  const formatMB = (bytes) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-oxford-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Admin Control Panel</h1>
              <p className="text-sm text-slate-400">Moderator Dashboard to control notes backend parameters, databases, user balances, and reported abuses.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              fetchStats(true);
              if (activeTab === 'users') fetchUsers();
              if (activeTab === 'notes') fetchNotes();
              if (activeTab === 'reports') fetchReports();
            }}
            className="flex items-center gap-2 justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-oxford-900 border border-slate-850 hover:bg-oxford-850 transition-all text-slate-300"
          >
            <RefreshCw className="w-4 h-4" /> Refresh All Data
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-xl bg-oxford-900 border border-slate-800/80 max-w-4xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'verification'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Verification Queue
            {stats?.aggregates?.pendingNotes > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-[10px] font-black text-black animate-pulse">
                {stats.aggregates.pendingNotes}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'subjects'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Curriculum Subjects
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> System Health
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> User Control
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Notes Catalog
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'reports'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Reports
            {stats?.aggregates?.pendingReports > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-accent-rose text-[10px] font-black text-white animate-pulse">
                {stats.aggregates.pendingReports}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: System Health */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {loadingStats && !stats ? (
              <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 max-w-xl space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-primary" />
                  System Overview
                </h3>

                <div className="divide-y divide-slate-850 text-sm">
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Total Registered Users</span>
                    <span className="font-bold text-white">{stats?.aggregates?.totalUsers ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Total Uploaded Notes</span>
                    <span className="font-bold text-white">{stats?.aggregates?.totalNotes ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Database Status</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${stats?.database?.readyState === 1 ? 'bg-accent-emerald animate-pulse' : 'bg-accent-rose'}`}></span>
                      {stats?.database?.status === 'Connected' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Backend Server Status</span>
                    <span className={`font-bold ${stats ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {stats ? 'Running' : 'Not Running / Unreachable'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Server Uptime</span>
                    <span className="font-bold text-slate-300">{stats ? formatUptime(stats.system.uptime) : 'N/A'}</span>
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: User Control */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search filter bar */}
            <form onSubmit={handleUserSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name, email, roll number..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md"
              >
                Search
              </button>
            </form>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No users matching search filters were found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-oxford-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Avatar & Name</th>
                        <th className="py-4 px-6">Email / Roll No</th>
                        <th className="py-4 px-6">Branch & Sem</th>
                        <th className="py-4 px-6">Credits</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="hover:bg-oxford-900/30 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            {usr.profilePicture ? (
                              <img 
                                src={resolveFileUrl(usr.profilePicture)} 
                                alt={usr.name} 
                                className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-oxford-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                {usr.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-200 flex items-center">
                                {usr.name}
                                {usr.isBanned && (
                                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-accent-rose/25 text-accent-rose border border-accent-rose/30 uppercase tracking-wide">
                                    Banned
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500">Registered {new Date(usr.createdAt).toLocaleDateString()}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-300">{usr.email}</p>
                            <p className="text-xs text-slate-500">Roll: {usr.rollNumber || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-6 text-xs font-medium text-slate-400">
                            <p>{usr.branch || 'N/A'}</p>
                            <p className="text-[10px] text-slate-500">Semester {usr.semester || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-6">
                            {editingUserId === usr._id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editCreditsValue}
                                  onChange={(e) => setEditCreditsValue(e.target.value)}
                                  className="w-16 px-2 py-1 rounded bg-oxford-950 border border-slate-700 text-xs font-bold text-amber-400 focus:outline-none"
                                  disabled={submittingCredits}
                                />
                                <button
                                  onClick={() => handleUpdateCreditsSubmit(usr._id)}
                                  disabled={submittingCredits}
                                  className="p-1 rounded bg-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/30"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  disabled={submittingCredits}
                                  className="p-1 rounded bg-accent-rose/20 text-accent-rose hover:bg-accent-rose/30"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-amber-400 bg-amber-400/5 px-2.5 py-0.5 rounded border border-amber-400/20 text-xs">
                                  {usr.credits}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingUserId(usr._id);
                                    setEditCreditsValue(usr.credits);
                                  }}
                                  className="p-1 text-slate-500 hover:text-slate-300"
                                  title="Edit Credits"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              usr.role === 'admin' 
                                ? 'bg-accent-purple/10 border-accent-purple/35 text-accent-purple' 
                                : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            {usr._id !== user._id ? (
                              <>
                                <button
                                  onClick={() => handleToggleBan(usr._id, usr.name, usr.isBanned)}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    usr.isBanned 
                                      ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/20' 
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                  }`}
                                  title={usr.isBanned ? 'Unban User' : 'Ban User'}
                                >
                                  {usr.isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(usr._id, usr.name)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose transition-all border border-accent-rose/10"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Self (Protected)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Content Control */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Search filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <form onSubmit={handleNoteSearch} className="flex gap-2 max-w-lg flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search note title, subject, branch, tags (e.g. #exam)..."
                    value={searchNote}
                    onChange={(e) => setSearchNote(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-sm"
                  />
                  {searchNote && (
                    <button
                      type="button"
                      onClick={handleClearNoteSearch}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
              </form>

              {searchNote && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Filtered by: <span className="font-semibold text-primary-light">"{searchNote}"</span></span>
                  <button
                    type="button"
                    onClick={handleClearNoteSearch}
                    className="px-2 py-0.5 rounded bg-oxford-850 hover:bg-oxford-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors text-[11px]"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Notes Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                {loadingNotes ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : notesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No notes matching search query were found.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-oxford-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Document Title</th>
                        <th className="py-4 px-6">Subject & Code</th>
                        <th className="py-4 px-6">Type & Status</th>
                        <th className="py-4 px-6">Uploader</th>
                        <th className="py-4 px-6">Stats</th>
                        <th className="py-4 px-6">Rating</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {notesList.map((nte) => (
                        <tr key={nte._id} className="hover:bg-oxford-900/30 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-200">{nte.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5 tracking-wider">{nte.branch} • Sem {nte.semester}</p>
                          </td>
                          <td className="py-4 px-6">
                            {nte.subjectCode && (
                              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-1">
                                {nte.subjectCode}
                              </span>
                            )}
                            <span className="font-semibold text-slate-300">{nte.subject}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{nte.unit ? `Unit ${nte.unit}` : 'Full Syllabus'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div>
                                {nte.resourceType === 'question_paper' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                    📝 Question Paper
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                                    📚 Study Notes
                                  </span>
                                )}
                              </div>
                              <div>
                                {nte.status === 'pending' && (
                                  <span className="text-[10px] font-bold text-amber-400">⏳ Verification Pending</span>
                                )}
                                {nte.status === 'approved' && (
                                  <span className="text-[10px] font-bold text-emerald-400">✅ Live on Platform</span>
                                )}
                                {nte.status === 'rejected' && (
                                  <span className="text-[10px] font-bold text-rose-400">❌ Rejected</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {nte.uploadedBy?.profilePicture ? (
                                <img 
                                  src={resolveFileUrl(nte.uploadedBy.profilePicture)} 
                                  alt={nte.uploadedBy?.name} 
                                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-oxford-850 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-850">
                                  {nte.uploadedBy?.name ? nte.uploadedBy.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-slate-300 text-xs">{nte.uploadedBy?.name || 'Unknown'}</span>
                                <p className="text-[9px] text-slate-500 font-mono">{nte.uploadedBy?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                            <p>Downloads: <span className="font-bold text-white">{nte.downloads}</span></p>
                            <p>Comments: <span className="font-bold text-white">{nte.comments?.length || 0}</span></p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                              ★ {nte.averageRating.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">({nte.ratings?.length || 0})</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewingNote(nte)}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-oxford-850 hover:bg-oxford-800 text-slate-300 transition-all border border-slate-800"
                                title="Preview Document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(nte._id, nte.title)}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose transition-all border border-accent-rose/10"
                                title="Delete Note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Queue Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                {loadingReports ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : reportsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No active user abuse reports have been filed.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-oxford-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Reported User</th>
                        <th className="py-4 px-6">Reported By</th>
                        <th className="py-4 px-6">Violation Reason</th>
                        <th className="py-4 px-6">Reported Content</th>
                        <th className="py-4 px-6">Date Submitted</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Moderator Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {reportsList.map((rep) => (
                        <tr key={rep._id} className="hover:bg-oxford-900/30 transition-colors">
                          <td className="py-4 px-6">
                            {rep.reportedUser ? (
                              <div className="flex items-center gap-2">
                                {rep.reportedUser.profilePicture ? (
                                  <img 
                                    src={resolveFileUrl(rep.reportedUser.profilePicture)} 
                                    alt={rep.reportedUser.name} 
                                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-oxford-850 flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-850">
                                    {rep.reportedUser.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-200">{rep.reportedUser.name}</span>
                                  <p className="text-[9px] font-mono text-slate-500">{rep.reportedUser.email}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">User Deleted</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {rep.reportedBy ? (
                              <div>
                                <span className="font-medium text-slate-300">{rep.reportedBy.name}</span>
                                <p className="text-[9px] font-mono text-slate-500">{rep.reportedBy.email}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Reporter Deleted</span>
                            )}
                          </td>
                          <td className="py-4 px-6 max-w-xs">
                            <span className="text-slate-300 whitespace-pre-wrap leading-relaxed text-xs block bg-oxford-950/50 p-2.5 rounded-xl border border-slate-850">
                              {rep.reason}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {rep.reportedNote ? (
                              <div className="bg-oxford-950/80 border border-slate-800 rounded-xl p-3 space-y-2 min-w-[220px] max-w-xs shadow-inner">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-white truncate" title={rep.reportedNote.title}>
                                      {rep.reportedNote.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {rep.reportedNote.subject} • Sem {rep.reportedNote.semester}
                                    </p>
                                    {rep.reportedNote.teacherName && (
                                      <p className="text-[10px] text-slate-500 truncate">
                                        Instructor: <span className="text-slate-300 font-medium">{rep.reportedNote.teacherName}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewingNote(rep.reportedNote)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary-light text-xs font-semibold border border-primary/25 transition-all shadow-sm"
                                    title="Check & Inspect Content"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Check
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReportedContent(rep.reportedNote._id, rep.reportedNote.title, rep._id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose text-xs font-semibold border border-accent-rose/25 transition-all shadow-sm"
                                    title="Delete Content Without Switching Tab"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Content
                                  </button>
                                </div>
                                {rep.userNotes && rep.userNotes.length > 1 && (
                                  <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800/50">
                                    <span>User has {rep.userNotes.length} notes uploaded</span>
                                  </div>
                                )}
                              </div>
                            ) : rep.noteDeleted ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Content Deleted</span>
                              </div>
                            ) : rep.userNotes && rep.userNotes.length > 0 ? (
                              <div className="space-y-1.5 min-w-[200px] max-w-xs">
                                <span className="text-[11px] text-slate-400 block font-medium">User's Uploaded Notes ({rep.userNotes.length}):</span>
                                {rep.userNotes.map((n) => (
                                  <div key={n._id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-oxford-950/80 border border-slate-800 text-xs">
                                    <div className="min-w-0">
                                      <p className="truncate text-white font-semibold">{n.title}</p>
                                      <p className="text-[10px] text-slate-500 truncate">{n.subject} • Sem {n.semester}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewingNote(n)}
                                        className="p-1 rounded bg-primary/15 text-primary-light hover:bg-primary/25 border border-primary/20"
                                        title="Check Note"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReportedContent(n._id, n.title, rep._id)}
                                        className="p-1 rounded bg-accent-rose/15 text-accent-rose hover:bg-accent-rose/25 border border-accent-rose/20"
                                        title="Delete Note"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic block py-1">
                                User conduct report (No uploaded notes)
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500">
                            {new Date(rep.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                              rep.status === 'resolved' 
                                ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald' 
                                : 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose'
                            }`}>
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                            {rep.status !== 'resolved' && (
                              <button
                                onClick={() => handleResolveReport(rep._id)}
                                className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald text-xs font-bold transition-all border border-accent-emerald/10"
                                title="Dismiss/Resolve Report"
                              >
                                Dismiss
                              </button>
                            )}
                            {rep.reportedUser && rep.reportedUser._id !== user._id && (
                              <>
                                <button
                                  onClick={() => handleToggleBan(rep.reportedUser._id, rep.reportedUser.name, rep.reportedUser.isBanned)}
                                  className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    rep.reportedUser.isBanned 
                                      ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/20' 
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                  }`}
                                  title={rep.reportedUser.isBanned ? 'Unban User' : 'Ban User'}
                                >
                                  {rep.reportedUser.isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(rep.reportedUser._id, rep.reportedUser.name)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose transition-all border border-accent-rose/10"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Verification Queue */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                  Notes & Question Papers Verification Queue
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submissions in this queue are hidden from the public explore page until you approve them. Approving rewards the uploader with +10 contributor credits.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPendingNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 text-xs font-semibold border border-slate-800 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
              </button>
            </div>

            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                {loadingPending ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : pendingNotesList.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Verification Queue is Empty!</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All student uploads have been verified and published. New uploads will show up here automatically.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-oxford-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Document Details</th>
                        <th className="py-4 px-6">Subject & Code</th>
                        <th className="py-4 px-6">Academic Class</th>
                        <th className="py-4 px-6">Uploader</th>
                        <th className="py-4 px-6">Uploaded At</th>
                        <th className="py-4 px-6 text-right">Verification Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {pendingNotesList.map((note) => (
                        <tr key={note._id} className="hover:bg-oxford-900/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <span className="font-bold text-white block">{note.title}</span>
                              <div className="flex items-center gap-2">
                                {note.resourceType === 'question_paper' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                                    📝 Question Paper
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                                    📚 Study Notes
                                  </span>
                                )}
                                {note.unit && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Unit: {note.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {note.subjectCode || 'N/A'}
                            </span>
                            <p className="text-xs text-slate-300 font-medium mt-1">{note.subject}</p>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                            <p className="text-slate-200 font-semibold">{note.branch}</p>
                            <p className="text-slate-500">Semester {note.semester}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-200 text-xs">{note.uploadedBy?.name || 'Student'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{note.uploadedBy?.email}</p>
                            <span className="text-[10px] text-amber-400 font-semibold">
                              Credits: {note.uploadedBy?.credits || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-400">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewingNote(note)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 text-xs font-semibold border border-slate-750 transition-all"
                                title="Inspect Document Content"
                              >
                                <Eye className="w-3.5 h-3.5" /> Preview
                              </button>
                              <button
                                type="button"
                                disabled={submittingAction}
                                onClick={() => handleApproveNote(note._id, note.title)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-emerald hover:bg-accent-emerald/90 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                                title="Approve & Publish (+10 credits to student)"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve & Publish
                              </button>
                              <button
                                type="button"
                                disabled={submittingAction}
                                onClick={() => setRejectModalNote(note)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose text-xs font-semibold border border-accent-rose/25 transition-all disabled:opacity-50"
                                title="Reject with Reason"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Curriculum Subjects Management */}
        {activeTab === 'subjects' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Curriculum Subjects & Code Directory
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure authorized subjects and subject codes for each branch and semester. Note uploads will be strictly verified against this directory.
              </p>
            </div>

            {/* Add New Subject Form */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-md">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Add New Curriculum Subject
              </h4>
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Subject Code <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS302"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input uppercase font-mono"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Subject Name <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Branch <span className="text-accent-rose">*</span>
                  </label>
                  <select
                    value={newSubject.branch}
                    onChange={(e) => setNewSubject({ ...newSubject, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-oxford-900"
                  >
                    {[
                      'Computer Science',
                      'Information Technology',
                      'Electronics & Communication',
                      'Electrical Engineering',
                      'Mechanical Engineering',
                      'Civil Engineering',
                      'Chemical Engineering'
                    ].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Semester <span className="text-accent-rose">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={newSubject.semester}
                      onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-oxford-900"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={submittingSubject}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
                    >
                      {submittingSubject ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Existing Subjects Table */}
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden space-y-4">
              <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search curriculum by code (CS302) or subject name..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input"
                  />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Total Active Subjects: <strong className="text-white">{subjectsList.length}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                {loadingSubjects ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : subjectsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No curriculum subjects registered yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-oxford-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Code</th>
                        <th className="py-3.5 px-6">Subject Name</th>
                        <th className="py-3.5 px-6">Branch</th>
                        <th className="py-3.5 px-6">Semester</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {subjectsList
                        .filter(
                          (s) =>
                            s.code.toLowerCase().includes(searchSubject.toLowerCase()) ||
                            s.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
                            s.branch.toLowerCase().includes(searchSubject.toLowerCase())
                        )
                        .map((subj) => (
                          <tr key={subj._id} className="hover:bg-oxford-900/30 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-bold text-primary-light">
                              {subj.code}
                            </td>
                            <td className="py-3.5 px-6 font-medium text-slate-200">
                              {subj.name}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400">
                              {subj.branch}
                            </td>
                            <td className="py-3.5 px-6 text-slate-400">
                              Sem {subj.semester}
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSubject(subj._id, subj.code, subj.name)}
                                className="p-1.5 rounded-lg bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose transition-all"
                                title="Remove Subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Document Inspector Modal for Admin */}
      {previewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-panel border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-oxford-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {previewingNote.title}
                    <span className="text-[10px] font-mono uppercase bg-oxford-850 px-2 py-0.5 rounded text-slate-400 border border-slate-750">
                      {previewingNote.branch} • Sem {previewingNote.semester}
                    </span>
                    {previewingNote.subjectCode && (
                      <span className="text-[10px] font-mono uppercase bg-primary/20 text-primary-light px-2 py-0.5 rounded font-bold">
                        {previewingNote.subjectCode}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Subject: <span className="text-slate-200 font-medium">{previewingNote.subject}</span>
                    {previewingNote.uploadedBy && (
                      <> • Uploader: <span className="text-slate-200 font-medium">{previewingNote.uploadedBy.name}</span> ({previewingNote.uploadedBy.email})</>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingNote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-oxford-850 hover:bg-oxford-800 border border-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-auto p-4 bg-oxford-950/60 min-h-[400px] flex items-center justify-center">
              {previewingNote.fileUrl?.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={resolveFileUrl(previewingNote.fileUrl)}
                  title={previewingNote.title}
                  className="w-full h-[60vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : /\.(jpg|jpeg|png|gif|webp)/i.test(previewingNote.fileUrl || '') ? (
                <img
                  src={resolveFileUrl(previewingNote.fileUrl)}
                  alt={previewingNote.title}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain border border-slate-800 shadow-lg"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-oxford-900 border border-slate-800 flex items-center justify-center text-primary mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-300 font-medium">
                    Office / Raw Document Format ({previewingNote.fileUrl?.split('.').pop()?.toUpperCase()})
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This file format is best viewed by opening or downloading it directly in a browser tab.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-oxford-900">
              <div className="flex items-center gap-2">
                <a
                  href={resolveFileUrl(previewingNote.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-750 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
              </div>
              <div className="flex items-center gap-2">
                {previewingNote.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => handleApproveNote(previewingNote._id, previewingNote.title)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-emerald hover:bg-accent-emerald/90 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve & Publish
                    </button>
                    <button
                      type="button"
                      disabled={submittingAction}
                      onClick={() => setRejectModalNote(previewingNote)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose text-xs font-semibold border border-accent-rose/25 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewingNote(null)}
                  className="px-3 py-2 rounded-xl bg-oxford-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalNote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-oxford-900 border border-slate-800 p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setRejectModalNote(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-rose" />
              Reject Document Submission
            </h3>
            <p className="text-xs text-slate-400">
              Rejecting <strong className="text-slate-200">"{rejectModalNote.title}"</strong> will notify the uploader and prevent it from appearing on the platform.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Reason for Rejection
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-oxford-950 border border-slate-800 text-slate-200 text-xs"
              >
                <option value="Does not meet academic curriculum standards">Does not meet academic curriculum standards</option>
                <option value="Blurry / illegible scan quality">Blurry / illegible scan quality</option>
                <option value="Duplicate or already uploaded material">Duplicate or already uploaded material</option>
                <option value="Incorrect branch, semester, or subject classification">Incorrect branch, semester, or subject classification</option>
                <option value="Incomplete or corrupted file contents">Incomplete or corrupted file contents</option>
                <option value="Copyright or policy violation">Copyright or policy violation</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectModalNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleRejectNote}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-accent-rose hover:bg-accent-rose/90 text-white shadow-md disabled:opacity-50"
              >
                {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
