import { createContext, useContext, useMemo, useState } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "success") {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4000);
  }

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.type === "error" ? XCircle : toast.type === "info" ? Info : CheckCircle;
          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-soft"
              role="status"
            >
              <Icon className={toast.type === "error" ? "h-5 w-5 text-red-600" : "h-5 w-5 text-emerald-600"} />
              <p className="flex-1 text-slate-700">{toast.message}</p>
              <button
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
