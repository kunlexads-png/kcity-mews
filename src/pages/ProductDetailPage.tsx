import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { ProductCard } from '../components/common/ProductCard.tsx';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get<{ success: boolean; product: Product }>(`/products/${id}`);
        if (res.success && res.product) {
          const prod = res.product;
          setProduct(prod);
          setActiveImage(prod.image_url);

          const sizes = prod.size.split(',').map((s) => s.trim()).filter(Boolean);
          setSelectedSize(sizes[0] || 'Standard');
          setQuantity(1);

          // Fetch related products in the same category
          const relRes = await api.get<{ success: boolean; products: Product[] }>(
            `/products?category=${encodeURIComponent(prod.category)}&limit=4`
          );
          if (relRes.success) {
            setRelatedProducts(relRes.products.filter((p) => p.id !== prod.id));
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-slate-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const sizes = product.size.split(',').map((s) => s.trim()).filter(Boolean);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 4;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      size: selectedSize,
      color: product.color,
      imageUrl: product.image_url,
      maxStock: product.stock_quantity,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const added = addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      size: selectedSize,
      color: product.color,
      imageUrl: product.image_url,
      maxStock: product.stock_quantity,
      quantity,
    });
    if (added) {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-slate-900 transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-900 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery Column */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {/* Wishlist Button Overlay */}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm transition-all"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === imgUrl ? 'border-slate-950 scale-102 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Order Controls Column */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {product.category} • {product.color}
              </span>

              {/* Stock Status Badge */}
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Only {product.stock_quantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock_quantity} available)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
                ₦{Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">Price in Nigerian Naira (NGN)</span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {product.description}
            </p>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-900">
                    Select Size
                  </span>
                  <span className="text-slate-500">Standard Nigerian sizing</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === size
                          ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                          : 'border-slate-200 text-slate-800 hover:border-slate-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="pt-3 space-y-2">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Buy Now with Paystack</span>
              </button>
            </div>

            {/* Assurance badges */}
            <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-slate-700 mx-auto mb-1" />
                <span className="font-semibold block text-slate-800">Swift Dispatch</span>
                <span>24-48h Delivery</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-slate-700 mx-auto mb-1" />
                <span className="font-semibold block text-slate-800">Paystack Verified</span>
                <span>100% Secure Checkout</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-slate-700 mx-auto mb-1" />
                <span className="font-semibold block text-slate-800">7-Day Fit Exchange</span>
                <span>Hassle-Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-slate-200 space-y-8">
          <h2 className="text-2xl font-black font-display text-slate-950 uppercase tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
