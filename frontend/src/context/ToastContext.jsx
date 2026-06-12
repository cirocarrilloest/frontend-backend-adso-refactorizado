// src/context/ToastContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

const Toast = ({ id, type, message, onClose }) => {
  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 mb-2 animate-in slide-in-from-right duration-300 min-w-[280px] max-w-md">
      {icons[type]}
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        {message}
      </span>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0); // ✅ Contador para IDs únicos

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    // ✅ ID único usando contador + timestamp
    toastCounter.current += 1;
    const id = `${Date.now()}-${toastCounter.current}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
