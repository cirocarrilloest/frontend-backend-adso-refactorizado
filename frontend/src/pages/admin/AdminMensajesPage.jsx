// frontend/src/pages/admin/AdminMensajesPage.jsx
import React, { useState, useEffect } from "react";
import {
  getMensajesContacto,
  marcarMensajeLeido,
} from "../../services/contactoService";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { useToast } from "../../context/ToastContext";

export default function AdminMensajesPage() {
  const { addToast } = useToast();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  const cargarMensajes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMensajesContacto(soloNoLeidos);
      setMensajes(res.mensajes || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      addToast(
        e.response?.data?.message || "Error al cargar mensajes",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, [soloNoLeidos]);

  const handleMarcarLeido = async (id) => {
    try {
      await marcarMensajeLeido(id);
      addToast("Mensaje marcado como leído", "success");
      cargarMensajes();
    } catch (e) {
      addToast(
        e.response?.data?.message || "Error al marcar como leído",
        "error",
      );
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={cargarMensajes} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mensajes de Contacto
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Consulta y responde los mensajes de los clientes
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soloNoLeidos}
            onChange={(e) => setSoloNoLeidos(e.target.checked)}
          />{" "}
          Solo no leídos
        </label>
      </div>

      <div className="space-y-4">
        {mensajes.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay mensajes</div>
        )}
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border ${!m.leido ? "border-amber-300 dark:border-amber-500" : "border-gray-100 dark:border-white/5"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {m.nombre}
                </p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
              {!m.leido && (
                <button
                  onClick={() => handleMarcarLeido(m.id)}
                  className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Marcar leído
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
              {m.mensaje}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              {new Date(m.fecha).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
