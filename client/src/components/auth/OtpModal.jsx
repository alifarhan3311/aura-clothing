import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function OtpModal({ isOpen, onClose, email, onSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOTP } = useAuth();

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email, fullOtp);
      toast.success(res.message || 'Email verified successfully! 🎉', {
        style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
        iconTheme: { primary: '#c9a96e', secondary: '#fff' },
      });
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await authApi.resendOTP({ email });
      toast.success(res.message || 'A new OTP has been sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 w-full max-w-md z-10 text-center space-y-5"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 bg-amber-50 text-[#c9a96e] rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <KeyRound size={28} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Enter OTP Code</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              We sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 text-center font-bold text-lg text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-[#c9a96e] transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 hover:bg-[#c9a96e] text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify Account</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-[#c9a96e] hover:text-amber-800 flex items-center gap-1 hover:underline disabled:opacity-50"
            >
              <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
              <span>Resend OTP</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
