import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your bag is empty
          </h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start exploring!</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-amber-700 transition-colors"
          >
            Continue Shopping <ArrowRight size={15} />
          </Link>
        </motion.div>
      </main>
    );
  }

  const shipping = cartTotal >= 5000 ? 0 : 299;
  const total = cartTotal + shipping;

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            My Bag ({items.length})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => {
              const itemPrice = item.onSale ? item.salePrice : item.price;
              return (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-5 flex gap-5"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  {/* Image */}
                  <Link to="/" className="shrink-0 w-24 h-28 rounded-xl overflow-hidden bg-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.subcategory}</p>
                        <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Size: <span className="font-medium text-gray-700">{item.selectedSize}</span></p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Qty */}
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatPrice(itemPrice * item.quantity)}</p>
                        {item.onSale && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(item.price * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 sticky top-24" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    Add {formatPrice(5000 - cartTotal)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
              </div>

              {/* Promo code */}
              <div className="mt-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Promo code" className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-colors" />
                  </div>
                  <button className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-5 w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors duration-200"
              >
                Proceed to Checkout <ArrowRight size={15} />
              </Link>

              <Link to="/" className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
