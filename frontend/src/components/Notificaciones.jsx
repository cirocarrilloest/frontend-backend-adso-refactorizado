// frontend/src/components/Notificaciones.jsx
import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import {
  getNotificaciones,
  contarNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "../services/notificacionService";

export const Notificaciones = () => {
  const [open, setOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [lista, contador] = await Promise.all([
        getNotificaciones(false, 20),
        contarNoLeidas(),
      ]);
      setNotificaciones(lista.notificaciones || []);
      setNoLeidas(contador.total || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLeer = async (id) => {
    await marcarNotificacionLeida(id);
    cargar();
  };

  const handleLeerTodas = async () => {
    await marcarTodasLeidas();
    cargar();
  };

  const getIcono = (tipo) => {
    const iconos = {
      cita_nueva: "📅",
      cita_cancelada: "❌",
      cita_confirmada: "✅",
      cita_recordatorio: "⏰",
      contacto: "✉️",
      sistema: "🔔",
    };
    return iconos[tipo] || "🔔";
  };

  const getColor = (tipo) => {
    const colores = {
      cita_nueva: "text-blue-500",
      cita_cancelada: "text-red-500",
      cita_confirmada: "text-green-500",
      cita_recordatorio: "text-amber-500",
      contacto: "text-purple-500",
      sistema: "text-gray-500",
    };
    return colores[tipo] || "text-gray-500";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-400" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            {noLeidas > 0 && (
              <button
                onClick={handleLeerTodas}
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-gray-400">Cargando...</div>
            )}
            {!loading && notificaciones.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No hay notificaciones
              </div>
            )}
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !notif.leida ? "bg-blue-50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xl ${getColor(notif.tipo)}`}>
                    {getIcono(notif.tipo)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notif.titulo}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {notif.mensaje}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.creada_en).toLocaleString()}
                    </p>
                  </div>
                  {!notif.leida && (
                    <button
                      onClick={() => handleLeer(notif.id)}
                      className="text-gray-400 hover:text-green-500"
                      title="Marcar como leída"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
