// frontend/src/components/dashboard/AdminDashboard.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  BarChart2,
  Mail,
  List,
  CalendarPlus,
  DollarSign,
  Clock,
} from "lucide-react";
import DashboardShell from "./DashboardShell";
import AdminCrearCita from "./AdminCrearCita";
import VistaTodasLasCitas from "../admin/VistaTodasLasCitas";
import { useCitas } from "../../hooks/useCitas";
import { useUsuarios } from "../../hooks/useUsuarios";
import { useServicios } from "../../hooks/useServicios";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";

// Vistas importadas (estos archivos deben existir en src/pages/admin/)
import AdminInicioPage from "../../pages/admin/AdminInicioPage";
import AdminUsuariosPage from "../../pages/admin/AdminUsuariosPage";
import AdminServiciosPage from "../../pages/admin/AdminServiciosPage";
import AdminHorariosPage from "../../pages/admin/AdminHorariosPage";
import AdminCitasPage from "../../pages/admin/AdminCitasPage";
import AdminMensajesPage from "../../pages/admin/AdminMensajesPage";
import AdminReportesPage from "../../pages/admin/AdminReportesPage";
import AdminReporteIngresosPage from "../../pages/admin/AdminReporteIngresosPage";

const VISTAS = {
  inicio: <AdminInicioPage />,
  usuarios: <AdminUsuariosPage />,
  servicios: <AdminServiciosPage />,
  horarios: <AdminHorariosPage />,
  citas: <AdminCitasPage />,
  crearCita: <AdminCrearCita />,
  todasCitas: <VistaTodasLasCitas />,
  mensajes: <AdminMensajesPage />,
  reportes: <AdminReportesPage />,
  reporteIngresos: <AdminReporteIngresosPage />,
};

const NAV_ITEMS = [
  { name: "Resumen", id: "inicio", icon: <LayoutDashboard size={16} /> },
  { name: "Usuarios", id: "usuarios", icon: <Users size={16} /> },
  { name: "Servicios", id: "servicios", icon: <Scissors size={16} /> },
  { name: "Horarios", id: "horarios", icon: <Clock size={16} /> },
  { name: "Citas por barbero", id: "citas", icon: <Calendar size={16} /> },
  { name: "Crear Cita", id: "crearCita", icon: <CalendarPlus size={16} /> },
  { name: "Gestión Global", id: "todasCitas", icon: <List size={16} /> },
  { name: "Mensajes", id: "mensajes", icon: <Mail size={16} /> },
  { name: "Reportes", id: "reportes", icon: <BarChart2 size={16} /> },
  {
    name: "Reporte Ingresos",
    id: "reporteIngresos",
    icon: <DollarSign size={16} />,
  },
];

export default function AdminDashboard() {
  const [vista, setVista] = useState("inicio");

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    onClick: () => setVista(item.id),
  }));

  return (
    <DashboardShell
      navItems={navItems}
      titulo={NAV_ITEMS.find((i) => i.id === vista)?.name || "Dashboard"}
    >
      {VISTAS[vista]}
    </DashboardShell>
  );
}
