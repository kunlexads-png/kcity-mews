import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string; devResetToken?: string }>(
        '/auth/forgot-password',
        { email }
      );
      setSubmitted(true);
      if (res.devResetToken) {
        setDevResetToken(res.devResetToken);
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <Link to="/" className="inline-block">
          <span className="font-display text-3xl font-black uppercase tracking-tight text-slate-950">
            KCity Mews
          </span>
          <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase -mt-1">
            Step In. Stand Out.
          </p>
        </Link>
        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 pt-2">
          Forgot Password
        </h1>
        <p className="text-xs text-slate-500">
          Enter your registered email and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
            <p className="text-xs text-slate-600">
              If an account with <strong>{email}</strong> exists, we've sent password reset instructions.
            </p>

            {devResetToken && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-left space-y-2 mt-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dev Reset Shortcut</span>
                </div>
                <p className="text-slate-300">Reset your password directly in development:</p>
                <Link
                  to={`/reset-password?token=${devResetToken}`}
                  className="block text-center py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg uppercase tracking-wider text-[11px]"
                >
                  Open Password Reset Page
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-900 font-bold underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-500">
              <Link to="/login" className="hover:underline text-slate-800 font-medium">
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
