import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { Product } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Shoes' | 'T-Shirts'>('Shoes');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [size, setSize] = useState('40, 41, 42, 43, 44');
  const [color, setColor] = useState('Triple Black');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { success, error } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; products: Product[] }>('/products?limit=100');
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('Shoes');
    setPrice('35000');
    setStock('15');
    setSize('40, 41, 42, 43, 44');
    setColor('Black / White');
    setImageUrl('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80');
    setFeatured(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setCategory(p.category as 'Shoes' | 'T-Shirts');
    setPrice(String(p.price));
    setStock(String(p.stock_quantity));
    setSize(p.size);
    setColor(p.color);
    setImageUrl(p.image_url);
    setFeatured(Boolean(p.featured));
    setIsAddModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post<{ success: boolean; imageUrl: string }>('/products/upload-image', formData);
      if (res.success && res.imageUrl) {
        setImageUrl(res.imageUrl);
        success('Image uploaded successfully!');
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed. Allowed formats: JPG, PNG, WEBP.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !size || !color || !imageUrl) {
      error('Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      description,
      category,
      price: Number(price),
      stock_quantity: parseInt(stock, 10),
      size,
      color,
      image_url: imageUrl,
      featured,
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        success(`Product "${name}" updated successfully.`);
      } else {
        await api.post('/products', payload);
        success(`Product "${name}" added to catalog.`);
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      success(`Product "${deletingProduct.name}" removed.`);
      setDeletingProduct(null);
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Add new designs, edit prices, monitor inventory quantities, and upload photography.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or color..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['All', 'Shoes', 'T-Shirts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-900" />
            <p className="text-xs text-slate-500 font-bold uppercase">Loading Products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No products matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4">Color</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock_quantity === 0;
                  const isLowStock = p.stock_quantity > 0 && p.stock_quantity <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.category}</td>
                      <td className="py-3 px-4 font-black text-slate-950 font-display">
                        ₦{Number(p.price).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            0 Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            {p.stock_quantity} Low Stock
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800">{p.stock_quantity} in stock</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[120px] truncate">{p.size}</td>
                      <td className="py-3 px-4 text-slate-700">{p.color}</td>
                      <td className="py-3 px-4">
                        {p.featured ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black font-display text-slate-950 uppercase">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. KCity Retro Court Low"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'Shoes' | 'T-Shirts')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  >
                    <option value="Shoes">Shoes</option>
                    <option value="T-Shirts">T-Shirts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Price (₦ NGN) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Inventory Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Colorway *
                  </label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Triple Black / Neon"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Available Sizes (Comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Shoes: 40, 41, 42, 43 | Tees: S, M, L, XL, XXL"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details about craftsmanship, fabric weight, sole durability..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-950"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700">
                    Product Photography *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-slate-200 rounded-2xl bg-slate-50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover bg-white border shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        No Image
                      </div>
                    )}

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-xl font-bold uppercase text-[11px] cursor-pointer flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        <span className="text-slate-400">or enter image URL below:</span>
                      </div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured checkbox */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <label htmlFor="featured" className="font-semibold text-slate-800 cursor-pointer">
                    Feature on Homepage ("Featured Pieces" showcase)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl font-bold uppercase text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingImage}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Product Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete <strong>"{deletingProduct.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
