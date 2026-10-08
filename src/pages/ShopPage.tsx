import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowUpDown, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state initialized from query params
  const categoryParam = searchParams.get('category') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('search') || '';
  const sizeParam = searchParams.get('size') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  // Available sizes for quick filter
  const shoeSizes = ['39', '40', '41', '42', '43', '44', '45'];
  const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const query: Record<string, any> = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
        };

        if (categoryParam !== 'All') query.category = categoryParam;
        if (searchParam) query.search = searchParam;
        if (sizeParam) query.size = sizeParam;
        if (minPriceParam) query.minPrice = minPriceParam;
        if (maxPriceParam) query.maxPrice = maxPriceParam;

        const res = await api.get<{
          success: boolean;
          products: Product[];
          pagination: { total: number; totalPages: number; page: number };
        }>('/products', query);

        if (res.success) {
          setProducts(res.products);
          setTotalPages(res.pagination.totalPages);
          setTotalProducts(res.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryParam, sortParam, searchParam, sizeParam, minPriceParam, maxPriceParam, pageParam]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    // Reset to page 1 on filter change unless page itself is changing
    if (!newParams.page) {
      current.set('page', '1');
    }
    setSearchParams(current);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ minPrice, maxPrice });
    setMobileFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    categoryParam !== 'All' || searchParam || sizeParam || minPriceParam || maxPriceParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 uppercase tracking-tight">
          {categoryParam === 'All' ? 'Complete Collection' : categoryParam}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {totalProducts} premium shoes and streetwear staples
        </p>
      </div>

      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Shoes', 'T-Shirts'].map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters({ category: cat === 'All' ? null : cat })}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                categoryParam === cat || (cat === 'All' && categoryParam === 'All')
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-950 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="appearance-none pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase tracking-wider focus:outline-none focus:border-slate-950 cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="popular">Popular</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Active Filters:</span>
          {categoryParam !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              Category: {categoryParam}
              <button onClick={() => updateFilters({ category: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {sizeParam && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              Size: {sizeParam}
              <button onClick={() => updateFilters({ size: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              Keyword: "{searchParam}"
              <button onClick={() => { setSearchTerm(''); updateFilters({ search: null }); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(minPriceParam || maxPriceParam) && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-medium">
              Price: ₦{minPriceParam || '0'} - ₦{maxPriceParam || 'Max'}
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); updateFilters({ minPrice: null, maxPrice: null }); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid & Desktop Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          {/* Size Filter */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950">
              Filter By Size
            </h3>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">Shoe Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {shoeSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilters({ size: sizeParam === s ? null : s })}
                    className={`w-9 h-8 rounded-lg text-xs font-bold border transition-all ${
                      sizeParam === s
                        ? 'bg-slate-950 text-white border-slate-950'
                        : 'border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">T-Shirt Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {tshirtSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateFilters({ size: sizeParam === s ? null : s })}
                    className={`px-3 h-8 rounded-lg text-xs font-bold border transition-all ${
                      sizeParam === s
                        ? 'bg-slate-950 text-white border-slate-950'
                        : 'border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-950">
              Price Range (₦)
            </h3>
            <form onSubmit={handlePriceFilterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Min (₦)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="10,000"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Max (₦)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="60,000"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4">
              <PackageX className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria, price range, or category filter.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => updateFilters({ page: String(Math.max(1, pageParam - 1)) })}
                disabled={pageParam <= 1}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 uppercase"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs font-medium text-slate-500">
                Page <strong className="text-slate-900">{pageParam}</strong> of {totalPages}
              </span>

              <button
                onClick={() => updateFilters({ page: String(Math.min(totalPages, pageParam + 1)) })}
                disabled={pageParam >= totalPages}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 uppercase"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 uppercase">Filter Products</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900 uppercase">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {[...shoeSizes, ...tshirtSizes].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      updateFilters({ size: sizeParam === s ? null : s });
                      setMobileFilterOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      sizeParam === s ? 'bg-slate-950 text-white' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price form */}
            <form onSubmit={handlePriceFilterSubmit} className="space-y-4">
              <p className="text-xs font-bold text-slate-900 uppercase">Price Range</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min ₦"
                  className="px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max ₦"
                  className="px-3 py-2 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
