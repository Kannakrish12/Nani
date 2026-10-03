import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound, X } from 'lucide-react';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onClose: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleBackToLanding = () => {
    onClose();
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.resetPassword({ email, newPassword, confirmPassword });
      setMessage(res.message);
      setResetSuccess(true);
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <button
            type="button"
            onClick={handleBackToLanding}
            className="min-h-[44px] px-3 py-2 -ml-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            title="Go back to landing page"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            type="button"
            onClick={handleBackToLanding}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            title="Close and return to landing page"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400 mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {step === 'request' ? 'Password Recovery' : 'Reset Credentials'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'request'
              ? 'Enter your student email to receive recovery instructions'
              : 'Enter verification code and choose a new password'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-blue-950/40 border border-blue-800 text-blue-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Academic Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Recovery Instructions</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Verification Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 849201"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || resetSuccess}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div>
            <span>Remembered your credentials? </span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign In here
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={handleBackToLanding}
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
