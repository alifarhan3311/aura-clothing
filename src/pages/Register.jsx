import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      toast.success('Account created! Welcome to MH Clothing 🎉', {
        style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  const fields = [
    { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Sara Ahmed' },
    { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@example.com' },
    { name: 'password', label: 'Password', icon: Lock, type: showPass ? 'text' : 'password', placeholder: 'Min 8 characters' },
    { name: 'confirmPassword', label: 'Confirm Password', icon: Lock, type: showPass ? 'text' : 'password', placeholder: 'Re-enter your password' },
  ];

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
                MH Clothing
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Create Account</h1>
            <p className="text-sm text-gray-500">Join the MH Clothing family today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, icon: Icon, type, placeholder }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">{label}</label>
                  {(name === 'password' || name === 'confirmPassword') && name === 'password' && (
                    <button type="button" onClick={() => setShowPass((s) => !s)} className="text-xs text-gray-500 flex items-center gap-1">
                      {showPass ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Show</>}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-colors ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
                  />
                </div>
                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
              </div>
            ))}

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
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors duration-200 mt-2"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
