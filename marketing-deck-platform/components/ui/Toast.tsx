import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export default function Toast({ message, open, onClose }: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-8 right-8 z-50 px-6 py-3 rounded-xl bg-white/10 border border-blue-500 text-white shadow-[0_0_30px_#3B82F680] backdrop-blur-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 