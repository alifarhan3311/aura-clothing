import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { authApi } from '../lib/api';
import { showSuccess, showError } from '../lib/toastUtils';

const RESEND_COOLDOWN = 60; // 60 seconds cooldown

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state: 1 = Request OTP, 2 = Verify OTP & Reset Password, 3 = Success
  const initialEmail = searchParams.get('email') || '';
  const initialStep = searchParams.get('step') === '2' ? 2 : 1;
  const [step, setStep] = useState(initialStep);

  // Form fields
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Loading & Timer states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // ── Cooldown Timer ─────────────────────────────────────────────────────────
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Step 1: Send OTP to Email ──────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      showError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: cleanEmail });
      showSuccess(res.message || 'Verification OTP sent to your email!');
      setStep(2);
      startCooldown();
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } catch (err) {
      showError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP Action ───────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      showError('Please provide your email address');
      setStep(1);
      return;
    }

    setResending(true);
    try {
      const res = await authApi.resendForgotPasswordOTP({ email: cleanEmail });
      showSuccess(res.message || 'A fresh 6-digit OTP code has been sent!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      startCooldown();
    } catch (err) {
      showError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── OTP input management ───────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      nextOtp[i] = char;
    });
    setOtp(nextOtp);
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  // ── Step 2: Reset Password Submit ───────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const fullOtp = otp.join('');

    if (!cleanEmail) {
      showError('Email address is required');
      setStep(1);
      return;
    }
    if (fullOtp.length !== 6) {
      showError('Please enter the complete 6-digit OTP code');
      return;
    }
    if (!newPassword) {
      showError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.updatePassword({
        email: cleanEmail,
        otp: fullOtp,
        newPassword,
      });

      showSuccess(res.message || 'Password reset successfully! You can now log in.');
      setStep(3);
    } catch (err) {
      showError(err.message || 'Invalid or expired OTP. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const allOtpFilled = otp.every((d) => d !== '');

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-gray-100 relative">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <Link to="/">
              <span
                className="text-2xl font-black tracking-[0.25em] text-gray-900"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Fade Find
              </span>
            </Link>
          </div>

          {/* Progress Indicator */}
          {step !== 3 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === 1
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>1. Email</span>
              </button>
              <span className="text-gray-300">──</span>
              <button
                type="button"
                onClick={() => {
                  if (!email.trim()) {
                    showError('Please enter your email first');
                  } else {
                    setStep(2);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === 2
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>2. OTP & Password</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 1: Enter Email & Request OTP                                 */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                  <KeyRound size={26} className="text-[#c9a96e]" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Reset Your Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
                  Enter your email address and we'll send you a 6-digit OTP code to verify your identity.
                </p>

                <form onSubmit={handleSendOtp} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#c9a96e] hover:text-gray-950 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Sending OTP Code…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Send 6-Digit OTP</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Direct link to step 2 if user already has code */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!email.trim()) {
                        showError('Please enter your email first');
                      } else {
                        setStep(2);
                      }
                    }}
                    className="text-xs font-semibold text-[#c9a96e] hover:text-amber-800 hover:underline flex items-center justify-center gap-1"
                  >
                    <span>Already have an OTP code? Enter it here</span>
                    <ArrowRight size={12} />
                  </button>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors mt-1"
                  >
                    <ArrowLeft size={12} /> Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 2: Enter OTP, 60s Resend, and Set New Password               */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                  <ShieldCheck size={26} className="text-[#c9a96e]" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Enter OTP & New Password
                </h1>
                <p className="text-xs text-gray-500 mb-5">
                  Code sent to <strong className="text-gray-800">{email || 'your email'}</strong>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-block ml-1.5 text-[#c9a96e] font-semibold hover:underline"
                  >
                    (Change)
                  </button>
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                  {/* If email wasn't set, allow editing */}
                  {!email && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#c9a96e]"
                      />
                    </div>
                  )}

                  {/* 6-Digit OTP Boxes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 text-center">
                      Enter 6-Digit OTP Code
                    </label>
                    <div
                      className="flex justify-center gap-1.5 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (inputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-10 h-12 sm:w-11 sm:h-13 text-center font-bold text-lg rounded-xl border-2 outline-none transition-all ${
                            digit
                              ? 'border-[#c9a96e] bg-[#f0e4cc]/20 text-gray-900'
                              : 'border-gray-200 bg-gray-50 text-gray-900'
                          } focus:border-[#c9a96e] focus:bg-white focus:ring-2 focus:ring-[#c9a96e]/20`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 60-Second Cooldown Resend Box */}
                  <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Didn't receive code?</span>
                    {cooldown > 0 ? (
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                        <RefreshCw size={11} className="animate-spin text-amber-700" />
                        <span>Resend in {cooldown}s</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="font-bold text-[#b07d3a] hover:text-amber-900 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                        <span>{resending ? 'Sending…' : 'Resend OTP'}</span>
                      </button>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 transition-all placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        tabIndex={-1}
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 transition-all placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        tabIndex={-1}
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Reset Password Button */}
                  <button
                    type="submit"
                    disabled={loading || !allOtpFilled || !newPassword || !confirmPassword}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#c9a96e] hover:text-gray-950 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Updating Password…</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> Back to Step 1
                  </button>

                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-900 font-semibold"
                  >
                    Cancel
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* STEP 3: Success Screen                                            */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Password Reset Complete!
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
                  Your password has been successfully updated. You can now sign in to your Fade Find account with your new credentials.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#c9a96e] hover:text-gray-950 transition-all duration-200 shadow-sm"
                >
                  Proceed to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
