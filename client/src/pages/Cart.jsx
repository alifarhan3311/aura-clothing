import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponApi } from '../lib/api';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

export default function Cart() {
  const {
    items, removeFromCart, updateQuantity, cartTotal, clearCart,
    coupon, discount, breakdown, applyCoupon, removeCoupon,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return;
    setApplying(true);
    try {
      // Send items so backend can compute per-item discount
      const itemsPayload = items.map((item) => ({
        id: item._id || item.id,
        price: item.onSale ? item.salePrice : item.price,
        quantity: item.quantity,
        name: item.name,
      }));

      const res = await couponApi.validate(promoCode.trim(), cartTotal, itemsPayload);
      applyCoupon(res.coupon, res.discount, res.breakdown || []);
      setPromoCode('');
      toast.success(`Coupon "${res.coupon.code}" applied! You saved ${formatPrice(res.discount)} 🎉`, {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
      });
    } finally {
      setApplying(false);
    }
  };

  // Build a quick lookup: itemId → { itemDiscount, eligible }
  const discountMap = React.useMemo(() => {
    const map = {};
    (breakdown || []).forEach((b) => {
      if (b.id) map[b.id.toString()] = b;
    });
    return map;
  }, [breakdown]);

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
  const finalTotal = cartTotal - discount + shipping;

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
              const pid = (item._id || item.id)?.toString();
              const itemDiscount = coupon ? (discountMap[pid] || { itemDiscount: 0, eligible: false }) : null;
              const hasItemDiscount = itemDiscount?.eligible && itemDiscount.itemDiscount > 0;
              const discountedTotal = hasItemDiscount
                ? itemPrice * item.quantity - itemDiscount.itemDiscount
                : itemPrice * item.quantity;

              return (
                <motion.div
                  key={`${item._id || item.id}-${item.selectedSize}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-5 flex gap-5"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <Link to={`/product/${item._id || item.id}`} className="shrink-0 w-24 h-28 rounded-xl overflow-hidden bg-gray-50">
                    <img src={item.image || item.mainImage} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.subcategory}</p>
                        <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-gray-500">
                            Size: <span className="font-medium text-gray-700">{item.selectedSize}</span>
                          </p>
                          {/* Coupon discount badge on this item */}
                          {hasItemDiscount && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full"
                            >
                              <Tag size={9} />
                              −{formatPrice(itemDiscount.itemDiscount)}
                            </motion.span>
                          )}
                          {/* Not eligible badge */}
                          {coupon && !itemDiscount?.eligible && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-400 text-[10px] font-medium rounded-full">
                              Coupon N/A
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id || item.id, item.selectedSize)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id || item.id, item.selectedSize, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id || item.id, item.selectedSize, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        {/* Show discounted price if coupon applied on this item */}
                        {hasItemDiscount ? (
                          <>
                            <p className="font-bold text-emerald-700 text-sm">{formatPrice(discountedTotal)}</p>
                            <p className="text-xs text-gray-400 line-through">{formatPrice(itemPrice * item.quantity)}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-gray-900 text-sm">{formatPrice(itemPrice * item.quantity)}</p>
                            {item.onSale && (
                              <p className="text-xs text-gray-400 line-through">{formatPrice(item.price * item.quantity)}</p>
                            )}
                          </>
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

                <AnimatePresence>
                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-emerald-600"
                    >
                      <span>Coupon ({coupon?.code})</span>
                      <span className="font-medium">−{formatPrice(discount)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                <span className="text-lg font-bold text-gray-900">{formatPrice(finalTotal)}</span>
              </div>

              {/* Coupon section */}
              <div className="mt-5">
                <AnimatePresence mode="wait">
                  {coupon ? (
                    <motion.div
                      key="applied"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">{coupon.code}</p>
                          <p className="text-[11px] text-emerald-600">−{formatPrice(discount)} saved</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 text-emerald-500 hover:text-red-500 transition-colors"
                        aria-label="Remove coupon"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Promo code"
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors uppercase placeholder:normal-case"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={applying || !promoCode.trim()}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {applying ? <Loader2 size={12} className="animate-spin" /> : null}
                        Apply
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
