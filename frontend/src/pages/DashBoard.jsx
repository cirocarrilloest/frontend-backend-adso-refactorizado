// src/pages/DashBoard.jsx
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import BarberoDashboard from "../components/dashboard/BarberoDashboard";
import ClienteDashboard from "../components/dashboard/ClienteDashboard";

/**
 * Punto de entrada del dashboard.
 * Lee el rol del usuario autenticado y renderiza
 * el dashboard correspondiente.
 */
export default function DashBoard() {
  const { usuario } = useAuth();

  if (usuario?.rol === "admin") return <AdminDashboard />;
  if (usuario?.rol === "barbero") return <BarberoDashboard />;
  return <ClienteDashboard />;
}
