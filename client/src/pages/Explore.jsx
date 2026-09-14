import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { NoteGridSkeleton } from '../components/SkeletonLoaders';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, BookOpen, GraduationCap, Users } from 'lucide-react';

const Explore = () => {
  const toast = useToast();
  
  // Section Navigation ('notes', 'question_paper', 'all')
  const [section, setSection] = useState('notes');

  // Search and Filter States
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('All');
  const [semester, setSemester] = useState('All');
  const [subject, setSubject] = useState('');
  
  // Notes and Loading States
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const branches = [
    'All',
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
  ];

  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (section !== 'all') params.resourceType = section;
      if (search) params.search = search;
      if (branch !== 'All') params.branch = branch;
      if (semester !== 'All') params.semester = semester;
      if (subject) params.subject = subject;

      const { data } = await api.get('/notes', { params });
      setNotes(data);
    } catch (error) {
      toast.error('Failed to retrieve academic materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes on initial load and when dropdown filters change
  useEffect(() => {
    fetchNotes();
  }, [branch, semester, section]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setBranch('All');
    setSemester('All');
    setSubject('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 bg-oxford-950 min-h-[calc(100vh-4rem)] relative">
      
      {/* Background Accent */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Header and Section Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans flex items-center gap-2">
            {section === 'question_paper' ? 'Question Papers & PYQs' : section === 'notes' ? 'Curriculum Notes' : 'Explore All Materials'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {section === 'question_paper'
              ? 'Browse previous year semester papers, mid-term questions, and solutions.'
              : section === 'notes'
                ? 'Discover class lecture notes, summaries, and revision guides contributed by top students.'
                : 'Explore all verified study resources, notes, and previous year papers.'}
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex p-1.5 bg-oxford-900 border border-slate-800 rounded-2xl self-start md:self-auto shadow-lg">
          <button
            onClick={() => setSection('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'notes'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📚 Study Notes
          </button>
          <button
            onClick={() => setSection('question_paper')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'question_paper'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 Question Papers (PYQ)
          </button>
          <button
            onClick={() => setSection('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              section === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌟 All
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-805/50 mb-8 shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          
          {/* Main search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by title, subject name, code (e.g. CS302), or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-sm font-semibold shadow-md transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Branch dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input"
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-oxford-900">{b}</option>
                ))}
              </select>
            </div>

            {/* Semester dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" /> Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input"
              >
                {semesters.map((s) => (
                  <option key={s} value={s} className="bg-oxford-900">
                    {s === 'All' ? 'All Semesters' : `Sem ${s}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Subject Code or Name
              </label>
              <input
                type="text"
                placeholder="e.g. Operating Systems / CS302"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input placeholder:text-slate-600"
              />
            </div>

          </div>

          {/* Reset Filters & Re-search buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/40">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex h-8 items-center gap-1.5 justify-center rounded-lg bg-oxford-850 border border-slate-700/30 text-slate-400 hover:text-slate-200 px-3 text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
            <button
              type="button"
              onClick={fetchNotes}
              className="inline-flex h-8 items-center gap-1.5 justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary-light hover:bg-primary/20 px-3 text-xs font-semibold transition-all"
            >
              Apply Inputs
            </button>
          </div>

        </form>
      </div>

      {/* Notes Feed Grid */}
      {loading ? (
        <NoteGridSkeleton count={6} />
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onViewClick={(id) => setSelectedNoteId(id)}
              onDeleteSuccess={fetchNotes}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-slate-800 bg-oxford-900/10">
          <div className="w-16 h-16 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-slate-350 font-semibold text-lg">No notes found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or reset filters to explore all resources.
          </p>
          <button 
            onClick={handleResetFilters}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-4 text-xs font-bold mt-4 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Note Detail Modal Overlay */}
      {selectedNoteId && (
        <NoteModal 
          noteId={selectedNoteId} 
          onClose={() => {
            setSelectedNoteId(null);
            fetchNotes(); // Re-fetch notes on close to update ratings/views indicators
          }} 
        />
      )}

    </div>
  );
};

export default Explore;
