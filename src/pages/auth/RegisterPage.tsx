import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Loader2, CheckCircle, MailCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const { register } = useAuth();
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      error('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      });

      setRegisteredSuccess(true);
      if (res.devVerificationToken) {
        setDevToken(res.devVerificationToken);
      }
    } catch {
      // Handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-in fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <MailCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Check Your Email
          </h1>
          <p className="text-sm text-slate-600">
            We sent a verification link to <strong>{email}</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-xs text-slate-600">
          <p className="leading-relaxed">
            Please click the button inside the email to verify your email address and activate your KCity Mews account.
          </p>

          {devToken && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-widest text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Dev Preview Simulator</span>
              </div>
              <p className="text-slate-300 text-xs">
                Since you are developing locally, you can click the button below to verify your email instantly:
              </p>
              <Link
                to={`/verify-email?token=${devToken}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Email Now (1-Click)</span>
              </Link>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full py-3 text-center border border-slate-300 rounded-xl font-bold uppercase text-slate-800 tracking-wider hover:bg-slate-50 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
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
        <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900 pt-2">
          Create an Account
        </h1>
        <p className="text-xs text-slate-500">
          Join the community for order tracking, size advice, and member-only sneaker drops.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Demilade Adeleke"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@kcitymews.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password (Min 6 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Send Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-slate-950 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
