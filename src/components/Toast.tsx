import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

// Global event bus for non-blocking toast notifications
let notifyListener: ((toast: ToastItem) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'info') => {
  if (notifyListener) {
    notifyListener({
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      message,
      type,
    });
  } else {
    console.log(`[Toast ${type}]:`, message);
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    notifyListener = (newToast) => {
      setToasts((prev) => [...prev.slice(-3), newToast]); // keep up to 4 toasts
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    return () => {
      notifyListener = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border text-xs font-medium transition-all animate-in slide-in-from-top-2 duration-200 ${
              isSuccess
                ? 'bg-emerald-950 text-emerald-100 border-emerald-700/60 shadow-emerald-950/40'
                : isError
                ? 'bg-rose-950 text-rose-100 border-rose-700/60 shadow-rose-950/40'
                : isWarning
                ? 'bg-amber-950 text-amber-100 border-amber-700/60 shadow-amber-950/40'
                : 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
            </div>

            <div className="flex-1 leading-relaxed">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
