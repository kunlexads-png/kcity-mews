import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  MailCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, resendVerificationEmail } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    try {
      await resendVerificationEmail(user.email);
    } finally {
      setResending(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Shoes', path: '/shop?category=Shoes' },
    { label: 'T-Shirts', path: '/shop?category=T-Shirts' },
    { label: 'New Arrivals', path: '/shop?sort=newest' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname + location.search === path) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      {/* Email Verification Alert Banner for logged-in unverified accounts */}
      {isAuthenticated && user && !user.email_verified && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Action Required:</strong> Please verify your email ({user.email}) to unlock full account features.
              </span>
            </div>
            <button
              onClick={handleResend}
              disabled={resending}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <MailCheck className="w-3 h-3" />
              {resending ? 'Sending...' : 'Resend Email'}
            </button>
          </div>
        </div>
      )}

      {/* Top micro banner */}
      <div className="bg-slate-950 dark:bg-black text-slate-300 dark:text-slate-400 text-[11px] font-medium tracking-widest uppercase py-1.5 px-4 text-center border-b border-slate-900">
        <span>Complimentary Express Delivery within Nigeria on orders over ₦100,000 • Pay with Paystack</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter text-slate-950 dark:text-white uppercase">
                KCity Mews
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] text-slate-500 dark:text-amber-400 -mt-1 uppercase">
                Step In. Stand Out.
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors uppercase ${
                  isActive(link.path)
                    ? 'text-slate-950 dark:text-white font-bold border-b-2 border-slate-950 dark:border-white py-1'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white py-1'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in scale-in-50">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Shopping Cart"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-slate-950 dark:bg-amber-400 text-white dark:text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / Admin Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <Link
                  to="/account"
                  className="flex items-center gap-1.5 p-2 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white font-semibold text-xs tracking-wide rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline-block max-w-[90px] truncate">
                    {user?.full_name?.split(' ')[0]}
                  </span>
                </Link>

                {/* Dropdown */}
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-2 hidden group-hover:block transition-all z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/account"
                    className="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    My Profile & Orders
                  </Link>

                  <Link
                    to="/account?tab=wishlist"
                    className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>My Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] px-1.5 rounded-full font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Search Expansion Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sneakers, t-shirts, colors (e.g. Black Shoes, White Tee, Urban Runner)..."
                autoFocus
                className="w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-950 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-lg text-xs font-semibold uppercase tracking-wider"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] z-50 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Search input in mobile menu */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Appearance</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-base font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border-b border-slate-100 dark:border-slate-800"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/account?tab=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 text-base font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border-b border-slate-100 dark:border-slate-800"
              >
                <span>My Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    My Account ({user?.email})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-sm font-semibold text-rose-600 dark:text-rose-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-sm uppercase tracking-wider"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm uppercase tracking-wider"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
