import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { showSuccess, showError } from '../lib/toastUtils';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const from = location.state?.from || (new URLSearchParams(location.search)).get('redirect') || null;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const res = await login(form.email, form.password);

        showSuccess('Welcome back to Fade Find! 👋');

        const destination = from || (res.user?.role === 'admin' ? '/admin' : '/');
        navigate(destination, { replace: true });
        setForm({ email: '', password: '' });
      } catch (err) {
        if (err.data?.needsVerification) {
          showSuccess(err.data.message || 'Account not verified yet. A fresh 6-digit OTP has been sent to your email!');
          navigate('/verify-otp', {
            state: {
              email: err.data.email || form.email.trim(),
              from,
            },
          });
          return;
        }
        showError(err.message || 'Login failed');
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
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/">
              <span className="text-2xl font-black tracking-[0.25em] text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Fade Find
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Welcome Back</h1>
            <p className="text-sm text-gray-500">Sign in to your Fade Find account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <Link to="/forgot-password" className="text-xs text-amber-700 hover:underline font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3.5 rounded-xl border text-sm outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                />
                <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors duration-200 mt-2"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to Fade Find?{' '}
            <Link to="/register" state={{ from }} className="text-amber-700 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
