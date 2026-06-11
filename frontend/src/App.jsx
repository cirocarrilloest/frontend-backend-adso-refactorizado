// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home.jsx";
import Servicios from "./pages/Servicios.jsx";
import Contacto from "./pages/Contacto.jsx";
import DashBoard from "./pages/DashBoard.jsx";

// Nuevos imports para admin
import { AdminLayout } from "./pages/admin/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";
import { CitasPage } from "./pages/admin/CitasPage";
import { ServiciosPage } from "./pages/admin/ServiciosPage";
import { ConfiguracionPage } from "./pages/admin/ConfiguracionPage";
import { ReportesPage } from "./pages/admin/ReportesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* Dashboard legacy - mantiene compatibilidad */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashBoard />} />
        </Route>

        {/* NUEVAS RUTAS DE ADMIN - ESTRUCTURA MODULAR */}
        <Route
          element={
            <ProtectedRoute rolesPermitidos={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
          <Route path="/admin/citas" element={<CitasPage />} />
          <Route path="/admin/servicios" element={<ServiciosPage />} />
          <Route path="/admin/configuracion" element={<ConfiguracionPage />} />
          <Route path="/admin/reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
