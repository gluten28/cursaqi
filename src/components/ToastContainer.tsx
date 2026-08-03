import React, { useEffect } from "react";
import { X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PlatformNotification } from "../types";

interface ToastItemProps {
  key?: React.Key;
  toast: PlatformNotification;
  onDismiss: (id: string) => void;
}

function ToastItemComponent({ toast, onDismiss }: ToastItemProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, y: 0, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="w-full max-w-sm bg-white border-2 border-slate-800 rounded-sm shadow-xl p-3.5 flex items-start gap-3.5 pointer-events-auto"
      id={`toast-item-${toast.id}`}
    >
      {/* Compact round illustrated thumbnail */}
      <img
        src={toast.imageUrl}
        alt={toast.type}
        className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0 shadow-2xs"
        referrerPolicy="no-referrer"
      />

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
            {toast.type.toUpperCase().replace("_", " ")}
          </span>
          <span className="text-[8px] font-mono text-slate-400 leading-none">
            Agora
          </span>
        </div>
        <h5 className="font-sans font-black text-[#0a2540] text-xs leading-tight mb-1">
          {toast.title}
        </h5>
        <p className="text-slate-600 font-sans text-[10px] leading-relaxed line-clamp-2">
          {toast.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-800 rounded-xs transition-colors cursor-pointer shrink-0"
        title="Disparar X"
        id={`toast-dismiss-${toast.id}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: PlatformNotification[];
  onDismissToast: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismissToast }: ToastContainerProps) {
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-h-[85vh] w-full max-w-sm pointer-events-none select-none overflow-hidden"
      id="cursaqi-toast-container"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItemComponent key={t.id} toast={t} onDismiss={onDismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
