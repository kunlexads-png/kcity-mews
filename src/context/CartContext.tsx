import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types/index.ts';
import { useToast } from './ToastContext.tsx';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => boolean;
  updateQuantity: (productId: number, size: string, color: string, qty: number) => void;
  removeFromCart: (productId: number, size: string, color: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kcity_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success, error, info } = useToast();

  useEffect(() => {
    localStorage.setItem('kcity_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }): boolean => {
    const qtyToAdd = newItem.quantity || 1;

    // Check against available stock
    if (newItem.maxStock <= 0) {
      error(`Sorry, "${newItem.name}" is currently out of stock.`);
      return false;
    }

    let isAdded = false;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size && i.color === newItem.color
      );

      if (existingIndex > -1) {
        const existing = prevCart[existingIndex];
        const newTotalQty = existing.quantity + qtyToAdd;

        if (newTotalQty > newItem.maxStock) {
          error(`Only ${newItem.maxStock} items available in stock.`);
          return prevCart;
        }

        const updated = [...prevCart];
        updated[existingIndex] = {
          ...existing,
          quantity: newTotalQty,
        };
        isAdded = true;
        return updated;
      } else {
        if (qtyToAdd > newItem.maxStock) {
          error(`Only ${newItem.maxStock} items available in stock.`);
          return prevCart;
        }

        isAdded = true;
        return [
          ...prevCart,
          {
            ...newItem,
            quantity: qtyToAdd,
          },
        ];
      }
    });

    if (isAdded) {
      success(`Added ${newItem.name} (${newItem.size}) to cart.`);
    }

    return isAdded;
  };

  const updateQuantity = (productId: number, size: string, color: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.color === color) {
          if (qty > item.maxStock) {
            info(`Cannot exceed available stock of ${item.maxStock}.`);
            return { ...item, quantity: item.maxStock };
          }
          if (qty < 1) return { ...item, quantity: 1 };
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
    info('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 2500 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
