import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { DashboardStats } from '../../types/index.ts';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get<{ success: boolean; stats: DashboardStats }>('/admin/dashboard');
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900 mx-auto" />
        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
          Loading Analytics & Metrics...
        </p>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-center text-slate-500">Failed to load statistics.</div>;
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      subtext: 'Paid via Paystack',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      subtext: `${stats.paidOrders} Paid • ${stats.pendingOrders} Pending`,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      subtext: 'Shoes & T-Shirts catalog',
      icon: Package,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Registered Customers',
      value: stats.totalUsers,
      subtext: 'Active accounts',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockCount,
      subtext: 'Products with <= 5 items left',
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-200',
    },
    {
      label: 'Paid Orders',
      value: stats.paidOrders,
      subtext: 'Successfully fulfilled / processing',
      icon: CreditCard,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500">
            Real-time business performance, inventory health, and recent orders.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          Manage Inventory
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${card.color} shadow-xs flex items-start justify-between`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-80">
                  {card.label}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-display text-slate-950 block my-1">
                  {card.value}
                </span>
                <span className="text-[11px] font-medium opacity-90 block">{card.subtext}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 shadow-xs">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart Strip: Weekly Sales Distribution */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display uppercase tracking-tight text-slate-950">
              Weekly Revenue Distribution (₦)
            </h3>
            <p className="text-xs text-slate-500">Tracked sales volume across recent business days</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            +24.5% vs last week
          </span>
        </div>

        <div className="pt-4 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-slate-100 pb-2">
          {stats.salesOverTime?.map((day) => {
            const maxRev = 300000;
            const heightPercent = Math.min(100, Math.max(15, (day.revenue / maxRev) * 100));
            return (
              <div key={day.name} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₦{(day.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full rounded-t-xl bg-slate-950 group-hover:bg-amber-400 transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">{day.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Best-Sellers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Sellers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display uppercase tracking-tight text-slate-950">
              Top Selling Products
            </h3>
            <Link to="/admin/products" className="text-xs font-bold text-slate-500 hover:text-black">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.bestSellers?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-slate-500">{item.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block font-display">
                    {item.units_sold} sold
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    ₦{Number(item.total_sales).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold font-display uppercase tracking-tight text-slate-950">
                Inventory Alerts
              </h3>
            </div>
            <Link to="/admin/inventory" className="text-xs font-bold text-slate-500 hover:text-black">
              Restock
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              All inventory levels are healthy! No low stock items.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.lowStockProducts.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={prod.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                      <span className="text-[11px] text-slate-500">{prod.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {prod.stock_quantity === 0 ? 'OUT OF STOCK' : `Only ${prod.stock_quantity} Left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display uppercase tracking-tight text-slate-950">
            Recent Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold uppercase text-slate-600 hover:text-black flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 uppercase text-[10px] font-extrabold text-slate-400">
              <tr>
                <th className="py-3 px-3">Order #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentOrders?.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.order_number}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{ord.customer_email}</p>
                  </td>
                  <td className="py-3 px-3">{new Date(ord.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 font-display">
                    ₦{Number(ord.total_amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
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
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800">{ord.order_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
