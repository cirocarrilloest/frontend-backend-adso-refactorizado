// src/components/ui/Spinner.jsx
import { RefreshCw } from "lucide-react";

/**
 * Spinner reutilizable
 * @param {number} size - Tamaño en píxeles
 * @param {string} message - Mensaje opcional
 * @param {boolean} fullPage - Si ocupa toda la pantalla
 */
export const Spinner = ({ size = 24, message, fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <RefreshCw size={size} className="animate-spin text-amber-500" />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
};

export default Spinner;
