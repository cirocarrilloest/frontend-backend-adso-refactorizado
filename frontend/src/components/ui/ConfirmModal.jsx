// frontend/src/components/ui/ConfirmModal.jsx
import { AlertTriangle } from "lucide-react";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Confirmar"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
