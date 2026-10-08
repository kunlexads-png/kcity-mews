import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, ShieldCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { PaymentRecord } from '../../types/index.ts';

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; payments: PaymentRecord[] }>('/admin/payments', {
        status: statusFilter,
        search,
      });
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPayments();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
          Paystack Payments
        </h1>
        <p className="text-xs text-slate-500">
          Track transaction authorizations, Paystack references, and settlement verifications.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, order #..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-1.5">
          {['All', 'successful', 'pending', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
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

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
            <p className="text-xs text-slate-500 font-bold uppercase">Loading Payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Paystack Reference</th>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.reference}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{p.order_number || `Order #${p.order_id}`}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.customer_name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.customer_email || '—'}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-950 font-display">
                      ₦{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'successful' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Successful
                        </span>
                      ) : p.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black font-display text-slate-950 uppercase">
                  Paystack Transaction
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-3 py-1 text-xs border rounded-lg font-bold uppercase text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border font-mono">
              <p><strong>Reference:</strong> {selectedPayment.reference}</p>
              <p><strong>Amount:</strong> ₦{Number(selectedPayment.amount).toLocaleString()} {selectedPayment.currency}</p>
              <p><strong>Status:</strong> {selectedPayment.status}</p>
              <p><strong>Order:</strong> {selectedPayment.order_number}</p>
              <p><strong>Created:</strong> {selectedPayment.created_at}</p>
              <p><strong>Paid At:</strong> {selectedPayment.paid_at || 'N/A'}</p>
            </div>

            {selectedPayment.gateway_response && (
              <div className="space-y-1 text-xs">
                <p className="font-bold uppercase text-[10px] text-slate-400">Gateway Payload</p>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] max-h-40">
                  {JSON.stringify(selectedPayment.gateway_response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
