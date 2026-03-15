import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white pointer-events-auto rounded-4xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              {/* Decorative top bar */}
              <div className="h-2 w-full bg-red-500 absolute top-0 left-0"></div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle size={32} strokeWidth={2.5} />
                  </div>
                  <button 
                    onClick={onCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={20} className="stroke-3" />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">{message}</p>

                <div className="flex gap-4">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
