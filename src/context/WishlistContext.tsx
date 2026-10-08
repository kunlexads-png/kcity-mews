import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/index.ts';
import { useToast } from './ToastContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { api } from '../services/api.ts';

interface WishlistContextType {
  wishlist: number[]; // product IDs
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('kcity_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // Sync / fetch wishlist from database when user is authenticated
  const refreshWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const localSaved: number[] = JSON.parse(localStorage.getItem('kcity_wishlist') || '[]');
        if (localSaved.length > 0) {
          // Sync any local wishlist items into the user's database record
          const syncRes = await api.post<{ success: boolean; wishlist: Product[]; productIds: number[] }>(
            '/wishlist/sync',
            { productIds: localSaved }
          );
          if (syncRes.success) {
            setWishlist(syncRes.productIds);
            setWishlistProducts(syncRes.wishlist);
            localStorage.setItem('kcity_wishlist', JSON.stringify(syncRes.productIds));
            return;
          }
        }

        const res = await api.get<{ success: boolean; wishlist: Product[]; productIds: number[] }>('/wishlist');
        if (res.success) {
          setWishlist(res.productIds);
          setWishlistProducts(res.wishlist);
          localStorage.setItem('kcity_wishlist', JSON.stringify(res.productIds));
        }
      } catch (err) {
        console.error('Failed to sync backend wishlist:', err);
      }
    } else {
      // Load products for local wishlist IDs
      if (wishlist.length > 0) {
        try {
          const res = await api.get<{ success: boolean; products: Product[] }>('/products?limit=50');
          if (res.success) {
            setWishlistProducts(res.products.filter((p) => wishlist.includes(p.id)));
          }
        } catch {
          // Ignore in offline
        }
      } else {
        setWishlistProducts([]);
      }
    }
  }, [isAuthenticated, wishlist.length]);

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product: Product) => {
    const isCurrentlyIn = wishlist.includes(product.id);

    if (isCurrentlyIn) {
      await removeFromWishlist(product.id);
    } else {
      const updated = [...wishlist, product.id];
      setWishlist(updated);
      setWishlistProducts((prev) => [...prev, product]);
      localStorage.setItem('kcity_wishlist', JSON.stringify(updated));
      success(`Added "${product.name}" to your wishlist.`);

      if (isAuthenticated) {
        try {
          await api.post(`/wishlist/${product.id}`);
        } catch (err) {
          console.error('Failed to save to backend wishlist:', err);
        }
      }
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const updated = wishlist.filter((id) => id !== productId);
    setWishlist(updated);
    setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
    localStorage.setItem('kcity_wishlist', JSON.stringify(updated));
    info('Removed from your wishlist.');

    if (isAuthenticated) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        console.error('Failed to remove from backend wishlist:', err);
      }
    }
  };

  const clearWishlist = async () => {
    setWishlist([]);
    setWishlistProducts([]);
    localStorage.removeItem('kcity_wishlist');
    info('Wishlist cleared.');

    if (isAuthenticated) {
      for (const id of wishlist) {
        api.delete(`/wishlist/${id}`).catch(() => {});
      }
    }
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistProducts,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
