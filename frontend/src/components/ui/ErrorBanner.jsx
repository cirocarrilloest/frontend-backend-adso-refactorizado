// frontend/src/components/ui/ErrorBanner.jsx
import { AlertCircle } from "lucide-react";

export const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
};
