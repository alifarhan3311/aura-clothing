import React, { useEffect } from 'react';
import { X, PlusCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminFormModal({ isOpen, onClose, title, isEdit = false, children }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-8 overflow-hidden flex flex-col z-10 max-h-[88vh]"
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${
                isEdit ? 'bg-amber-50/40' : 'bg-[#c9a96e]/6'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    isEdit
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-[#c9a96e]/12 text-[#c9a96e] border-[#c9a96e]/25'
                  }`}
                >
                  {isEdit ? <Edit3 size={17} /> : <PlusCircle size={17} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{title}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isEdit ? 'Update the record details below.' : 'Fill out the form to create a new entry.'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-all shrink-0 ml-3"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form Content Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
