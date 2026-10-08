import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Award } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero header */}
      <div className="max-w-3xl space-y-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
          Our Story & Philosophy
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-slate-950 leading-tight">
          Crafting Modern Streetwear For Everyday Distinction.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Founded with a relentless obsession for silhouette, material integrity, and African urban culture,
          <strong> KCity Mews</strong> bridges minimalist luxury aesthetics with functional everyday streetwear.
        </p>
      </div>

      {/* Brand values grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-black font-display uppercase text-slate-900">Heavyweight Craft</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We source 240-280 GSM combed Egyptian cotton for our T-shirts and authentic full-grain calfskin leather
            for our sneakers to ensure pieces maintain their shape and poise for years.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-black font-display uppercase text-slate-900">Step In. Stand Out.</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our motto isn't merely a slogan; it's a design manifesto. From geometric sole architectures to subtle puff
            inscriptions, every product is engineered so you effortlessly stand out in any room.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-black font-display uppercase text-slate-900">Lagos-Bred Transparency</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Transparent pricing in Nigerian Naira (₦), seamless Paystack transactions, real-time inventory counts,
            and reliable 24-48h dispatch across all 36 states.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight">
            Ready to upgrade your rotation?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore our curated shoe silhouettes and heavyweight drop-shoulder t-shirts today.
          </p>
        </div>
        <Link
          to="/shop"
          className="px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0"
        >
          <span>Shop The Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
