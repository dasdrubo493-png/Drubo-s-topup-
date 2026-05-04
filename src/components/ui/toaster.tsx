import React, { createContext, useContext, useState } from 'react';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...props, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Attach to window so we can use it simply in our App without full provider setup
  // Wait, Toaster needs to provide this. Let's just make a simple global store for toasts.
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`p-4 rounded-md shadow-lg font-sans text-sm ${t.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-brand-card border border-white/10 text-white'}`}>
          <div className="font-semibold">{t.title}</div>
          {t.description && <div className="text-white/70">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}

// Global toast function
let addToast = (props: ToastProps) => {};
export const toast = (props: ToastProps) => addToast(props);

export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  React.useEffect(() => {
    addToast = (props: ToastProps) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...props, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`p-4 rounded-md shadow-lg pointer-events-auto min-w-[300px] font-sans text-sm ${t.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-brand-card border border-brand-red/30 text-white'}`}>
          <div className="font-semibold">{t.title}</div>
          {t.description && <div className="text-white/70 mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
