// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege rutas que requieren sesión activa.
 * Si no hay token, redirige a Home ("/").
 */
function ProtectedRoute({ children, rolesPermitidos }) {
  const { token, usuario } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  // Si se especifican roles, verifica que el usuario tenga el rol correcto
  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
