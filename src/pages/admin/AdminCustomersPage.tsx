import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { User } from '../../types/index.ts';

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; customers: User[] }>('/admin/customers', {
        search,
      });
      if (res.success) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500">
          View registered customer accounts, verification statuses, purchase history, and lifetime value.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
            <p className="text-xs text-slate-500 font-bold uppercase">Loading Customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">No registered customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email Verified</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spent (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.full_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{c.email}</td>
                    <td className="py-3 px-4 text-slate-500">{c.phone || '—'}</td>
                    <td className="py-3 px-4">
                      {c.email_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{c.order_count || 0}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-950 font-display">
                      ₦{Number(c.total_spent || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
