import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, MapPin, Mail, Calendar, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';

export function PaymentSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const refFromQuery = searchParams.get('reference');

  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [loading, setLoading] = useState(!order && Boolean(refFromQuery));

  useEffect(() => {
    async function verifyAndFetch() {
      if (!order && refFromQuery) {
        try {
          const res = await api.get<{ success: boolean; order: any }>(`/payments/verify/${encodeURIComponent(refFromQuery)}`);
          if (res.success && res.order) {
            setOrder(res.order);
          }
        } catch (err) {
          console.error('Failed to verify redirected payment:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    verifyAndFetch();
  }, [refFromQuery, order]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Verifying Paystack Payment...</h2>
        <p className="text-xs text-slate-500">Please do not refresh the page while we confirm your transaction.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Information</h2>
        <p className="text-sm text-slate-500">No active order details to display. You can view all past purchases in your account.</p>
        <div className="pt-2 flex justify-center gap-4">
          <Link to="/shop" className="px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase">
            Browse Shop
          </Link>
          <Link to="/account" className="px-6 py-3 border border-slate-300 rounded-xl text-xs font-bold uppercase">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-500">
      {/* Success banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 uppercase tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Thank you for shopping with KCity Mews. Your order has been placed and payment confirmed through Paystack.
        </p>
      </div>

      {/* Confirmation Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Meta summary grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Order Number</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{order.order_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Reference</span>
            <span className="font-semibold text-slate-800 font-mono text-xs truncate block">{order.payment_reference}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {new Date(order.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase font-bold text-[10px]">Total Paid</span>
            <span className="font-black text-slate-950 font-display text-base">₦{Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Email receipt notification */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs text-emerald-950">
          <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            A formal receipt and order confirmation has been dispatched to <strong>{order.customer_email}</strong>.
          </span>
        </div>

        {/* Items purchased */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-slate-700" />
            <span>Items Purchased ({items.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 text-xs">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-white border" />
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{item.product_name}</p>
                    <p className="text-slate-500">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ₦{Number(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-700" />
            <span>Delivery Destination</span>
          </h3>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">{order.customer_name} ({order.phone})</p>
            <p>{order.shipping_address}</p>
            <p>{order.city ? `${order.city}, ` : ''}{order.state || ''} - {order.country || 'Nigeria'}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest text-center transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          to="/account"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 font-extrabold text-xs uppercase tracking-widest text-center transition-colors flex items-center justify-center gap-2"
        >
          <span>View My Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
