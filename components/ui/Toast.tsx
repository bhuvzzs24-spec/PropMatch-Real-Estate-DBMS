'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastMsg {
  id: number;
  text: string;
  variant: 'success' | 'error' | 'info';
}

const ToastContext = createContext<((text: string, variant?: ToastMsg['variant']) => void) | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = useCallback((text: string, variant: ToastMsg['variant'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, variant }]);
    setTimeout(() => setToasts((t) => t.filter((m) => m.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
              t.variant === 'success'
                ? 'bg-emerald-600 text-white'
                : t.variant === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-white'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
