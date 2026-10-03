import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles, UserCheck, X, ArrowLeft } from 'lucide-react';

interface LoginViewProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onGoToRegister,
  onGoToForgotPassword,
  onSuccess,
  onClose,
}) => {
  const { login, demoLoginStudent, demoLoginAdmin, error, clearError } = useAuth();

  const handleBack = () => {
    onClose();
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentDemo = async () => {
    setLoading(true);
    try {
      await demoLoginStudent();
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    setLoading(true);
    try {
      await demoLoginAdmin();
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Top Navigation Bar with Back and X Close buttons */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] px-3 py-2 -ml-2 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            title="Go back to landing page"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            title="Close and return to landing page"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sign In to UniVault
          </h1>
          <p className="text-xs text-slate-400">
            Access your secure student credential locker
          </p>
        </div>

        {/* Quick 1-Click Demo Evaluation */}
        <div className="p-3 bg-blue-950/30 border border-blue-800/50 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-blue-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              1-Click Demo Logins
            </span>
            <span className="text-[10px] text-blue-400 font-mono">Instant Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleStudentDemo}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student (Sarah)</span>
            </button>
            <button
              type="button"
              onClick={handleAdminDemo}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Admin (Marcus)</span>
            </button>
          </div>
        </div>

        {/* Error notice */}
        {(localError || error) && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.chen@stanford.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-medium">Password</label>
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-blue-400 hover:text-blue-300 text-[11px]"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition-colors disabled:opacity-50 text-xs mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div>
            <span>Don't have an account yet? </span>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Register Student Profile
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors"
            >
              Cancel and return to home page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
