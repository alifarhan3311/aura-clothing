import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard Delivery', desc: '3–5 business days', price: 299 },
  { id: 'express', label: 'Express Delivery', desc: '1–2 business days', price: 599 },
];

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', Icon: Banknote },
  { id: 'card', label: 'Credit / Debit Card', Icon: CreditCard },
];

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState('standard');
  const [payment, setPayment] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: 'Pakistan',
  });
  const [errors, setErrors] = useState({});

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shipping)?.price || 299;
  const total = cartTotal + shippingCost;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  const validate = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const errs = {};
    required.forEach((field) => {
      if (!form[field].trim()) errs[field] = 'Required';
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setOrderPlaced(true);
    clearCart();
    toast.success('Order placed successfully! 🎉', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      duration: 5000,
    });
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Confirmed!
          </h1>
          <p className="text-gray-500 mb-2 text-sm">
            Thank you for shopping with MH Clothing. Your order is being prepared.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            A confirmation email will be sent to <strong>{form.email}</strong>
          </p>

          <div className="bg-white rounded-2xl p-5 text-left mb-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 text-sm">
              <Truck size={16} className="text-amber-600" />
              <div>
                <p className="font-semibold text-gray-900">Estimated Delivery</p>
                <p className="text-gray-500 text-xs">
                  {shipping === 'express' ? '1–2 business days' : '3–5 business days'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-gray-900 text-white px-10 py-3.5 rounded-full font-semibold text-sm hover:bg-amber-700 transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty. Add items before checking out.</p>
          <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-semibold">
            Shop Now
          </button>
        </div>
      </main>
    );
  }

  const inputClass = (name) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
    }`;

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Checkout
        </h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Shipping + Payment */}
            <div className="lg:col-span-3 space-y-6">

              {/* Shipping Info */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-bold text-gray-900 mb-5">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'First Name', placeholder: 'Sara' },
                    { name: 'lastName', label: 'Last Name', placeholder: 'Ahmed' },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name}>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
                      <input name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className={inputClass(name)} />
                      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
                    </div>
                  ))}
                  {[
                    { name: 'email', label: 'Email', placeholder: 'sara@example.com', type: 'email', span: false },
                    { name: 'phone', label: 'Phone', placeholder: '+92 300 0000000', type: 'tel', span: false },
                    { name: 'address', label: 'Street Address', placeholder: '14-F, Block 7, Gulberg III', type: 'text', span: true },
                    { name: 'city', label: 'City', placeholder: 'Lahore', type: 'text', span: false },
                    { name: 'postalCode', label: 'Postal Code', placeholder: '54000', type: 'text', span: false },
                  ].map(({ name, label, placeholder, type = 'text', span }) => (
                    <div key={name} className={span ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
                      <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} className={inputClass(name)} />
                      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-bold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${shipping === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" value={method.id} checked={shipping === method.id} onChange={() => setShipping(method.id)} className="accent-gray-900" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatPrice(method.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${payment === id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="accent-gray-900" />
                      <Icon size={18} className="text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>

                {payment === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3"
                  >
                    <input placeholder="Card Number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                      <input placeholder="CVV" className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 sticky top-24" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-5">
                  {items.map((item) => {
                    const price = item.onSale ? item.salePrice : item.price;
                    return (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3 items-center">
                        <div className="relative shrink-0">
                          <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded-lg" />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors duration-200"
                >
                  <CheckCircle size={16} />
                  Place Order — {formatPrice(total)}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secure & encrypted checkout
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
