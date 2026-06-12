// src/components/ui/ErrorBanner.jsx
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Banner de error reutilizable
 * @param {string} message - Mensaje de error
 * @param {function} onRetry - Función opcional para reintentar
 */
export const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-sm">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
        >
          <RefreshCw size={11} /> Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
