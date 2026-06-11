// frontend/src/components/ui/PrecioFormateado.jsx
import { useConfig } from "../../hooks/useConfig";

export const PrecioFormateado = ({ valor, className = "" }) => {
  const { formatearPrecio } = useConfig();

  return <span className={className}>{formatearPrecio(valor)}</span>;
};
