import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Split available sizes
  const sizes = product.size.split(',').map((s) => s.trim()).filter(Boolean);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || 'Standard');
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 4;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const added = addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      size: selectedSize,
      color: product.color,
      imageUrl: product.image_url,
      maxStock: product.stock_quantity,
    });

    if (added) {
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1800);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100/90 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span className="bg-slate-950/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md">
            {product.category}
          </span>
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
              Only {product.stock_quantity} Left
            </span>
          ) : product.featured ? (
            <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              Featured
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 backdrop-blur-md shadow-sm z-10 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 scale-105'
              : 'bg-white/80 text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Quick View Link Button on Hover */}
        <Link
          to={`/product/${product.id}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 text-slate-900 text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-white whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {product.color}
          </div>
          <Link
            to={`/product/${product.id}`}
            className="block text-sm sm:text-base font-bold text-slate-900 hover:text-slate-700 line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-950 font-display">
              ₦{Number(product.price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sizes row */}
        {sizes.length > 0 && !isOutOfStock && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Size:</span>
            {sizes.slice(0, 5).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all ${
                  selectedSize === size
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {size}
              </button>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] text-slate-400">+{sizes.length - 5}</span>
            )}
          </div>
        )}

        {/* Add to Cart button */}
        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : isAddedRecently
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-950 hover:bg-slate-800 text-white shadow-sm hover:shadow'
          }`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isAddedRecently ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart ({selectedSize})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
