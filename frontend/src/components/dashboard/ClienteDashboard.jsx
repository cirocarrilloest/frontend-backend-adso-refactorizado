// frontend/src/components/dashboard/ClienteDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Plus,
  RefreshCw,
  AlertCircle,
  X,
  ChevronLeft,
} from "lucide-react";
import { CheckCircle } from "lucide-react";
import DashboardShell from "./DashboardShell";
import {
  getProximasCitas,
  getHistorialCitas,
  agendarCita,
  cancelarCita,
} from "../../services/citaService";
import { getBarberos } from "../../services/usuarioService";
import { getServicios } from "../../services/servicioService";
import { getHorariosDisponibles as getHorariosDisp } from "../../services/citaService";
import PerfilView from "../dashboard/PerfilView.jsx";
import PerfilBarberoCard from "./PerfilBarberoCard.jsx"; // ← NUEVO
import VistaMisCitas from "./VistaMisCitas.jsx";
function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
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

// ── Vista Inicio ─────────────────────────────────────────────────────────────
function VistaInicio({ onReservar }) {
  const [proximas, setProximas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, h] = await Promise.all([
        getProximasCitas(),
        getHistorialCitas(5),
      ]);
      setProximas(p.citas || []);
      setHistorial(h.citas || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCancelar = async (id) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCancelando(id);
    try {
      await cancelarCita(id);
      cargar();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setCancelando(null);
    }
  };

  const estadoStyle = {
    pendiente:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    confirmada:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completada:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelada: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const fmtFecha = (f) => {
    if (!f) return "";
    return new Date(f).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner msg={error} />;

  return (
    <div className="space-y-5">
      {proximas.length > 0 ? (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 text-white shadow-md">
          <p className="text-xs text-white/60 mb-2 uppercase tracking-widest">
            Próxima cita
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xl font-bold">{proximas[0].servicio_nombre}</p>
              <p className="text-sm text-white/70">
                con {proximas[0].barbero_nombre}
              </p>
              <p className="text-sm text-amber-400 mt-2 font-medium">
                {fmtFecha(proximas[0].fecha)} ·{" "}
                {String(proximas[0].hora).slice(0, 5)}
              </p>
            </div>
            {proximas[0].estado === "pendiente" && (
              <button
                onClick={() => handleCancelar(proximas[0].id)}
                disabled={cancelando === proximas[0].id}
                className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
              >
                {cancelando === proximas[0].id ? "…" : "Cancelar"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tienes citas próximas
          </p>
        </div>
      )}

      <button
        onClick={onReservar}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-all text-sm font-medium"
      >
        <Plus size={16} /> Reservar nueva cita
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Historial reciente
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {historial.length === 0 && (
            <p className="text-sm text-gray-400 px-5 py-4 text-center">
              Sin historial aún
            </p>
          )}
          {historial.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Clock
                  size={14}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {c.servicio_nombre}
                </p>
                <p className="text-xs text-gray-400">
                  {c.barbero_nombre} · {fmtFecha(c.fecha)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  ${c.precio}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${estadoStyle[c.estado]}`}
                >
                  {c.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vista Reservar ────────────────────────────────────────────────────────────
// CAMBIO: paso 2 ahora tiene sub-estado "verPerfil" que muestra PerfilBarberoCard
function VistaReservar({ onExito }) {
  const [paso, setPaso] = useState(1);
  const [verPerfilBarbero, setVerPerfilBarbero] = useState(false); // ← NUEVO sub-estado paso 2
  const [seleccion, setSeleccion] = useState({
    servicio: null,
    barbero: null,
    fecha: "",
    hora: "",
  });
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [horariosDisp, setHorariosDisp] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    getServicios(true)
      .then((r) => setServicios(r.servicios || []))
      .catch(() => {});
    getBarberos()
      .then((r) => setBarberos(r.barberos || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (paso === 3 && seleccion.barbero && seleccion.fecha) {
      setLoading(true);
      setHorariosDisp([]);
      getHorariosDisp(seleccion.barbero.id, seleccion.fecha)
        .then((r) => setHorariosDisp(r.horarios_disponibles || []))
        .catch((e) => setError(e.response?.data?.message || e.message))
        .finally(() => setLoading(false));
    }
  }, [paso, seleccion.barbero, seleccion.fecha]);

  const handleConfirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await agendarCita({
        barbero_id: seleccion.barbero.id,
        servicio_id: seleccion.servicio.id,
        fecha: seleccion.fecha,
        hora: seleccion.hora,
      });
      setExito(true);
      setTimeout(onExito, 1800);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setEnviando(false);
    }
  };

  const pasos = ["Servicio", "Barbero", "Horario", "Confirmar"];

  if (exito)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-lg">
          ¡Cita agendada!
        </p>
        <p className="text-sm text-gray-400">Redirigiendo…</p>
      </div>
    );

  // ── Sub-vista: perfil del barbero seleccionado (dentro del paso 2) ──────────
  if (paso === 2 && verPerfilBarbero && seleccion.barbero) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <button
          onClick={() => setVerPerfilBarbero(false)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
        >
          <ChevronLeft size={16} /> Volver a la lista
        </button>

        <PerfilBarberoCard
          barberoId={seleccion.barbero.id}
          onReservar={() => {
            // El barbero ya está seleccionado; avanzar al paso 3
            setVerPerfilBarbero(false);
            setPaso(3);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Indicador de pasos */}
      <div className="flex items-center gap-2">
        {pasos.map((p, i) => (
          <React.Fragment key={i}>
            <div
              className={`flex items-center gap-1.5 ${i + 1 <= paso ? "text-amber-500" : "text-gray-400 dark:text-gray-600"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${
                  i + 1 < paso
                    ? "bg-amber-400 border-amber-400 text-gray-900"
                    : i + 1 === paso
                      ? "border-amber-400 text-amber-500"
                      : "border-gray-200 dark:border-white/20"
                }`}
              >
                {i + 1 < paso ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:block">{p}</span>
            </div>
            {i < pasos.length - 1 && (
              <div
                className={`flex-1 h-px ${i + 1 < paso ? "bg-amber-400" : "bg-gray-200 dark:bg-white/10"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && <ErrorBanner msg={error} />}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        {/* Paso 1: Servicio */}
        {paso === 1 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              ¿Qué servicio deseas?
            </h3>
            {servicios.length === 0 && <Spinner />}
            {servicios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSeleccion({ ...seleccion, servicio: s });
                  setPaso(2);
                }}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 text-sm transition-all hover:border-amber-300 dark:hover:border-amber-500"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {s.nombre}
                </span>
                <span className="ml-2 text-gray-400 text-xs">
                  ${s.precio} · {s.duracion} min
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Paso 2: Barbero — MEJORADO: botón "Ver perfil" junto a cada barbero */}
        {paso === 2 && !verPerfilBarbero && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Elige tu barbero
            </h3>
            {barberos.length === 0 && <Spinner />}
            {barberos.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-800 transition-all"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-bold text-amber-700 dark:text-amber-400 flex-shrink-0">
                  {b.nombre?.charAt(0)}
                </div>
                {/* Nombre */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {b.nombre}
                  </p>
                  {b.telefono && (
                    <p className="text-xs text-gray-400">{b.telefono}</p>
                  )}
                </div>
                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* ← NUEVO: ver perfil completo antes de seleccionar */}
                  <button
                    onClick={() => {
                      setSeleccion({ ...seleccion, barbero: b });
                      setVerPerfilBarbero(true);
                    }}
                    className="text-xs text-amber-500 hover:text-amber-600 underline underline-offset-2 transition-colors"
                  >
                    Ver perfil
                  </button>
                  {/* Seleccionar directamente */}
                  <button
                    onClick={() => {
                      setSeleccion({ ...seleccion, barbero: b });
                      setPaso(3);
                    }}
                    className="text-xs bg-amber-400 hover:bg-amber-300 text-gray-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Elegir
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => setPaso(1)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ← Volver
            </button>
          </div>
        )}

        {/* Paso 3: Fecha y hora */}
        {paso === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Elige fecha y hora
            </h3>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={seleccion.fecha}
              onChange={(e) => {
                setSeleccion({ ...seleccion, fecha: e.target.value, hora: "" });
                setHorariosDisp([]);
              }}
              className="w-full border border-gray-200 dark:border-white/10 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm"
            />
            {loading && <Spinner />}
            {!loading && seleccion.fecha && horariosDisp.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center py-2">
                Sin horarios disponibles para esta fecha
              </p>
            )}
            {!loading && horariosDisp.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {horariosDisp.map((h) => (
                  <button
                    key={h}
                    onClick={() => setSeleccion({ ...seleccion, hora: h })}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all
                      ${
                        seleccion.hora === h
                          ? "bg-amber-400 border-amber-400 text-gray-900"
                          : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-amber-300"
                      }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setPaso(2)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ← Volver
              </button>
              <button
                onClick={() => setPaso(4)}
                disabled={!seleccion.fecha || !seleccion.hora}
                className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-amber-300 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmar */}
        {paso === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Confirma tu cita
            </h3>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm">
              {[
                [
                  "Servicio",
                  `${seleccion.servicio?.nombre} — $${seleccion.servicio?.precio}`,
                ],
                ["Duración", `${seleccion.servicio?.duracion} min`],
                ["Barbero", seleccion.barbero?.nombre],
                ["Fecha", seleccion.fecha],
                ["Hora", seleccion.hora],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {v}
                  </span>
                </div>
              ))}
            </div>
            {error && <ErrorBanner msg={error} />}
            <button
              onClick={handleConfirmar}
              disabled={enviando}
              className="w-full py-3 bg-amber-400 text-gray-900 rounded-xl font-bold hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {enviando ? "Agendando…" : "Confirmar reserva"}
            </button>
            <button
              onClick={() => setPaso(3)}
              className="w-full text-xs text-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function ClienteDashboard() {
  const [vista, setVista] = useState("inicio");

  const navItems = [
    {
      name: "Inicio",
      icon: <LayoutDashboard size={16} />,
      onClick: () => setVista("inicio"),
    },
    {
      name: "Reservar cita",
      icon: <Plus size={16} />,
      onClick: () => setVista("reservar"),
    },
    {
      name: "Mis citas",
      icon: <Calendar size={16} />,
      onClick: () => setVista("mis-citas"),
    },
    {
      name: "Mi perfil",
      icon: <User size={16} />,
      onClick: () => setVista("perfil"),
    },
  ];

  const titulos = {
    inicio: "Mi Espacio",
    reservar: "Nueva Cita",
    "mis-citas": "Mis Citas",
    perfil: "Mi Perfil",
  };

  return (
    <DashboardShell navItems={navItems} titulo={titulos[vista]}>
      {vista === "inicio" && (
        <VistaInicio onReservar={() => setVista("reservar")} />
      )}
      {vista === "reservar" && (
        <VistaReservar onExito={() => setVista("inicio")} />
      )}
      {vista === "mis-citas" && <VistaMisCitas />}
      {vista === "perfil" && <PerfilView />}
    </DashboardShell>
  );
}
