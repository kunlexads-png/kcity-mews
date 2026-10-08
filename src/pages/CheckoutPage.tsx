import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { api } from '../services/api.ts';
import { PaystackPaymentModal } from '../components/paystack/PaystackPaymentModal.tsx';

export function CheckoutPage() {
  const { cart, subtotal, deliveryFee, clearCart } = useCart();
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [country] = useState('Nigeria');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);

  // Sync if user loads later
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.full_name);
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  if (cart.length === 0 && !pendingOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your bag is empty</h2>
        <p className="text-slate-500">Add some shoes or t-shirts before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 100000;
  const appliedDeliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
  const totalAmount = subtotal + appliedDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !shippingAddress) {
      error('Please complete all required delivery details.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on the backend
      const orderPayload = {
        fullName,
        email,
        phone,
        shippingAddress,
        city,
        state,
        country,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          imageUrl: i.imageUrl,
        })),
      };

      const res = await api.post<{
        success: boolean;
        order: any;
        paymentReference: string;
        totalAmount: number;
      }>('/orders', orderPayload);

      if (res.success && res.order) {
        setPendingOrder(res.order);

        // 2. Initialize Paystack transaction on the backend
        await api.post('/payments/initialize', {
          reference: res.paymentReference,
          orderId: res.order.id,
          email,
        });

        // 3. Open Paystack payment modal
        setIsPaystackOpen(true);
      } else {
        throw new Error('Order creation was not acknowledged.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to initiate order. Please check stock or details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (verifiedOrder: any) => {
    setIsPaystackOpen(false);
    clearCart();
    navigate('/payment-success', {
      state: { order: verifiedOrder },
      replace: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-2">
        <Link to="/cart" className="text-slate-500 hover:text-black transition-colors p-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
          Secure Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Contact info card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-100 pb-3">
                1. Customer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Demilade Adeleke"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-100 pb-3">
                2. Delivery Destination
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery Street Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apartment number, street name, landmark"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki / Ikeja"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Lagos State"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value={country}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 border-b border-slate-100 pb-3">
                3. Payment Method
              </h2>

              <div className="p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider">
                      Pay with Paystack
                    </h4>
                    <p className="text-xs text-slate-600">
                      Cards (Mastercard, Visa, Verve), Bank Transfer & USSD
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                  NGN
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing Paystack Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₦{totalAmount.toLocaleString()} with Paystack</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Items Preview Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28">
            <h2 className="text-base font-black font-display uppercase tracking-tight text-slate-950">
              Your Order ({cart.length} items)
            </h2>

            <div className="divide-y divide-slate-200 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="py-3 flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ₦{Number(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee (Nigeria)</span>
                <span className="font-semibold text-slate-900">
                  {appliedDeliveryFee === 0 ? 'FREE' : `₦${appliedDeliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Buyer Protection Guarantee</span>
              </div>
              <p>Your payment will only be released after successful Paystack authorization.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Payment Modal */}
      {pendingOrder && (
        <PaystackPaymentModal
          isOpen={isPaystackOpen}
          onClose={() => setIsPaystackOpen(false)}
          orderNumber={pendingOrder.order_number}
          reference={pendingOrder.payment_reference}
          amount={totalAmount}
          customerEmail={email}
          customerName={fullName}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
