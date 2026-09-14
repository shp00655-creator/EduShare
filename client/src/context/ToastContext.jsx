import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let bgClass = 'bg-oxford-800 border-slate-700/50';
            let iconColor = 'text-primary';
            let Icon = Info;

            if (t.type === 'success') {
              bgClass = 'bg-oxford-900 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
              iconColor = 'text-accent-emerald';
              Icon = CheckCircle;
            } else if (t.type === 'error') {
              bgClass = 'bg-oxford-900 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
              iconColor = 'text-accent-rose';
              Icon = ShieldAlert;
            } else if (t.type === 'warning') {
              bgClass = 'bg-oxford-900 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
              iconColor = 'text-amber-400';
              Icon = AlertTriangle;
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md glass-card ${bgClass}`}
              >
                <div className={`mt-0.5 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-sm font-medium text-slate-200 pr-2">
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-oxford-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
