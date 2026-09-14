import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resolveFileUrl } from '../utils/url';
import { 
  BookOpen, 
  UploadCloud, 
  Trophy, 
  LayoutDashboard, 
  User, 
  LogOut, 
  BookMarked,
  Award,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const isAdmin = user && (user.role === 'admin' || user.email.toLowerCase().startsWith('admin'));

  const navItems = [
    { to: '/explore', label: 'Explore', icon: BookOpen },
    { to: '/upload', label: 'Upload', icon: UploadCloud, protected: true },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: Shield, protected: true });
  }

  if (!user) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-oxford-700/30 bg-oxford-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white font-sans">
            <BookMarked className="h-6 w-6 text-primary animate-float" />
            <span>EduShare<span className="text-primary">.</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/explore" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Browse Notes
            </Link>
            <Link 
              to="/auth" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 hidden md:block w-full border-b border-oxford-700/30 bg-oxford-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <BookMarked className="h-6 w-6 text-primary" />
            <span>EduShare<span className="text-primary">.</span></span>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-sm font-medium transition-colors py-1 border-b-2 ${
                    isActive 
                      ? 'text-primary border-primary' 
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-4">
            {/* Credit count badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-oxford-800/80 border border-slate-700/30 text-amber-400 text-xs font-semibold">
              <Award className="w-4 h-4" />
              <span>{user.credits} Credits</span>
            </div>

            {/* Profile Avatar */}
            <Link 
              to="/profile" 
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
            >
              {user.profilePicture ? (
                <img 
                  src={resolveFileUrl(user.profilePicture)} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-slate-700 group-hover:border-primary transition-colors object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-oxford-700 flex items-center justify-center font-bold text-xs text-white border border-slate-600 group-hover:border-primary transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium hidden lg:inline">{user.name.split(' ')[0]}</span>
            </Link>

            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-oxford-800 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 md:hidden w-full border-b border-oxford-700/30 bg-oxford-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 font-bold text-base text-white">
          <BookMarked className="h-5 w-5 text-primary" />
          <span>EduShare</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-oxford-800 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-oxford-950/95 border-t border-oxford-700/40 backdrop-blur-lg px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5.5 h-5.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {user.profilePicture ? (
              <img 
                src={resolveFileUrl(user.profilePicture)} 
                alt={user.name} 
                className="w-5.5 h-5.5 rounded-full border border-slate-700 object-cover"
              />
            ) : (
              <User className="w-5.5 h-5.5" />
            )}
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
