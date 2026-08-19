import React from 'react';
import { useStore } from '../hooks/useStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast, language } = useStore();

  if (!toast) return null;

  const isAr = language === 'ar';

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#2D5A27] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  return (
    <AnimatePresence>
      <div
        id="app-toast-container"
        className={`fixed bottom-6 z-50 flex flex-col gap-2 max-w-sm w-full px-4 ${
          isAr ? 'left-6' : 'right-6'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-md border border-[#2D5A27]/15 rounded-2xl p-4 shadow-xl flex items-start gap-3 text-[#1C241E]"
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#1C241E]">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
