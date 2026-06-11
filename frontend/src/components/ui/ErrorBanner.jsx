// frontend/src/components/ui/ErrorBanner.jsx
/**
 * ErrorBanner.jsx — Componente compartido
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: definido localmente en ~8 archivos como:
 *   function ErrorBanner({ msg }) { if (!msg) return null; ... }
 * - Inconsistencia: algunos usaban `msg`, otros `message`, otros `error`
 * - Solución: un componente con prop `message` + soporte opcional de retry
 *
 * USO:
 *   <ErrorBanner message="Error al cargar datos" />
 *   <ErrorBanner message={error} onRetry={cargarDatos} />
 */

import { AlertCircle, RefreshCw } from "lucide-react";

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
