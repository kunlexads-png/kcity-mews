import { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, Check, Loader2, Save } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  size: string;
  color: string;
  image_url: string;
  stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { success, error } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; inventory: InventoryItem[] }>('/admin/inventory');
      if (res.success) {
        setItems(res.inventory);
        const map: Record<number, number> = {};
        res.inventory.forEach((i) => {
          map[i.id] = i.stock_quantity;
        });
        setStockInputs(map);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUpdateStock = async (id: number) => {
    const qty = stockInputs[id];
    if (qty === undefined || qty < 0) return;

    setUpdatingId(id);
    try {
      const res = await api.put<{ success: boolean; message: string }>(`/admin/inventory/${id}`, {
        stock_quantity: qty,
      });
      if (res.success) {
        success(res.message || 'Stock updated successfully.');
        loadInventory();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update stock quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const lowStockCount = items.filter((i) => i.stock_status !== 'IN_STOCK').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-slate-500">
            Real-time shelf counts. Quantities automatically decrement upon verified Paystack payments.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lowStockCount} products require immediate restock</span>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
            <p className="text-xs text-slate-500 font-bold uppercase">Loading Inventory Levels...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">No products in inventory.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Colorway</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border shrink-0"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600">{item.color}</td>
                    <td className="py-3 px-4 text-slate-500">{item.size}</td>
                    <td className="py-3 px-4">
                      {item.stock_status === 'OUT_OF_STOCK' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : item.stock_status === 'LOW_STOCK' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-200">
                          Low Stock Warning ({item.stock_quantity})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Optimal ({item.stock_quantity})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-display text-sm">
                      {item.stock_quantity}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={stockInputs[item.id] ?? item.stock_quantity}
                          onChange={(e) =>
                            setStockInputs({
                              ...stockInputs,
                              [item.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900 text-xs focus:outline-none focus:border-slate-950"
                        />
                        <button
                          onClick={() => handleUpdateStock(item.id)}
                          disabled={updatingId === item.id}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white transition-colors"
                          title="Save Stock Level"
                        >
                          {updatingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
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
