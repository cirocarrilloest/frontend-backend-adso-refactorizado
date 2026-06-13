// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
import Home from "./pages/Home.jsx";
import Servicios from "./pages/Servicios.jsx";
import Contacto from "./pages/Contacto.jsx";
import DashBoard from "./pages/DashBoard.jsx";

// Admin pages - IMPORTACIÓN DEFAULT (sin llaves)
import AdminInicioPage from "./pages/admin/AdminInicioPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import AdminCitasPage from "./pages/admin/AdminCitasPage";
import AdminServiciosPage from "./pages/admin/AdminServiciosPage";
import AdminReportesPage from "./pages/admin/AdminReportesPage";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
          </Route>

          {/* Dashboard legacy */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashBoard />} />
          </Route>

          {/* Rutas admin */}
          <Route
            element={
              <ProtectedRoute rolesPermitidos={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminInicioPage />} />
            <Route path="/admin/dashboard" element={<AdminInicioPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
            <Route path="/admin/citas" element={<AdminCitasPage />} />
            <Route path="/admin/servicios" element={<AdminServiciosPage />} />
            <Route path="/admin/reportes" element={<AdminReportesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
