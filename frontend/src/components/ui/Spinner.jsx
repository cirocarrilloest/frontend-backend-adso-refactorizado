// frontend/src/components/ui/Spinner.jsx
/**
 * Spinner.jsx — Componente compartido
 *
 * REFACTORIZACIÓN:
 * - Problema anterior: definido como función local en ~10 archivos distintos
 *   (AdminDashboard, BarberoDashboard, ClienteDashboard, PerfilView, etc.)
 * - Cada copia tenía ligeras variaciones (tamaños, mensajes) sin razón
 * - Solución: un solo componente con props para variantes
 *
 * USO:
 *   <Spinner />                    — spinner centrado, tamaño estándar
 *   <Spinner size={16} />          — tamaño personalizado
 *   <Spinner message="Cargando..." />  — con texto descriptivo
 *   <Spinner fullPage />           — ocupa toda la pantalla
 */

import { RefreshCw } from "lucide-react";

export const Spinner = ({ size = 24, message, fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <RefreshCw size={size} className="animate-spin text-amber-500" />
      {message && <p className="text-xs text-gray-400">{message}</p>}
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
    <div className="flex items-center justify-center py-10">{content}</div>
  );
};

export default Spinner;
