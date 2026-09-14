import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  GraduationCap,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Check,
  FileUp,
  Tags,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

const Upload = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Curriculum Subjects State
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: 'notes', // 'notes' or 'question_paper'
    branch: user?.branch || 'Computer Science',
    semester: user?.semester || '1',
    subject: '',
    subjectCode: '',
    unit: '',
    tags: ''
  });

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetch subjects from backend curriculum master
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const { data } = await api.get('/subjects');
        setSubjectsList(data);
      } catch (err) {
        console.error('Failed to load curriculum subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Sync profile details if auth session loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        branch: prev.branch === 'Computer Science' && user.branch ? user.branch : prev.branch,
        semester: prev.semester === '1' && user.semester ? user.semester : prev.semester
      }));
    }
  }, [user]);

  const branches = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering'
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Filter subjects for current branch and semester, or offer all
  const filteredSubjects = subjectsList.filter(
    (s) => s.branch === formData.branch && s.semester === formData.semester
  );
  // If no match for branch+semester, provide all subjects from that branch as fallback
  const suggestedSubjects = filteredSubjects.length > 0 
    ? filteredSubjects 
    : subjectsList.filter((s) => s.branch === formData.branch);

  // Two-way auto-fill handler for Subject Name and Code
  const handleSubjectNameChange = (val) => {
    const matched = subjectsList.find(
      (s) => s.name.toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        subject: matched.name,
        subjectCode: matched.code
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subject: val
      }));
    }
  };

  const handleSubjectCodeChange = (val) => {
    const codeUpper = val.trim().toUpperCase();
    const matched = subjectsList.find(
      (s) => s.code.toUpperCase() === codeUpper
    );
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        subjectCode: matched.code,
        subject: matched.name
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subjectCode: codeUpper
      }));
    }
  };

  const handleSubjectSelect = (subj) => {
    setFormData((prev) => ({
      ...prev,
      subject: subj.name,
      subjectCode: subj.code
    }));
  };

  // Check if entered subject and code match curriculum
  const isSubjectValid = subjectsList.some(
    (s) =>
      s.code.toUpperCase() === formData.subjectCode.trim().toUpperCase() &&
      s.name.toLowerCase() === formData.subject.trim().toLowerCase()
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step Nav validation
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.warning('Document Title is required.');
        return false;
      }
      if (!formData.branch) {
        toast.warning('Please select a Branch.');
        return false;
      }
      if (!formData.semester) {
        toast.warning('Please select a Semester.');
        return false;
      }
      if (!formData.subject.trim() || !formData.subjectCode.trim()) {
        toast.warning('Both Subject Name and Subject Code are required.');
        return false;
      }
      if (!isSubjectValid) {
        toast.error('Please select a valid curriculum subject. Unrecognized subjects cannot be uploaded.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
    const filename = selectedFile.name.toLowerCase();
    const isValid = allowedExtensions.some((ext) => filename.endsWith(ext));

    if (!isValid) {
      toast.error('Invalid file type! Allowed formats: PDF, PPT, PPTX, JPG, PNG.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please attach a document file before uploading.');
      return;
    }

    if (!isSubjectValid) {
      toast.error('Only valid curriculum subjects can be uploaded.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });
      submitData.append('file', file);

      const { data } = await api.post('/notes', submitData);

      // Celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#10b981', '#818cf8']
      });

      toast.success(data.message || 'Document uploaded and sent to admin for verification!');
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      console.error('Document upload error:', error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Upload failed';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8 bg-oxford-950 min-h-[calc(100vh-4rem)] relative flex flex-col justify-center">
      
      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white font-sans">
          Contribute Academic Material
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Share study notes or previous year question papers. Submissions are verified by admin before publication.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
        {[
          { id: 1, label: 'Document & Subject' },
          { id: 2, label: 'Metadata & Tags' },
          { id: 3, label: 'Attach & Submit' }
        ].map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  step === s.id
                    ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/20'
                    : step > s.id
                    ? 'bg-accent-emerald border-accent-emerald text-white'
                    : 'bg-oxford-900 border-slate-800 text-slate-500'
                }`}
              >
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  step === s.id
                    ? 'text-primary-light'
                    : step > s.id
                    ? 'text-accent-emerald'
                    : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < 2 && (
              <div
                className={`w-8 sm:w-16 h-0.5 rounded mx-3 -mt-4 transition-colors ${
                  step > s.id ? 'bg-accent-emerald' : 'bg-slate-800'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Wizard Panel */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 shadow-glass">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Resource Type, Title, and Subject Sync */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Step 1: Document Details & Subject</span>
                </div>

                {/* Document Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Select Section / Material Type <span className="text-accent-rose">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, resourceType: 'notes' })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        formData.resourceType === 'notes'
                          ? 'border-primary bg-primary/10 text-white ring-1 ring-primary/40'
                          : 'border-slate-800 bg-oxford-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.resourceType === 'notes' ? 'bg-primary text-white' : 'bg-oxford-850 text-slate-400'}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">Study Notes</div>
                        <div className="text-[11px] text-slate-400">Class notes, summaries, unit guides</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, resourceType: 'question_paper' })}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        formData.resourceType === 'question_paper'
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-oxford-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${formData.resourceType === 'question_paper' ? 'bg-amber-500 text-white' : 'bg-oxford-850 text-slate-400'}`}>
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">Question Paper (PYQ)</div>
                        <div className="text-[11px] text-slate-400">Previous year exam papers, mid-terms</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Document Title <span className="text-accent-rose">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder={formData.resourceType === 'question_paper' ? 'e.g. End-Term Dec 2024 Question Paper' : 'e.g. Unit 3 - File Systems Notes'}
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    required
                  />
                </div>

                {/* Branch and Semester (to filter subjects) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Academic Branch <span className="text-accent-rose">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    >
                      {branches.map((b) => (
                        <option key={b} value={b} className="bg-oxford-900">{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Semester <span className="text-accent-rose">*</span>
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    >
                      {semesters.map((s) => (
                        <option key={s} value={s} className="bg-oxford-900">Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Two-Way Auto-Fill Subject Code & Subject Name */}
                <div className="p-4 rounded-xl bg-oxford-950/60 border border-slate-850 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Curriculum Subject & Code
                    </span>
                    {isSubjectValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-emerald">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validated Curriculum Code
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Select from list
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subject Code with Datalist */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Subject Code <span className="text-accent-rose">*</span>
                      </label>
                      <input
                        type="text"
                        name="subjectCode"
                        list="subject-codes-list"
                        placeholder="e.g. CS302"
                        value={formData.subjectCode}
                        onChange={(e) => handleSubjectCodeChange(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl glass-input font-mono uppercase text-sm ${
                          formData.subjectCode && !isSubjectValid
                            ? 'border-amber-500/50 focus:border-amber-500'
                            : isSubjectValid
                            ? 'border-accent-emerald/60 focus:border-accent-emerald'
                            : ''
                        }`}
                        required
                      />
                      <datalist id="subject-codes-list">
                        {suggestedSubjects.map((s) => (
                          <option key={s._id} value={s.code}>
                            {s.name} ({s.branch} - Sem {s.semester})
                          </option>
                        ))}
                      </datalist>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Typing code automatically fills the subject name.
                      </p>
                    </div>

                    {/* Subject Name with Datalist */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Subject Name <span className="text-accent-rose">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        list="subject-names-list"
                        placeholder="e.g. Operating Systems"
                        value={formData.subject}
                        onChange={(e) => handleSubjectNameChange(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl glass-input text-sm ${
                          formData.subject && !isSubjectValid
                            ? 'border-amber-500/50 focus:border-amber-500'
                            : isSubjectValid
                            ? 'border-accent-emerald/60 focus:border-accent-emerald'
                            : ''
                        }`}
                        required
                      />
                      <datalist id="subject-names-list">
                        {suggestedSubjects.map((s) => (
                          <option key={s._id} value={s.name}>
                            {s.code} ({s.branch} - Sem {s.semester})
                          </option>
                        ))}
                      </datalist>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Selecting subject name automatically fills the code.
                      </p>
                    </div>
                  </div>

                  {/* Suggested Quick Buttons for Current Branch & Semester */}
                  {suggestedSubjects.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/50">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Recognized Subjects for {formData.branch} (Sem {formData.semester}):
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {suggestedSubjects.map((s) => (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => handleSubjectSelect(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              formData.subjectCode === s.code
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-oxford-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-mono font-bold mr-1">{s.code}</span>
                            <span>{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isSubjectValid && (formData.subject || formData.subjectCode) && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      <span>
                        Subject must match the registered curriculum codes above to ensure notes consistency.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-sm font-semibold transition-all"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Description & Tags (Instructor field removed per requirement) */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Step 2: Syllabus Coverage & Tags</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Unit / Module Coverage (Optional)
                  </label>
                  <input
                    type="text"
                    name="unit"
                    placeholder="e.g. Unit 3, Full Syllabus, Mid-Sem"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description / Key Topics
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Provide brief details on the topics covered, year of paper, or study instructions..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tags className="w-3.5 h-3.5 text-slate-500" /> Search Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g. pyq, mid-sem-2024, operating-systems, cpu-scheduling"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-oxford-850 border border-slate-700/30 text-slate-400 hover:text-slate-200 px-4 text-sm font-semibold transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-sm font-semibold transition-all"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: File Upload & Admin Verification Info */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Step 3: Attach & Submit for Verification</span>
                </div>

                {/* Drag and Drop Container */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-accent-emerald/40 bg-accent-emerald/5'
                      : 'border-slate-800 hover:border-slate-750 hover:bg-oxford-900/40'
                  }`}
                >
                  <input
                    type="file"
                    id="note-file-upload"
                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <label htmlFor="note-file-upload" className="cursor-pointer block space-y-4">
                    {file ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mx-auto">
                          <CheckCircle2 className="w-6 h-6 animate-bounce" />
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-oxford-850 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                          <FileUp className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-slate-300">Drag & drop your document here</p>
                        <p className="text-xs text-slate-500">or click to browse from files</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase">
                          Allowed: PDF, PPT, PPTX, JPG, PNG (Max 25MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Review Form Fields summary */}
                <div className="p-4 bg-oxford-950/40 border border-slate-850 rounded-xl space-y-2 text-xs">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Review Details</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material Type:</span> 
                    <span className="text-slate-300 font-semibold uppercase">
                      {formData.resourceType === 'question_paper' ? '📝 Question Paper (PYQ)' : '📚 Study Notes'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Title:</span> 
                    <span className="text-slate-300 font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subject:</span> 
                    <span className="text-slate-300 font-medium font-mono">
                      [{formData.subjectCode}] {formData.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Structure:</span> 
                    <span className="text-slate-300 font-medium">{formData.branch} • Semester {formData.semester}</span>
                  </div>
                </div>

                {/* Admin Verification Notice */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-primary-light">Quality Verification Process:</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Your upload will be queued for review in the Admin Verification portal. Once verified, it will be published to the platform and you will receive +10 contributor credits.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-oxford-850 border border-slate-700/30 text-slate-400 hover:text-slate-200 px-4 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !file || !isSubjectValid}
                    className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-6 text-sm font-bold shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting to Admin...' : 'Submit for Verification'}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>

    </div>
  );
};

export default Upload;
