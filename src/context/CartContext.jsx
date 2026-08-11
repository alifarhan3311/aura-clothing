import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id &&
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
              item.id === action.payload.id &&
              item.selectedSize === action.payload.selectedSize
            )
        ),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id &&
          item.selectedSize === action.payload.selectedSize
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
};

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('MH Clothing-cart');
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  useEffect(() => {
    localStorage.setItem('MH Clothing-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, selectedSize, quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, selectedSize, quantity },
    });
  };

  const removeFromCart = (id, selectedSize) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, selectedSize } });
  };

  const updateQuantity = (id, selectedSize, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, selectedSize, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = state.items.reduce((sum, item) => {
    const price = item.onSale ? item.salePrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
