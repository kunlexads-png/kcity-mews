import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, ArrowRight, Shield, RefreshCw, Truck, CreditCard } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; message: string }>('/admin/newsletter', { email });
      if (res.success) {
        setSubscribed(true);
        success(res.message || 'Subscribed to KCity Mews!');
        setEmail('');
      }
    } catch (err: any) {
      error(err.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      {/* Brand values banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="p-3 bg-slate-900 rounded-xl text-white shrink-0">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Lagos express same-day & secure inter-state delivery.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="p-3 bg-slate-900 rounded-xl text-white shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Paystack Secured</h4>
              <p className="text-xs text-slate-400 mt-1">Bank-grade PCI-DSS encrypted card & transfer payments.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="p-3 bg-slate-900 rounded-xl text-white shrink-0">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">100% Premium Craft</h4>
              <p className="text-xs text-slate-400 mt-1">High-grade heavyweight cotton & authentic leather shoes.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="p-3 bg-slate-900 rounded-xl text-white shrink-0">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-1">7-day easy size exchange guarantee.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-black tracking-tight text-white uppercase">
                KCity Mews
              </span>
              <p className="text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase -mt-1">
                Step In. Stand Out.
              </p>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              KCity Mews is an online fashion boutique born in Nigeria, dedicated to redefining modern streetwear
              through timeless sneakers and heavyweight statement T-shirts.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Get Exclusive Drops & 10% Off First Order
              </h4>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800">
                  <Check className="w-4 h-4" /> You're on the KCity Mews VIP guest list!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-950 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Shop Collection</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/shop?category=Shoes" className="hover:text-white transition-colors">
                  Men & Women Shoes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=T-Shirts" className="hover:text-white transition-colors">
                  Boxy Heavyweight T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Drops
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-white transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Complete Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Customer Service</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Size Guide & Fit
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Delivery & Shipping Rates
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  FAQ & Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Store & Support</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Victoria Island & Lekki Phase 1, Lagos, Nigeria</p>
              <p className="text-slate-300 font-semibold">orders@kcitymews.com</p>
              <p className="text-slate-300 font-semibold">+234 (0) 801 234 5678</p>
              <p className="text-[11px] text-slate-500">Mon - Sat: 9:00 AM - 7:00 PM WAT</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KCity Mews Fashion Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
