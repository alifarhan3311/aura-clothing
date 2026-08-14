import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '../lib/toastUtils';
import { authApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  // email passed from Register page via router state
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds remaining

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // If no email in state, try to read from a manual input
  const hasEmail = Boolean(email.trim());

  // Start cooldown timer
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Kick off initial cooldown immediately (OTP was just sent on registration)
  useEffect(() => {
    if (hasEmail) startCooldown();
    return () => clearInterval(timerRef.current);
  }, []);

  // ── OTP input handlers ───────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Verify submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      showError('Please enter the complete 6-digit code');
      return;
    }
    if (!email.trim()) {
      showError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email.trim(), fullOtp);
      showSuccess(res.message || 'Email verified! Welcome 🎉');
      // verifyOTP saves session internally, redirect home or admin
      navigate(res.user?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      showError(err.message || 'Invalid or expired OTP');
      // shake the inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (!email.trim()) {
      showError('Enter your email first');
      return;
    }
    setResending(true);
    try {
      const res = await authApi.resendOTP({ email: email.trim() });
      showSuccess(res.message || 'New OTP sent! Check your inbox.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startCooldown();
    } catch (err) {
      showError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const allFilled = otp.every((d) => d !== '');

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">

          {/* Logo */}
          <Link to="/">
            <span className="text-xl font-black tracking-[0.25em] text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Fade Find
            </span>
          </Link>

          {/* Icon */}
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mt-6 mb-4">
            <KeyRound size={30} className="text-[#c9a96e]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mb-6">
            {hasEmail ? (
              <>We sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span></>
            ) : (
              'Enter your email and the 6-digit code we sent.'
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* If no email passed, show input */}
            {!hasEmail && (
              <div className="text-left">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c9a96e] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* OTP boxes */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-bold text-xl rounded-xl border-2 outline-none transition-all
                    ${digit ? 'border-[#c9a96e] bg-[#f0e4cc]/30 text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-900'}
                    focus:border-[#c9a96e] focus:bg-white focus:ring-2 focus:ring-[#c9a96e]/20`}
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading || !allFilled}
              className="w-full py-3.5 bg-gray-900 hover:bg-[#c9a96e] text-white font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Verifying…</>
              ) : (
                <><ShieldCheck size={18} /> Verify Account</>
              )}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>

            {cooldown > 0 ? (
              <div className="flex items-center justify-center gap-2">
                {/* Circular countdown */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#c9a96e" strokeWidth="2.5"
                      strokeDasharray={`${(cooldown / RESEND_COOLDOWN) * 100} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                    {cooldown}s
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium">Resend available in {cooldown}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#c9a96e] border border-[#c9a96e]/40 rounded-xl hover:bg-[#f0e4cc]/40 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            )}
          </div>

          {/* Back to login */}
          <Link
            to="/login"
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={12} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
