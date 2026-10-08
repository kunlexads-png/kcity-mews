import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/common/ProductCard.tsx';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featRes, newRes] = await Promise.all([
          api.get<{ success: boolean; products: Product[] }>('/products?featured=true&limit=8'),
          api.get<{ success: boolean; products: Product[] }>('/products?sort=newest&limit=8'),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products);
        if (newRes.success) setNewArrivals(newRes.products);
      } catch (err) {
        console.error('Failed to load homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden">
        {/* Background gradient overlay & image */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1800&q=80"
            alt="KCity Mews Fashion"
            className="w-full h-full object-cover object-center scale-105 filter contrast-125"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent z-1"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autumn / Winter Streetwear Drop</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight uppercase leading-[0.95]">
              STEP IN.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-amber-300">
                STAND OUT.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              Discover premium shoes and statement T-shirts designed for your everyday style.
              Engineered with heavyweight combed cotton and authentic leather craftsmanship.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/shop?category=Shoes"
                className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 rounded-xl font-extrabold uppercase text-xs tracking-widest transition-all duration-200 text-center shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Shop Shoes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop?category=T-Shirts"
                className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white/80 hover:border-white rounded-xl font-extrabold uppercase text-xs tracking-widest transition-all duration-200 text-center backdrop-blur-sm"
              >
                <span>Shop T-Shirts</span>
              </Link>
            </div>

            {/* Quick credibility counters */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15 max-w-lg">
              <div>
                <p className="text-2xl font-black font-display text-white">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Premium Finish</p>
              </div>
              <div>
                <p className="text-2xl font-black font-display text-white">Paystack</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Instant Security</p>
              </div>
              <div>
                <p className="text-2xl font-black font-display text-white">48h</p>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Fast Shipping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pillars Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Shoes Card */}
          <Link
            to="/shop?category=Shoes"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80"
              alt="Shoes Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                  Collection 01
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
                  Footwear & Sneakers
                </h3>
                <p className="text-xs text-slate-300 mt-1">High-tops, classic low cuts, and chunky runners.</p>
              </div>
              <span className="p-3 rounded-full bg-white text-slate-950 group-hover:bg-amber-400 transition-colors shadow-lg">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>

          {/* T-Shirts Card */}
          <Link
            to="/shop?category=T-Shirts"
            className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"
              alt="T-Shirts Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                  Collection 02
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
                  Heavyweight T-Shirts
                </h3>
                <p className="text-xs text-slate-300 mt-1">280 GSM luxury combed cotton & boxy drops.</p>
              </div>
              <span className="p-3 rounded-full bg-white text-slate-950 group-hover:bg-amber-400 transition-colors shadow-lg">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4 text-slate-900" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-950 uppercase tracking-tight">
              Featured Pieces
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-slate-600 transition-colors"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why KCity Mews Feature Strip */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              The KCity Mews Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-slate-950 mt-1">
              Why Shop With Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Quality Products</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We never compromise on fabrics or soles. Every product is rigorously inspected for stitching, weight, and longevity.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Secure Payment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powered by Paystack, Africa's leading payment gateway. Your card details and transactions are 100% encrypted.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Fast Delivery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Swift dispatch within 24 hours. Real-time updates via email so you always know where your package is.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 text-white flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Easy Returns</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wrong shoe size? Contact our Lagos concierge within 7 days for a quick, friction-free size exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Fresh Off The Line</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-950 uppercase tracking-tight">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-slate-600 transition-colors"
          >
            <span>Explore All New</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Streetwear Lifestyle Editorial Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-14 lg:p-20">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              The Movement
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight leading-tight">
              Crafted for Lagos.<br />
              Worn Worldwide.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              KCity Mews was created for those who believe style is more than an outfit—it's a statement.
              From monochrome skate sneakers to 280 GSM heavyweight cotton drop-shoulders, step into confidence every day.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <span>Explore The Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
