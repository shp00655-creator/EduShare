import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Hash, GraduationCap, Upload, BookMarked } from 'lucide-react';

const Auth = () => {
  const { login, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Signup State
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    branch: 'Computer Science',
    semester: '1'
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.warning('Please fill in all credentials.');
      return;
    }

    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back to EduShare!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupForm;
    if (!name || !email || !password) {
      toast.warning('Please fill in name, email, and password.');
      return;
    }

    // Verify email ends with @college.edu or is a valid email
    // Requirement says "College Email", let's check or just proceed. We will validate generic email syntax.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    
    // Create FormData for file upload support
    const formData = new FormData();
    Object.keys(signupForm).forEach(key => {
      formData.append(key, signupForm[key]);
    });
    
    if (profilePic) {
      formData.append('profilePicture', profilePic);
    }

    const result = await signup(formData);
    setSubmitting(false);

    if (result.success) {
      toast.success('Account created successfully! Welcome!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden py-10 bg-oxford-950">
      
      {/* Background Accent Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
            <BookMarked className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Welcome to EduShare
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            The collaborative hub for academic notes and resources.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex p-1 rounded-xl bg-oxford-900 border border-slate-800/80 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Auth Forms */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 shadow-glass">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    College Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@college.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-semibold text-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit}
                className="space-y-4"
              >
                {/* Profile Pic Upload */}
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="relative group">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Avatar Preview" 
                        className="w-16 h-16 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-oxford-850 flex items-center justify-center border border-slate-850 text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload className="w-4.5 h-4.5 text-white" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Profile Photo</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Alex Mercer"
                      value={signupForm.name}
                      onChange={handleSignupChange}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    College Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      placeholder="alex.mercer@college.edu"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Roll Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        name="rollNumber"
                        placeholder="CS2312"
                        value={signupForm.rollNumber}
                        onChange={handleSignupChange}
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Semester
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                      <select
                        name="semester"
                        value={signupForm.semester}
                        onChange={handleSignupChange}
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm appearance-none"
                      >
                        {semesters.map(sem => (
                          <option key={sem} value={sem} className="bg-oxford-900">Sem {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={signupForm.branch}
                    onChange={handleSignupChange}
                    disabled={submitting}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch} className="bg-oxford-900">{branch}</option>
                    ))}
                  </select>
                </div>



                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-focus text-white font-semibold text-sm shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Login Link */}
        <div className="text-center mt-6">
          <Link 
            to="/admin-login" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-wider font-mono font-bold"
          >
            Looking for Admin Console? Access here →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
