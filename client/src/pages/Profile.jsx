import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Lock, GraduationCap, Upload, ShieldCheck } from 'lucide-react';
import { resolveFileUrl } from '../utils/url';
import api from '../utils/api';

const Profile = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const toast = useToast();

  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Profile Details State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    branch: user?.branch || 'Computer Science',
    semester: user?.semester || '1'
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePicture ? resolveFileUrl(user.profilePicture) : null
  );

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.warning('Name cannot be empty.');
      return;
    }

    setSubmittingProfile(true);

    const formData = new FormData();
    Object.keys(profileForm).forEach(key => {
      formData.append(key, profileForm[key]);
    });

    if (profilePic) {
      formData.append('profilePicture', profilePic);
    }

    const result = await updateProfile(formData);
    setSubmittingProfile(false);

    if (result.success) {
      toast.success('Profile details updated successfully.');
    } else {
      toast.error(result.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters.');
      return;
    }

    setSubmittingPassword(true);
    const result = await changePassword(oldPassword, newPassword);
    setSubmittingPassword(false);

    if (result.success) {
      toast.success('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8 bg-oxford-950 min-h-[calc(100vh-4rem)] relative space-y-8">
      
      {/* Background accents */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div>
        <h1 className="text-3xl font-extrabold text-white font-sans">
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal details, profile picture, and login credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar and Account Summary Card */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <div className="glass-panel p-6 rounded-2xl border border-slate-805/50 w-full text-center space-y-4">
            
            <div className="relative group w-24 h-24 mx-auto">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-full border border-slate-700 object-cover shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-oxford-800 border border-slate-800 flex items-center justify-center font-black text-3xl text-slate-350 uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
              
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="w-5 h-5 text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-200">{user.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{user.email}</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-around text-xs">
              <div>
                <span className="block text-slate-500 font-semibold uppercase text-[10px]">Credits</span>
                <span className="text-amber-400 font-extrabold text-lg mt-1 block">{user.credits}</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <span className="block text-slate-500 font-semibold uppercase text-[10px]">Role</span>
                <span className="text-primary-light font-extrabold text-xs mt-1 block uppercase tracking-wider">{user.role || 'user'}</span>
              </div>
            </div>



          </div>
        </div>

        {/* Right Side: Update details forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Details Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-805/50 shadow-glass">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Profile details
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  disabled={submittingProfile}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Roll Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-550" />
                    <input
                      type="text"
                      name="rollNumber"
                      value={profileForm.rollNumber}
                      onChange={handleProfileChange}
                      disabled={submittingProfile}
                      className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Semester
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-550" />
                    <select
                      name="semester"
                      value={profileForm.semester}
                      onChange={handleProfileChange}
                      disabled={submittingProfile}
                      className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-sm appearance-none"
                    >
                      {semesters.map(s => (
                        <option key={s} value={s} className="bg-oxford-900">Sem {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Academic Branch
                </label>
                <select
                  name="branch"
                  value={profileForm.branch}
                  onChange={handleProfileChange}
                  disabled={submittingProfile}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                >
                  {branches.map(b => (
                    <option key={b} value={b} className="bg-oxford-900">{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover text-white px-5 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submittingProfile ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>

          {/* Password Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 shadow-glass">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={submittingPassword}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={submittingPassword}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submittingPassword}
                    className="w-full px-4 py-2 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="inline-flex h-10 items-center gap-1.5 justify-center rounded-xl bg-oxford-850 hover:bg-oxford-800 text-slate-300 hover:text-white border border-slate-700/30 px-5 text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" /> Change Password
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
