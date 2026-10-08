import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryFee, total, itemCount } = useCart();

  const freeDeliveryThreshold = 100000;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  const appliedDeliveryFee = isFreeDelivery || cart.length === 0 ? 0 : deliveryFee;
  const finalTotal = subtotal + appliedDeliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950 uppercase tracking-tight">
            Your Bag is Empty
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Looks like you haven't added any shoes or t-shirts yet. Explore our latest drops!
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-950 uppercase tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs text-slate-500 mt-1">{itemCount} items in your bag</p>
        </div>
        <Link to="/shop" className="text-xs font-bold uppercase text-slate-600 hover:text-black">
          Continue Shopping
        </Link>
      </div>

      {/* Free delivery tracker */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-700" />
            {isFreeDelivery
              ? 'Congratulations! You unlocked Free Delivery nationwide!'
              : `Add ₦${amountToFreeDelivery.toLocaleString()} more to unlock FREE Delivery!`}
          </span>
          <span className="font-bold text-slate-600">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-950 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Grid Layout: Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0"
              >
                {/* Product Preview */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.productId}`}
                      className="font-bold text-slate-950 hover:text-slate-700 text-sm sm:text-base line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Size: <strong className="text-slate-800">{item.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-slate-800">{item.color}</strong></span>
                    </div>
                    <p className="text-sm font-black text-slate-950 font-display pt-1">
                      ₦{Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-900"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal per item */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block sm:hidden">Item total</span>
                    <span className="text-sm font-black text-slate-950 font-display">
                      ₦{Number(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28">
            <h2 className="text-lg font-black font-display uppercase tracking-tight text-slate-950">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-200">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {appliedDeliveryFee === 0 ? (
                    <span className="text-emerald-600 uppercase font-bold text-xs">FREE</span>
                  ) : (
                    `₦${appliedDeliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-slate-950">
              <span className="text-base font-extrabold uppercase tracking-wide">Total</span>
              <span className="text-2xl font-black font-display">
                ₦{finalTotal.toLocaleString()}
              </span>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest text-center transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Paystack 256-bit Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
