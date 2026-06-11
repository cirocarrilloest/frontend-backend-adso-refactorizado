// frontend/src/components/dashboard/BarberoDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  User,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../../context/AuthContext";
import {
  getAgendaDia,
  getResumenCitas,
  confirmarCita,
  finalizarCita,
} from "../../services/citaService";
import PerfilView from "./PerfilView";
import DrawerDetalleCita from "./DrawerDetalleCita";
import VistaAgendaSemanal from "./VistaAgendaSemanal";
import WidgetDisponibilidad from "./WidgetDisponibilidad"; // ← NUEVO

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <RefreshCw size={20} className="animate-spin text-amber-400" />
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      <AlertCircle size={16} /> {msg}
    </div>
  );
}

// Vista Inicio con Drawer integrado
function VistaInicio({ barberoId }) {
  const [citas, setCitas] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [citaIdDetalle, setCitaIdDetalle] = useState(null);

  const cargar = async (fecha) => {
    setLoading(true);
    setError(null);
    try {
      const [agenda, res] = await Promise.all([
        getAgendaDia(fecha),
        getResumenCitas(),
      ]);
      setCitas(agenda.citas || []);
      setResumen(res.resumen || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(fechaSeleccionada);
  }, [fechaSeleccionada]);

  // Acciones rápidas con stopPropagation para no abrir el drawer
  const handleConfirmar = async (e, id) => {
    e.stopPropagation();
    try {
      await confirmarCita(id);
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "confirmada" } : c)),
      );
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleFinalizar = async (e, id) => {
    e.stopPropagation();
    try {
      await finalizarCita(id);
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "completada" } : c)),
      );
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  // Sincroniza cambios del drawer al estado local
  const handleAccionAgenda = (citaActualizada) => {
    if (!citaActualizada) return;
    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaActualizada.id
          ? { ...c, estado: citaActualizada.estado }
          : c,
      ),
    );
  };

  const estadoStyle = {
    completada:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    confirmada:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pendiente:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    cancelada: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  // Totales del resumen
  const totalResumen = resumen.reduce((acc, r) => {
    acc[r.estado] = r.total;
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Completadas",
              val: totalResumen.completada || 0,
              color: "text-green-500",
            },
            {
              label: "Confirmadas",
              val: totalResumen.confirmada || 0,
              color: "text-blue-500",
            },
            {
              label: "Pendientes",
              val: totalResumen.pendiente || 0,
              color: "text-amber-500",
            },
            {
              label: "Canceladas",
              val: totalResumen.cancelada || 0,
              color: "text-red-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 text-center"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Agenda */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Agenda del día
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Clic en una cita para ver el detalle
              </p>
            </div>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm"
            />
          </div>

          {loading && <Spinner />}
          {error && (
            <div className="px-5 pb-4">
              <ErrorBanner msg={error} />
            </div>
          )}

          {!loading && !error && (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {citas.length === 0 && (
                <p className="text-sm text-gray-400 px-5 py-6 text-center">
                  Sin citas para este día
                </p>
              )}
              {citas.map((c) => {
                const hora =
                  typeof c.hora === "string" ? c.hora.slice(0, 5) : c.hora;
                return (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCitaIdDetalle(c.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setCitaIdDetalle(c.id)
                    }
                    className="group flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
                  >
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {hora}
                      </p>
                      <p className="text-xs text-gray-400">{c.duracion}min</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {c.cliente_nombre}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.servicio_nombre} · ${c.precio}
                      </p>
                      {c.notas && (
                        <p className="text-xs text-gray-400 italic mt-0.5">
                          "{c.notas}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoStyle[c.estado]}`}
                      >
                        {c.estado}
                      </span>
                      {c.estado === "pendiente" && (
                        <button
                          onClick={(e) => handleConfirmar(e, c.id)}
                          title="Confirmar"
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {c.estado === "confirmada" && (
                        <button
                          onClick={(e) => handleFinalizar(e, c.id)}
                          title="Finalizar"
                          className="text-green-500 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <ChevronRight
                        size={14}
                        className="text-gray-300 dark:text-gray-600 group-hover:text-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawer detalle */}
      <DrawerDetalleCita
        citaId={citaIdDetalle}
        onClose={() => setCitaIdDetalle(null)}
        rol="barbero"
        onAccion={handleAccionAgenda}
      />
    </>
  );
}

// ── Vista Disponibilidad ──────────────────────────────────────────────────────
// Wrapper mínimo que pasa el barberoId del usuario autenticado
function VistaDisponibilidad({ barberoId, barberoNombre }) {
  return (
    <div className="max-w-2xl mx-auto">
      <WidgetDisponibilidad
        barberoId={barberoId}
        barberoNombre={barberoNombre}
      />
    </div>
  );
}

// Shell principal
export default function BarberoDashboard() {
  const { usuario } = useAuth();
  const [vista, setVista] = useState("inicio");

  const navItems = [
    {
      name: "Inicio",
      icon: <LayoutDashboard size={16} />,
      onClick: () => setVista("inicio"),
    },
    {
      name: "Semana",
      icon: <CalendarDays size={16} />,
      onClick: () => setVista("semana"),
    },
    {
      name: "Disponibilidad",
      icon: <Zap size={16} />,
      onClick: () => setVista("disponibilidad"),
    },
    {
      name: "Mi perfil",
      icon: <User size={16} />,
      onClick: () => setVista("perfil"),
    },
  ];

  const titulos = {
    inicio: "Mi Dashboard",
    semana: "Agenda Semanal",
    disponibilidad: "Disponibilidad",
    perfil: "Mi Perfil",
  };

  return (
    <DashboardShell navItems={navItems} titulo={titulos[vista] || "Dashboard"}>
      {vista === "inicio" && <VistaInicio barberoId={usuario?.id} />}
      {vista === "semana" && <VistaAgendaSemanal barberoId={usuario?.id} />}
      {vista === "disponibilidad" && (
        <VistaDisponibilidad
          barberoId={usuario?.id}
          barberoNombre={usuario?.nombre}
        />
      )}
      {vista === "perfil" && <PerfilView />}
    </DashboardShell>
  );
}
