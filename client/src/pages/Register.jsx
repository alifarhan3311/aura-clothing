import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { showSuccess, showError } from '../lib/toastUtils';
import { authApi } from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || null;

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        await authApi.register({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          password: form.password,
        });

        showSuccess('Account created! Check your email for the OTP.');

        // Redirect to OTP verification page, passing email and from in state
        navigate('/verify-otp', { state: { email: form.email.trim(), from } });
      } catch (err) {
        showError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <Link to="/">
              <span className="text-2xl font-black tracking-[0.25em] text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Fade Find
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Create Account</h1>
            <p className="text-sm text-gray-500">Join the Fade Find family today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Sara"
                    className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm outline-none transition-colors ${
                      errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                    }`}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Ahmed"
                    className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm outline-none transition-colors ${
                      errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                    }`}
                  />
                </div>
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="text-xs text-gray-500 flex items-center gap-1"
                >
                  {showPass ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-colors ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((s) => !s)}
                  className="text-xs text-gray-500 flex items-center gap-1"
                >
                  {showConfirmPass ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-colors ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Password strength visual */}
            {form.password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        form.password.length >= lvl * 2
                          ? lvl <= 1 ? '#f87171' : lvl <= 2 ? '#fb923c' : lvl <= 3 ? '#fbbf24' : '#34d399'
                          : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="text-amber-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
