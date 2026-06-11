// frontend/src/components/ui/Spinner.jsx
import { RefreshCw } from "lucide-react";

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <RefreshCw size={24} className="animate-spin text-amber-500" />
    </div>
  );
};
