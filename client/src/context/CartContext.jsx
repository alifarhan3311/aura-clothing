import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = { items: [], coupon: null, discount: 0, breakdown: [] };

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const pid = action.payload._id || action.payload.id;
      const existing = state.items.find(
        (item) =>
          (item._id || item.id) === pid &&
          item.selectedSize === action.payload.selectedSize
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            (item._id || item.id) === pid &&
            item.selectedSize === action.payload.selectedSize
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              (item._id || item.id) === (action.payload._id || action.payload.id) &&
              item.selectedSize === action.payload.selectedSize
            )
        ),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          (item._id || item.id) === (action.payload._id || action.payload.id) &&
          item.selectedSize === action.payload.selectedSize
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [], coupon: null, discount: 0 };

    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.payload.coupon,
        discount: action.payload.discount,
        breakdown: action.payload.breakdown || [],
      };

    case 'REMOVE_COUPON':
      return { ...state, coupon: null, discount: 0, breakdown: [] };

    default:
      return state;
  }
};

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('mh-cart');
    return stored ? JSON.parse(stored) : initialState;
  } catch {
    return initialState;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  useEffect(() => {
    localStorage.setItem('mh-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, selectedSize, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, selectedSize, quantity } });
  };

  const removeFromCart = (id, selectedSize) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { _id: id, id, selectedSize } });
  };

  const updateQuantity = (id, selectedSize, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id: id, id, selectedSize, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const applyCoupon = (coupon, discount, breakdown = []) => {
    dispatch({ type: 'APPLY_COUPON', payload: { coupon, discount, breakdown } });
  };

  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = state.items.reduce((sum, item) => {
    const price = item.salePrice ?? (item.onSale ? item.salePrice : item.price) ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        coupon: state.coupon,
        discount: state.discount,
        breakdown: state.breakdown,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
