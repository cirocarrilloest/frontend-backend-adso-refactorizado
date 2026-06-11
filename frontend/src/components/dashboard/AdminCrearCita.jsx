// frontend/src/components/dashboard/AdminCrearCita.jsx
import React, { useState, useEffect } from "react";
import { getUsuarios } from "../../services/usuarioService";
import { getServicios } from "../../services/servicioService";
import { getBarberos } from "../../services/usuarioService";
import {
  crearCitaAdmin,
  verificarDisponibilidad,
} from "../../services/citaService";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  AlertCircle,
  X,
} from "lucide-react";

// ── Toast de éxito ────────────────────────────────────────────────────────────
function SuccessToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        animation: "toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "#111827",
          color: "#fff",
          padding: "14px 20px",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          minWidth: "300px",
          maxWidth: "420px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Icono verde */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={20} color="#fff" />
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: 1.2,
            }}
          >
            ¡Cita creada exitosamente!
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: "12px",
              opacity: 0.65,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {message}
          </p>
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: "0 0 16px 16px",
            background: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#16a34a",
              animation: "progressBar 4s linear forwards",
            }}
          />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            color: "rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Keyframes inyectados una sola vez */}
      <style>{`
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.92); }
          60%  { opacity: 1; transform: translateX(-50%) translateY(4px)   scale(1.02); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);    }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export const AdminCrearCita = ({ onCitaCreada }) => {
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [disponible, setDisponible] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const [formData, setFormData] = useState({
    cliente_id: "",
    barbero_id: "",
    servicio_id: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "09:00",
    notas: "",
  });

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoClientes(true);

        const [clientesRes, barberosRes, serviciosRes] = await Promise.all([
          getUsuarios({ rol: "cliente" }),
          getBarberos(),
          getServicios(true),
        ]);

        const clientesList = clientesRes.usuarios || [];
        const barberosList = barberosRes.barberos || [];
        const serviciosList = serviciosRes.servicios || [];

        setClientes(clientesList);
        setBarberos(barberosList);
        setServicios(serviciosList);

        if (clientesList.length > 0)
          setFormData((p) => ({
            ...p,
            cliente_id: String(clientesList[0].id),
          }));
        if (barberosList.length > 0)
          setFormData((p) => ({
            ...p,
            barbero_id: String(barberosList[0].id),
          }));
        if (serviciosList.length > 0)
          setFormData((p) => ({
            ...p,
            servicio_id: String(serviciosList[0].id),
          }));
      } catch (err) {
        setError(
          "Error al cargar los datos: " +
            (err.response?.data?.message || err.message),
        );
      } finally {
        setCargandoClientes(false);
      }
    };
    cargarDatos();
  }, []);

  // Verificar disponibilidad
  useEffect(() => {
    const verificar = async () => {
      if (!formData.barbero_id || !formData.fecha || !formData.hora) return;
      setVerificando(true);
      setDisponible(null);
      try {
        const result = await verificarDisponibilidad(
          formData.barbero_id,
          formData.fecha,
          formData.hora,
        );
        setDisponible(result.disponible);
      } catch {
        setDisponible(false);
      } finally {
        setVerificando(false);
      }
    };
    const t = setTimeout(verificar, 500);
    return () => clearTimeout(t);
  }, [formData.barbero_id, formData.fecha, formData.hora]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cliente_id || !formData.barbero_id || !formData.servicio_id) {
      setError("Por favor selecciona cliente, barbero y servicio");
      return;
    }
    if (!disponible) {
      setError("El horario seleccionado no está disponible");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await crearCitaAdmin({
        cliente_id: parseInt(formData.cliente_id),
        barbero_id: parseInt(formData.barbero_id),
        servicio_id: parseInt(formData.servicio_id),
        fecha: formData.fecha,
        hora: formData.hora,
        notas: formData.notas || "",
      });

      // Mostrar toast
      setToastMessage(
        result.message || "Cita creada exitosamente por el administrador",
      );
      setShowToast(true);

      // Resetear solo notas y disponibilidad
      setFormData((p) => ({ ...p, notas: "" }));
      setDisponible(null);

      if (onCitaCreada) onCitaCreada(result.cita);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  if (cargandoClientes) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Cargando formulario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast de éxito */}
      {showToast && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Crear Cita (Administrador)
        </h3>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente *
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} - {c.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Barbero */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Barbero *
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                name="barbero_id"
                value={formData.barbero_id}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Seleccionar barbero</option>
                {barberos.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Servicio *
            </label>
            <div className="relative">
              <Scissors
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <select
                name="servicio_id"
                value={formData.servicio_id}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} - ${s.precio} - {s.duracion} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora *
            </label>
            <div className="relative">
              <Clock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                step="1800"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
          </div>

          {/* Indicador de disponibilidad */}
          {verificando && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500" />
              Verificando disponibilidad...
            </div>
          )}

          {disponible === true && !verificando && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <CheckCircle2 size={16} /> Horario disponible
            </div>
          )}

          {disponible === false && !verificando && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <XCircle size={16} /> Horario no disponible
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Instrucciones especiales, observaciones..."
            />
          </div>

          <button
            type="submit"
            disabled={
              loading || (!verificando && disponible !== true) || verificando
            }
            className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cita..." : "Crear Cita"}
          </button>
        </form>
      </div>
    </>
  );
};
