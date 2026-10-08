import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { verifyEmailToken, resendVerificationEmail } = useAuth();

  const [loading, setLoading] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setErrorMessage('No verification token provided. Please click the link inside your confirmation email.');
        setLoading(false);
        return;
      }

      try {
        await verifyEmailToken(token);
        setSuccess(true);
      } catch (err: any) {
        setErrorMessage(err.message || 'Verification token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      const devTok = await resendVerificationEmail(resendEmail);
      setResendSuccessMsg(
        devTok
          ? `Verification email resent! (Dev shortcut token: ${devTok})`
          : 'A fresh verification email has been sent. Please check your inbox.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-slate-900 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Verifying Email Address...</h1>
        <p className="text-xs text-slate-500">Checking your authentication token with KCity Mews servers.</p>
      </div>
    );
  }

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
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
        {success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black font-display text-slate-950 uppercase tracking-tight">
                Email Verified Successfully
              </h2>
              <p className="text-sm text-slate-600">
                Your KCity Mews account is now active.
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2">
              You can now browse products, save to your wishlist, and check out seamlessly using Paystack.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/shop"
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Start Shopping Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/account"
                className="w-full py-3 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50"
              >
                Go to My Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black font-display text-slate-950 uppercase tracking-tight">
                Verification Failed
              </h2>
              <p className="text-xs text-rose-600 font-medium">
                {errorMessage || 'This token could not be verified.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
              <p className="text-xs text-slate-700 font-bold uppercase">
                Request a New Verification Link:
              </p>

              {resendSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
                  {resendSuccessMsg}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Email'}
                </button>
              </form>
            </div>

            <div className="pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
