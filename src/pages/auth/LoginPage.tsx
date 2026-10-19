
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

type AccountRole = 'admin' | 'customer';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] =
    useState<AccountRole>('customer');

  const { login, logout } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = await login(email.trim(), password);

      // Verify that the account matches the selected account type.
      if (loggedInUser.role !== selectedRole) {
        logout();

        error(
          `These credentials do not belong to the selected ${
            selectedRole === 'admin' ? 'Admin' : 'Customer'
          } account. Please select the correct account type.`
        );

        return;
      }

      // Send each account to the appropriate page.
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from.startsWith('/admin') ? '/account' : from, {
          replace: true,
        });
      }
    } catch {
      // Login errors are displayed by AuthContext.
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectRole = (role: AccountRole) => {
    setSelectedRole(role);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8 animate-in fade-in duration-300">
      {/* Brand Header */}
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
          Sign In to Your Account
        </h1>

        <p className="text-xs text-slate-500">
          Access your orders, saved sizes, wishlist, and exclusive drops.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Account Type Selection */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase text-slate-500 text-center tracking-wider">
            Select Account Type
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={selectedRole === 'admin'}
              onClick={() => selectRole('admin')}
              className={`min-h-12 py-3 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                selectedRole === 'admin'
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              aria-pressed={selectedRole === 'customer'}
              onClick={() => selectRole('customer')}
              className={`min-h-12 py-3 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 ${
                selectedRole === 'customer'
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Customer</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center" aria-live="polite">
            Selected account: {selectedRole === 'admin' ? 'Admin' : 'Customer'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Email Address
            </label>

            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />

              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-slate-500 hover:text-slate-950 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
              />

              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
              />

              <span>Remember me</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-12 py-3.5 bg-slate-950 hover:bg-slate-800 active:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>
                  Sign In as {selectedRole === 'admin' ? 'Admin' : 'Customer'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Registration */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Don't have an account yet? </span>

          <Link
            to="/register"
            className="font-bold text-slate-950 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
