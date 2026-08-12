import React from 'react';
import { X, PlusCircle, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminFormModal({ isOpen, onClose, title, isEdit = false, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl my-8 overflow-hidden flex flex-col z-10 max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              {isEdit ? (
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Edit3 size={18} />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-[#c9a96e]/15 text-[#c9a96e] border border-[#c9a96e]/30">
                  <PlusCircle size={18} />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">
                  {isEdit ? 'Update existing record details below.' : 'Fill out the form fields to create a new entry.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
