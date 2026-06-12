// frontend/src/components/ui/PrecioFormateado.jsx
import { useConfig } from "../../context/ConfigContext";

export const PrecioFormateado = ({ valor, className = "" }) => {
  const { formatearPrecio } = useConfig();

  return <span className={className}>{formatearPrecio(valor)}</span>;
};

export default PrecioFormateado;
