// frontend/src/components/dashboard/DrawerDetalleCita.jsx
//

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Scissors,
  User,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Hash,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass,
  BadgeCheck,
  PhoneCall,
  Mail,
  CalendarClock,
  Edit, // Añadido
} from "lucide-react";
import {
  getCitaById,
  cancelarCita,
  confirmarCita,
  finalizarCita,
  actualizarEstadoCita,
} from "../../services/citaService";
import ModalEditarCita from "../admin/ModalEditarCita"; // Añadido

//  helpers

const fmtFecha = (raw) => {
  if (!raw) return "—";
  const d = new Date(String(raw).includes("T") ? raw : `${raw}T12:00:00`);
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const fmtHora = (raw) => String(raw || "").slice(0, 5);

const fmtPrecio = (n) =>
  Number(n || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const fmtTs = (raw) => {
  if (!raw) return "—";
  return new Date(raw).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ESTADO_CFG = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-amber-400",
    ring: "ring-amber-300",
    Icon: Hourglass,
    text: "text-amber-700 dark:text-amber-300",
  },
  confirmada: {
    label: "Confirmada",
    bg: "bg-blue-500",
    ring: "ring-blue-300",
    Icon: BadgeCheck,
    text: "text-blue-700 dark:text-blue-300",
  },
  completada: {
    label: "Completada",
    bg: "bg-green-500",
    ring: "ring-green-300",
    Icon: CheckCircle2,
    text: "text-green-700 dark:text-green-300",
  },
  cancelada: {
    label: "Cancelada",
    bg: "bg-gray-400",
    ring: "ring-gray-300",
    Icon: XCircle,
    text: "text-gray-600 dark:text-gray-400",
  },
};

// Lista de todos los estados para el selector del admin
const TODOS_LOS_ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "completada", label: "Completada" },
  { value: "cancelada", label: "Cancelada" },
];

// sub-componentes

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3">
      <RefreshCw size={24} className="animate-spin text-amber-400" />
      <p className="text-xs text-gray-400">Cargando detalle…</p>
    </div>
  );
}

function ErrorView({ msg, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <p className="text-sm text-red-600 dark:text-red-400">{msg}</p>
      <button
        onClick={onRetry}
        className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
      >
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );
}

