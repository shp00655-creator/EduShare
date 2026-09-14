import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { ShieldAlert, Mail, Lock, BookMarked, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.email.toLowerCase().startsWith('admin@') || user.email.toLowerCase() === 'pawan@gmail.com';
      if (isAdmin) {
        navigate('/admin');
      }
    }
  }, [user, navigate]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter administrative credentials.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      const isAdmin = data.role === 'admin' || data.email.toLowerCase().startsWith('admin@') || data.email.toLowerCase() === 'pawan@gmail.com';

      if (!isAdmin) {
        toast.error('Access Denied: Standard student accounts cannot use this portal.');
        setSubmitting(false);
        return;
      }

      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success(`Welcome to Admin Terminal, ${data.name}!`);
      navigate('/admin');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Authentication failed.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden bg-oxford-950">
      {/* Grid Overlay for Terminal Feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Background Neon Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-purple/10 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10 space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose mb-4 shadow-lg shadow-accent-rose/5">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-sans uppercase">
            Admin Portal
          </h2>
          <p className="text-slate-450 text-xs mt-1.5 max-w-xs mx-auto">
            Authorized administrative personnel only. System access is monitored.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-805/50 shadow-glass">
          <form onSubmit={handleAdminSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                Admin Identifier / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-oxford-950 border border-slate-850 text-slate-200 text-sm focus:border-accent-rose focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-oxford-950 border border-slate-850 text-slate-200 text-sm focus:border-accent-rose focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-accent-rose hover:bg-accent-rose/90 active:bg-accent-rose text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-accent-rose/25 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
            >
              {submitting ? 'Verifying Credentials...' : 'Access Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center">
          <button 
            type="button" 
            onClick={() => navigate('/auth')}
            className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-widest font-mono font-bold"
          >
            ← Switch to Student Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
