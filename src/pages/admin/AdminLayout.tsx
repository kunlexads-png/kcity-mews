import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Warehouse,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export function AdminLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Guard check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black font-display text-slate-900 uppercase">
          Admin Access Required
        </h1>
        <p className="text-xs text-slate-500">
          This section is restricted to KCity Mews store administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/login', { state: { from: location } })}
            className="px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Sign in as Admin
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row">
      {/* Mobile Top Header for Admin */}
      <div className="lg:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-display font-black text-sm uppercase tracking-tight text-white">
            KCity Mews Admin
          </span>
        </div>
        <Link to="/" className="text-xs text-slate-300 hover:text-white flex items-center gap-1">
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-5 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="border-b border-slate-800/80 pb-4">
            <Link to="/" className="block">
              <span className="font-display text-xl font-black text-white uppercase tracking-tight">
                KCity Mews
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-white text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Storefront</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
