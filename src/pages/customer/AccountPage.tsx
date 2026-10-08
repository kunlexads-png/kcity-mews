import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  KeyRound,
  LogOut,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Loader2,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';
import { Order, Product } from '../../types/index.ts';

export function AccountPage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { wishlist, wishlistProducts, toggleWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/account' } } });
      return;
    }

    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
    }

    // Fetch customer orders
    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const res = await api.get<{ success: boolean; orders: Order[] }>('/orders/my-orders');
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: fullName, phone });
    } catch {
      // Handled in auth context
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await api.put<{ success: boolean; message: string }>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      success(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'Processing':
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Customer Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome, <strong>{user?.full_name}</strong> ({user?.email})
            {user?.email_verified ? (
              <span className="ml-2 text-emerald-600 font-bold">• Verified Customer</span>
            ) : (
              <span className="ml-2 text-amber-600 font-bold">• Email Unverified</span>
            )}
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar Tabs */}
        <aside className="lg:col-span-3 space-y-1">
          {[
            { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
            { id: 'profile', label: 'Profile Details', icon: User },
            { id: 'wishlist', label: 'My Wishlist', icon: Heart, badge: wishlist.length },
            { id: 'password', label: 'Change Password', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="lg:col-span-9 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950">
                Order History
              </h2>

              {loadingOrders ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-xs text-slate-400">Your completed purchases will show here.</p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Order</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">{ord.order_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Date</span>
                          <span className="text-slate-600 flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Status</span>
                          {getStatusBadge(ord.order_status)}
                        </div>
                        <div className="sm:text-right">
                          <span className="text-slate-400 font-bold uppercase text-[10px] block">Total</span>
                          <span className="font-display font-black text-slate-950 text-base">
                            ₦{Number(ord.total_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Preview items */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          {ord.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                              {item.image_url && (
                                <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-white" />
                              )}
                              <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">
                                {item.product_name} ({item.quantity}x)
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950">
                Customer Profile
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {savingProfile ? 'Updating Profile...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950">
                Saved Items ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Your wishlist is empty</p>
                  <p className="text-xs text-slate-400">Save items while browsing to purchase later.</p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((prod) => (
                    <div key={prod.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3">
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden relative">
                        <img src={prod.image_url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-rose-600 shadow-sm"
                        >
                          <Heart className="w-4 h-4 fill-rose-600" />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{prod.name}</h4>
                        <p className="text-xs font-display font-black text-slate-950 mt-0.5">
                          ₦{Number(prod.price).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const sizes = prod.size.split(',').map((s) => s.trim());
                          addToCart({
                            productId: prod.id,
                            name: prod.name,
                            price: Number(prod.price),
                            size: sizes[0] || 'Standard',
                            color: prod.color,
                            imageUrl: prod.image_url,
                            maxStock: prod.stock_quantity,
                          });
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950">
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    New Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {savingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black font-display text-slate-950 uppercase">
                  Order Details
                </h3>
                <p className="text-xs font-mono text-slate-500">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-bold uppercase text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Payment Status</span>
                  <span className="font-bold text-slate-800">{selectedOrder.payment_status}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Order Status</span>
                  {getStatusBadge(selectedOrder.order_status)}
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Paystack Reference</span>
                  <span className="font-mono text-slate-700 truncate block">{selectedOrder.payment_reference}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Order Date</span>
                  <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Items Breakdown
                </h4>
                <div className="divide-y divide-slate-100 border rounded-xl p-3 bg-white">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-slate-500">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₦{Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-slate-950 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span>₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Shipping Address
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedOrder.shipping_address}, {selectedOrder.city || ''}, {selectedOrder.state || ''} ({selectedOrder.country || 'Nigeria'})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
