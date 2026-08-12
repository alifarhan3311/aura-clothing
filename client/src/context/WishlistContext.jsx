import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const LS_KEY = 'MH_Clothing_wishlist';

function readLocalWishlist() {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // wishlist: array of product objects (when local) or product objects from API
  const [wishlist, setWishlist] = useState(readLocalWishlist);
  const [loading, setLoading] = useState(false);

  // ── Sync with backend when user logs in ──────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      wishlistApi
        .get()
        .then((res) => {
          const products = res.products || [];
          setWishlist(products);
          // Clear the local cache since backend is source of truth now
          localStorage.removeItem(LS_KEY);
        })
        .catch(() => {
          // Backend unavailable — keep local cache
        })
        .finally(() => setLoading(false));
    } else {
      // Not logged in — use localStorage
      setWishlist(readLocalWishlist());
    }
  }, [isAuthenticated]);

  // Persist to localStorage only when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LS_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  // ── Toggle (add / remove) ────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    async (product) => {
      const pid = product._id || product.id;

      if (isAuthenticated) {
        // Optimistic update
        setWishlist((prev) => {
          const exists = prev.some((p) => (p._id || p.id) === pid);
          return exists
            ? prev.filter((p) => (p._id || p.id) !== pid)
            : [...prev, product];
        });

        try {
          await wishlistApi.toggle(pid);
        } catch {
          // Revert on failure
          setWishlist((prev) => {
            const exists = prev.some((p) => (p._id || p.id) === pid);
            return exists
              ? prev.filter((p) => (p._id || p.id) !== pid)
              : [...prev, product];
          });
        }
      } else {
        // Not logged in — local only
        setWishlist((prev) => {
          const exists = prev.some((p) => (p._id || p.id) === pid);
          return exists
            ? prev.filter((p) => (p._id || p.id) !== pid)
            : [...prev, product];
        });
      }
    },
    [isAuthenticated]
  );

  const isWishlisted = useCallback(
    (id) => wishlist.some((p) => (p._id || p.id) === id),
    [wishlist]
  );

  const clearWishlist = useCallback(async () => {
    setWishlist([]);
    if (isAuthenticated) {
      try {
        await wishlistApi.clear();
      } catch {
        // silently fail
      }
    }
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, clearWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
