import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Truck, CreditCard, Banknote, Package, ArrowRight,
  Loader2, UserCheck, Edit, ShieldCheck, MapPin, User, Mail, Phone,
  Building, MapPinned, Globe, Check, PlusCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, authApi } from '../lib/api';
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
  const { items, cartTotal, coupon, discount, clearCart } = useCart();
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();

  // Mode: 'saved' (Profile info) or 'manual' (Custom/Different address)
  const [addressMode, setAddressMode] = useState('saved');

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payment, setPayment] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });

  const [errors, setErrors] = useState({});

  // Helper to extract user profile details
  const getProfileData = () => {
    const fName = user?.firstName || (user?.name || '').trim().split(' ')[0] || '';
    const lName = user?.lastName || (user?.name || '').trim().split(' ').slice(1).join(' ') || '';
    const userAddr = user?.address || {};
    const street = typeof userAddr === 'string' ? userAddr : (userAddr.street || '');
    const city = userAddr.city || '';
    const postalCode = userAddr.postalCode || userAddr.zip || '';
    const country = userAddr.country || 'Pakistan';

    return {
      firstName: fName,
      lastName: lName,
      email: user?.email || '',
      phone: user?.phone || '',
      address: street,
      city: city,
      postalCode: postalCode,
      country: country,
    };
  };

  // Populate on initial load or mode switch
  useEffect(() => {
    if (addressMode === 'saved') {
      setForm(getProfileData());
      setErrors({});
    } else {
      // Manual mode: pre-fill email if desired or blank
      setForm({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Pakistan',
      });
      setErrors({});
    }
  }, [addressMode, user]);

  const hasSavedAddress = Boolean(user?.address?.street || (typeof user?.address === 'string' && user.address));

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price || 299;
  const subtotal = cartTotal;
  const total = subtotal - discount + shippingCost;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  const validate = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const errs = {};
    required.forEach((field) => {
      if (!form[field]?.trim()) errs[field] = 'Required';
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fill in all required shipping details.');
      return;
    }

    setPlacing(true);
    try {
      // If user checked "Save as my default profile address", update user profile in background
      if (saveAsDefault || (addressMode === 'saved' && (!user?.phone || !user?.address?.street))) {
        try {
          const fd = new FormData();
          fd.append('name', `${form.firstName} ${form.lastName}`.trim());
          fd.append('phone', form.phone);
          fd.append('street', form.address);
          fd.append('city', form.city);
          fd.append('postalCode', form.postalCode);
          fd.append('zip', form.postalCode);
          fd.append('country', form.country);

          const profileRes = await authApi.updateProfile(fd);
          if (profileRes.user) saveSession(null, profileRes.user);
        } catch {
          // Non-critical, continue with order
        }
      }

      const orderPayload = {
        items: items.map((item) => ({
          product: item._id || item.id,
          name: item.name,
          image: item.image || item.mainImage || '',
          price: item.onSale ? item.salePrice : item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || '',
          selectedColor: item.selectedColor || '',
        })),
        shippingInfo: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim() || 'Pakistan',
        },
        paymentMethod: payment,
        shippingMethod,
        shippingCost,
        subtotal,
        couponCode: coupon?.code || null,
        discount,
        total,
      };

      const res = await orderApi.create(orderPayload);
      clearCart();
      setPlacedOrder(res.order);
      toast.success('Order placed successfully! 🎉', {
        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
        duration: 5000,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.', {
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '8px', fontSize: '13px' },
      });
    } finally {
      setPlacing(false);
    }
  };

  // ── Order Success Screen ───────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center max-w-md w-full"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Placed!
          </h1>
          <p className="text-gray-500 mb-1 text-sm">
            Thank you for shopping with Fade Find.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            A confirmation email has been sent to <strong>{form.email}</strong>
          </p>

          <div className="bg-white rounded-2xl p-5 text-left mb-6 space-y-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 text-sm border-b border-gray-50 pb-3">
              <Package size={16} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Order ID</p>
                <p className="text-gray-400 text-xs font-mono">{placedOrder._id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck size={16} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Estimated Delivery</p>
                <p className="text-gray-500 text-xs">
                  {shippingMethod === 'express' ? '1–2 business days' : '3–5 business days'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Once your order is confirmed by our team, you'll receive a tracking number via email to track your order.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 border border-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-amber-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-semibold">
            Shop Now
          </button>
        </div>
      </main>
    );
  }

  const inputClass = (name) =>
    `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
      errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-amber-400 bg-white'
    }`;

  return (
    <main className="min-h-screen bg-[#fafafa] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Checkout
            </h1>
            <p className="text-xs text-gray-500 mt-1">Complete your order with secure delivery & payment options</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Logged in as <strong>{user?.name || user?.email}</strong></span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">

              {/* ── 2 Shipping Options: Saved Profile vs Manual Entry ── */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">1. Delivery Address</h2>
                    <p className="text-xs text-gray-500">Choose between your saved profile address or enter a new one</p>
                  </div>
                </div>

                {/* 2 Option Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Saved Profile Details */}
                  <label
                    onClick={() => setAddressMode('saved')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                      addressMode === 'saved'
                        ? 'border-gray-900 bg-gray-50/80 shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressMode"
                      checked={addressMode === 'saved'}
                      onChange={() => setAddressMode('saved')}
                      className="mt-0.5 accent-gray-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">Saved Profile Details</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          Fast Checkout
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {hasSavedAddress
                          ? `${user?.address?.street || user.address}, ${user?.address?.city || ''}`
                          : 'Use your account details and default address'}
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Manual / Different Address */}
                  <label
                    onClick={() => setAddressMode('manual')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                      addressMode === 'manual'
                        ? 'border-gray-900 bg-gray-50/80 shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressMode"
                      checked={addressMode === 'manual'}
                      onChange={() => setAddressMode('manual')}
                      className="mt-0.5 accent-gray-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">Manual / New Address</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Ship to a different recipient or new delivery destination
                      </p>
                    </div>
                  </label>
                </div>

                {/* Form Fields for the chosen mode */}
                <div className="pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First & Last Name */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Sara"
                        className={inputClass('firstName')}
                      />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Ahmed"
                        className={inputClass('lastName')}
                      />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>

                    {/* Email & Phone */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="sara@example.com"
                        className={inputClass('email')}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+92 300 1234567"
                        className={inputClass('phone')}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Street Address */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Street Address / House & Building <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="e.g. 14-F, Block 7, Main Boulevard, Gulberg III"
                        className={inputClass('address')}
                      />
                      {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Lahore"
                        className={inputClass('city')}
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>

                    {/* Postal / ZIP Code */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Postal / ZIP Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="54000"
                        className={inputClass('postalCode')}
                      />
                      {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  {/* Save as default checkbox when manual mode is chosen */}
                  {addressMode === 'manual' && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveAsDefault"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-amber-500 w-4 h-4"
                      />
                      <label htmlFor="saveAsDefault" className="text-xs font-medium text-gray-700 cursor-pointer">
                        Save this address to my account profile for future orders
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Shipping Method ── */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">2. Shipping Method</h2>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        shippingMethod === method.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={() => setShippingMethod(method.id)}
                          className="accent-gray-900"
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatPrice(method.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Payment Method ── */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4">3. Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        payment === id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={payment === id}
                        onChange={() => setPayment(id)}
                        className="accent-gray-900"
                      />
                      <Icon size={18} className="text-gray-600" />
                      <span className="text-sm font-bold text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>

                {payment === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3 pt-3 border-t border-gray-100"
                  >
                    <input
                      placeholder="Card Number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="MM / YY"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
                      />
                      <input
                        placeholder="CVV"
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 sticky top-24 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-5 pr-1">
                  {items.map((item) => {
                    const price = item.onSale ? item.salePrice : item.price;
                    return (
                      <div key={`${item._id || item.id}-${item.selectedSize}`} className="flex gap-3 items-center">
                        <div className="relative shrink-0">
                          <img
                            src={item.image || item.mainImage}
                            alt={item.name}
                            className="w-14 h-16 object-cover rounded-xl border border-gray-100"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                            {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 text-xs">
                      <span>Coupon ({coupon?.code})</span>
                      <span className="font-semibold">−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-900">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                    <span>Total Amount</span>
                    <span className="text-amber-800">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placing}
                  className="mt-6 w-full bg-gray-950 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Place Order — {formatPrice(total)}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-600" /> Secure SSL Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
