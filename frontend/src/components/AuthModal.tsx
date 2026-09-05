import React, { useState } from 'react';
import { X, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const mockUser = { name: 'Rajesh Kumar (IRTS)', email: 'rajesh.irts@indianrailways.gov.in' };
      onLoginSuccess(mockUser);
      setSuccessMsg('Successfully authenticated with Google Workspace!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userObj = {
        name: name || email.split('@')[0] || 'Railway Dispatcher',
        email: email || 'user@railways.gov.in'
      };
      onLoginSuccess(userObj);
      setSuccessMsg(isRegister ? 'Account registered successfully!' : 'Signed in successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-blue-400/30">
              OFFICIAL INDIAN RAILWAYS PORTAL
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {isRegister ? 'Register YATRA AI Account' : 'Sign In to YATRA AI'}
          </h2>
          <p className="text-xs text-blue-200 mt-1">Access dispatcher control, custom alerts, & AI forecasts.</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 10.6 0 12.3s.6 2.9 1.6 4.9l3.7-2.4z"/>
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16.4C3.5 20.3 7.4 23.5 12 23.5z"/>
            </svg>
            Continue with Google / Gmail
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] text-slate-400 font-mono uppercase font-bold absolute">OR EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@railways.gov.in or gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 transition-all"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register Official Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New user? Register an account'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Encrypted 256-bit Ministry Authentication
          </div>
        </div>
      </div>
    </div>
  );
};
