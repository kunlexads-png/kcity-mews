import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Order } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; orders: Order[] }>('/orders', {
        status: statusFilter,
        search,
        limit: 50,
      });
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put<{ success: boolean; message: string }>(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.success) {
        success(`Order #${orderId} updated to ${newStatus}. Customer notified via email.`);
        loadOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
          Order Fulfillment
        </h1>
        <p className="text-xs text-slate-500">
          Manage customer orders, track Paystack payments, update delivery statuses, and trigger email notifications.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {['All', ...statuses].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
            <p className="text-xs text-slate-500 font-bold uppercase">Loading Orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No orders found under this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total (₦)</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Update Status</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.order_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{ord.customer_email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-950 font-display">
                      ₦{Number(ord.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment_status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block">
                        <select
                          value={ord.order_status}
                          disabled={updatingId === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold uppercase text-slate-800 cursor-pointer focus:outline-none focus:border-slate-950"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {updatingId === ord.id && (
                          <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
                        title="View Full Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View for Admin */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black font-display text-slate-950 uppercase">
                  Order Management
                </h3>
                <p className="text-xs font-mono text-slate-500">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-bold uppercase text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border">
                <p className="font-bold text-slate-900">Customer: {selectedOrder.customer_name}</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {selectedOrder.customer_email}
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {selectedOrder.phone}
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedOrder.shipping_address}, {selectedOrder.city || ''}, {selectedOrder.state || ''}
                </p>
                <p className="text-slate-500 pt-1">
                  Paystack Reference: <code className="font-mono text-slate-800">{selectedOrder.payment_reference}</code>
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Items Purchased
                </h4>
                <div className="divide-y divide-slate-100 border rounded-xl p-3 bg-white">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-slate-500">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-slate-900 font-display">
                        ₦{Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-slate-950 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span>₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Change Order Status & Trigger Email:
                </label>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