// Fila de dato con icono
function DataRow({ icon: Icon, label, value, accent = false, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div
        className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
        ${
          accent
            ? "bg-amber-100 dark:bg-amber-900/30"
            : "bg-gray-100 dark:bg-gray-700/50"
        }
      `}
      >
        <Icon
          size={14}
          className={
            accent
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-500 dark:text-gray-400"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-1">
          {label}
        </p>
        <p
          className={`text-sm text-gray-900 dark:text-white leading-snug ${mono ? "font-mono" : "font-medium"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// Badge de estado grande
function EstadoBadge({ estado }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG.cancelada;
  const Icon = cfg.Icon;
  return (
    <div
      className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      ring-4 ring-opacity-20 ${cfg.ring}
      ${cfg.bg} bg-opacity-15 dark:bg-opacity-20
    `}
    >
      <Icon size={14} className={cfg.text} />
      <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

// Botón de acción primaria
function AccionBtn({ onClick, loading, disabled, color, children }) {
  const clr =
    {
      amber: "bg-amber-400 hover:bg-amber-300 text-gray-900",
      green: "bg-green-500 hover:bg-green-400 text-white",
      red: "bg-red-500 hover:bg-red-400 text-white",
      blue: "bg-blue-500 hover:bg-blue-400 text-white",
    }[color] || "bg-gray-200 text-gray-800";

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        flex-1 flex items-center justify-center gap-2
        py-2.5 rounded-xl text-sm font-bold
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${clr}
      `}
    >
      {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
    </button>
  );
}

//  Drawer principal
export default function DrawerDetalleCita({
  citaId,
  onClose,
  rol = "cliente",
  onAccion,
}) {
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accionando, setAccionando] = useState(null); // "cancelar"|"confirmar"|"finalizar"|"cambiarEstado"
  const [errorAccion, setErrorAccion] = useState(null);

  // Estados para el modal de edición (AÑADIDO)
  const [editModalOpen, setEditModalOpen] = useState(false);

  const cargar = useCallback(async () => {
    if (!citaId) return;
    setLoading(true);
    setError(null);
    setCita(null);
    try {
      const r = await getCitaById(citaId);
      setCita(r.cita);
    } catch (e) {
      setError(e.response?.data?.message || "No se pudo cargar la cita");
    } finally {
      setLoading(false);
    }
  }, [citaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Cerrar con Escape
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // acciones específicas (confirmar, finalizar, cancelar)
  const ejecutarAccion = async (tipo, fn) => {
    setAccionando(tipo);
    setErrorAccion(null);
    try {
      const r = await fn(citaId);
      setCita(
        r.cita || {
          ...cita,
          estado:
            tipo === "cancelar"
              ? "cancelada"
              : tipo === "confirmar"
                ? "confirmada"
                : "completada",
        },
      );
      onAccion?.(r.cita);
    } catch (e) {
      setErrorAccion(
        e.response?.data?.message || "No se pudo completar la acción",
      );
    } finally {
      setAccionando(null);
    }
  };

  // NUEVA: acción universal de cambio de estado (solo admin)
  const handleCambioEstadoUniversal = async (nuevoEstado) => {
    if (nuevoEstado === cita.estado) return;

    setAccionando("cambiarEstado");
    setErrorAccion(null);
    try {
      const r = await actualizarEstadoCita(citaId, nuevoEstado);
      // Recargar la cita para obtener los datos actualizados
      const refreshed = await getCitaById(citaId);
      setCita(refreshed.cita);
      onAccion?.(refreshed.cita);
    } catch (e) {
      setErrorAccion(
        e.response?.data?.message || "No se pudo cambiar el estado",
      );
    } finally {
      setAccionando(null);
    }
  };

  // Funciones para el modal de edición (AÑADIDO)
  const handleAbrirEditar = () => setEditModalOpen(true);
  const handleCerrarEditar = () => setEditModalOpen(false);

  const handleCitaActualizada = () => {
    handleCerrarEditar();
    cargar(); // Recargar la cita actualizada
    onAccion?.(); // Notificar al padre
  };

  const handleCancelar = () => ejecutarAccion("cancelar", cancelarCita);
  const handleConfirmar = () => ejecutarAccion("confirmar", confirmarCita);
  const handleFinalizar = () => ejecutarAccion("finalizar", finalizarCita);

  const esAdmin = rol === "admin";

  // render
  if (!citaId) return null;

  const isOpen = !!citaId;

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 bottom-0 z-50
          w-full max-w-sm
          bg-white dark:bg-gray-900
          shadow-2xl shadow-black/20
          flex flex-col
          border-l border-gray-100 dark:border-white/8
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Franja de color según estado */}
        <div
          className={`
          h-1 w-full flex-shrink-0 transition-colors duration-500
          ${cita ? ESTADO_CFG[cita.estado]?.bg || "bg-gray-300" : "bg-amber-400"}
        `}
        />

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Hash size={14} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Cita</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                #{citaId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading && <Spinner />}
          {!loading && error && <ErrorView msg={error} onRetry={cargar} />}

          {!loading && cita && (
            <div className="px-5 py-5 space-y-6">
              {/* Estado */}
              <div className="flex flex-col items-start gap-3">
                <EstadoBadge estado={cita.estado} />
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={11} />
                  <span>Creada {fmtTs(cita.created_at)}</span>
                </div>
              </div>

              {/* NUEVO: Selector de estado UNIVERSAL (SOLO ADMIN) */}
              {esAdmin && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Cambiar estado (Admin)
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
                    <select
                      value={cita.estado}
                      onChange={(e) =>
                        handleCambioEstadoUniversal(e.target.value)
                      }
                      disabled={accionando === "cambiarEstado"}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 text-sm"
                    >
                      {TODOS_LOS_ESTADOS.map((est) => (
                        <option key={est.value} value={est.value}>
                          {est.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Permite cambiar a cualquier estado manualmente.
                    </p>
                  </div>
                </div>
              )}

              {/* Botón de edición para admin (AÑADIDO) */}
              {esAdmin && (
                <div className="pt-2">
                  <button
                    onClick={handleAbrirEditar}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Edit size={16} /> Editar cita (Admin)
                  </button>
                </div>
              )}

              {/* Servicio */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Servicio
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl overflow-hidden">
                  <DataRow
                    icon={Scissors}
                    label="Servicio"
                    value={cita.servicio_nombre}
                    accent
                  />
                  <DataRow
                    icon={Clock}
                    label="Duración"
                    value={`${cita.duracion} minutos`}
                  />
                  <DataRow
                    icon={DollarSign}
                    label="Precio"
                    value={fmtPrecio(cita.precio)}
                    accent
                  />
                </div>
              </div>

              {/* Fecha y hora */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  Fecha y hora
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl overflow-hidden">
                  <DataRow
                    icon={Calendar}
                    label="Fecha"
                    value={fmtFecha(cita.fecha)}
                    accent
                  />
                  <DataRow
                    icon={CalendarClock}
                    label="Hora"
                    value={fmtHora(cita.hora)}
                    accent
                  />
                </div>
              </div>

              {/* Personas — qué campos mostrar según rol */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  {rol === "cliente" ? "Barbero" : "Partes"}
                </p>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl overflow-hidden">
                  {/* Barbero siempre visible */}
                  <DataRow
                    icon={UserCheck}
                    label="Barbero"
                    value={cita.barbero_nombre}
                  />

                  {/* Cliente: visible para barbero y admin */}
                  {(rol === "barbero" || rol === "admin") && (
                    <>
                      <DataRow
                        icon={User}
                        label="Cliente"
                        value={cita.cliente_nombre}
                      />
                      <DataRow
                        icon={Mail}
                        label="Email"
                        value={cita.cliente_email}
                        mono
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Notas */}
              {cita.notas && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Notas
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800/30 rounded-2xl px-4 py-3">
                    <div className="flex items-start gap-2">
                      <FileText
                        size={13}
                        className="text-amber-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{cita.notas}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error de acción */}
              {errorAccion && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{errorAccion}</span>
                </div>
              )}

              {/* Separador antes de acciones */}
              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Actualizado */}
              {cita.updated_at && cita.updated_at !== cita.created_at && (
                <p className="text-xs text-gray-400 text-center">
                  Última actualización: {fmtTs(cita.updated_at)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pie con acciones — fijo abajo */}
        {cita && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/8 space-y-2">
            {/* CLIENTE: solo puede cancelar si está pendiente */}
            {rol === "cliente" && cita.estado === "pendiente" && (
              <div className="flex gap-2">
                <AccionBtn
                  color="red"
                  loading={accionando === "cancelar"}
                  onClick={handleCancelar}
                >
                  <XCircle size={15} /> Cancelar cita
                </AccionBtn>
              </div>
            )}

            {/* BARBERO: confirmar (pendiente) o finalizar (confirmada) */}
            {(rol === "barbero" || rol === "admin") && (
              <div className="flex gap-2">
                {cita.estado === "pendiente" && (
                  <>
                    <AccionBtn
                      color="blue"
                      loading={accionando === "confirmar"}
                      onClick={handleConfirmar}
                    >
                      <BadgeCheck size={15} /> Confirmar
                    </AccionBtn>
                    <AccionBtn
                      color="red"
                      loading={accionando === "cancelar"}
                      onClick={handleCancelar}
                    >
                      <XCircle size={15} /> Cancelar
                    </AccionBtn>
                  </>
                )}
                {cita.estado === "confirmada" && (
                  <AccionBtn
                    color="green"
                    loading={accionando === "finalizar"}
                    onClick={handleFinalizar}
                  >
                    <CheckCircle2 size={15} /> Marcar completada
                  </AccionBtn>
                )}
              </div>
            )}

            {/* Estado terminal — sin acciones */}
            {(cita.estado === "completada" || cita.estado === "cancelada") &&
              rol !== "admin" && (
                <p className="text-xs text-center text-gray-400">
                  {cita.estado === "completada"
                    ? "✓ Cita completada"
                    : "✕ Cita cancelada"}{" "}
                  — sin acciones disponibles
                </p>
              )}

            {/* Cerrar */}
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Modal de edición de cita (AÑADIDO) */}
      <ModalEditarCita
        cita={cita}
        isOpen={editModalOpen}
        onClose={handleCerrarEditar}
        onCitaActualizada={handleCitaActualizada}
      />
    </>
  );
}
