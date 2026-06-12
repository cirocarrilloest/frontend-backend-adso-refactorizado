// frontend/src/components/dashboard/BarberoDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Zap,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../../context/AuthContext";
import { useCitas } from "../../hooks/useCitas";
import PerfilView from "./PerfilView";
import DrawerDetalleCita from "./DrawerDetalleCita";
import VistaAgendaSemanal from "./VistaAgendaSemanal";
import WidgetDisponibilidad from "./WidgetDisponibilidad";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";
import { useToast } from "../../context/ToastContext";

function VistaInicio({ barberoId }) {
  const { addToast } = useToast();
  const { citasBarbero, getResumenCitas, confirmarCita, finalizarCita } =
    useCitas();
  const [citas, setCitas] = useState([]);
  const [resumen, setResumen] = useState({
    pendiente: 0,
    confirmada: 0,
    completada: 0,
    cancelada: 0,
    total: 0,
    ingresos: 0,
  });
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
      // Cargar resumen de citas del barbero
      const resumenData = await getResumenCitas();
      console.log("Resumen recibido:", resumenData);
      if (resumenData?.resumen) {
        setResumen(resumenData.resumen);
      }

      // Cargar citas del día
      const citasData = await citasBarbero(barberoId, fecha);
      console.log("Citas del día:", citasData);
      if (citasData?.citas) {
        setCitas(citasData.citas);
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barberoId) {
      cargar(fechaSeleccionada);
    }
  }, [barberoId, fechaSeleccionada]);

  const handleConfirmar = async (e, id) => {
    e.stopPropagation();
    try {
      await confirmarCita(id);
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "confirmada" } : c)),
      );
      // Recargar resumen
      const resumenData = await getResumenCitas();
      if (resumenData?.resumen) {
        setResumen(resumenData.resumen);
      }
      addToast("Cita confirmada exitosamente", "success");
    } catch (e) {
      addToast(e.response?.data?.message || e.message, "error");
    }
  };

  const handleFinalizar = async (e, id) => {
    e.stopPropagation();
    try {
      await finalizarCita(id);
      setCitas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "completada" } : c)),
      );
      // Recargar resumen
      const resumenData = await getResumenCitas();
      if (resumenData?.resumen) {
        setResumen(resumenData.resumen);
      }
      addToast("Cita completada exitosamente", "success");
    } catch (e) {
      addToast(e.response?.data?.message || e.message, "error");
    }
  };

  const handleAccionAgenda = (citaActualizada) => {
    if (citaActualizada) {
      setCitas((prev) =>
        prev.map((c) =>
          c.id === citaActualizada.id
            ? { ...c, estado: citaActualizada.estado }
            : c,
        ),
      );
      // Recargar resumen
      getResumenCitas().then((resumenData) => {
        if (resumenData?.resumen) {
          setResumen(resumenData.resumen);
        }
      });
    }
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

  if (loading) return <Spinner />;
  if (error)
    return (
      <ErrorBanner message={error} onRetry={() => cargar(fechaSeleccionada)} />
    );

  return (
    <>
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-amber-500">
              {resumen.pendiente || 0}
            </p>
            <p className="text-xs text-gray-500">Pendientes</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-blue-500">
              {resumen.confirmada || 0}
            </p>
            <p className="text-xs text-gray-500">Confirmadas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-green-500">
              {resumen.completada || 0}
            </p>
            <p className="text-xs text-gray-500">Completadas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-red-500">
              {resumen.cancelada || 0}
            </p>
            <p className="text-xs text-gray-500">Canceladas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-purple-500">
              {resumen.total || 0}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border text-center">
            <p className="text-2xl font-bold text-emerald-500">
              ${resumen.ingresos || 0}
            </p>
            <p className="text-xs text-gray-500">Ingresos</p>
          </div>
        </div>

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
                  onKeyDown={(e) => e.key === "Enter" && setCitaIdDetalle(c.id)}
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
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {c.estado === "confirmada" && (
                      <button
                        onClick={(e) => handleFinalizar(e, c.id)}
                        title="Finalizar"
                        className="text-green-500 hover:text-green-700 transition-colors"
                      >
                        <CheckCircle2 size={16} />
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
        </div>
      </div>
      <DrawerDetalleCita
        citaId={citaIdDetalle}
        onClose={() => setCitaIdDetalle(null)}
        rol="barbero"
        onAccion={handleAccionAgenda}
      />
    </>
  );
}

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
