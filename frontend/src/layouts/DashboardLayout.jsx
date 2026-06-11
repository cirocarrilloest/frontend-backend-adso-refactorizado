// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";

/**
 * Layout del dashboard: solo envuelve el Outlet.
 * El sidebar y el header viven dentro de DashboardShell,
 * que cada vista de rol renderiza internamente.
 */
function DashboardLayout() {
  return <Outlet />;
}

export default DashboardLayout;
