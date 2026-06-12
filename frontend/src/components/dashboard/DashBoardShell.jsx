// frontend/src/components/dashboard/DashboardShell.jsx
import React, { useState } from "react";
import { Menu, X, Sun, Moon, LogOut, Scissors } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { Notificaciones } from "../Notificaciones";
import { useToast } from "../../context/ToastContext";

const ROL_LABEL = {
  admin: "Administrador",
  barbero: "Barbero",
  cliente: "Cliente",
};

function DashboardShell({ navItems = [], children, titulo = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const { usuario, cerrarSesion } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Sesión cerrada exitosamente", "success");
    } catch (e) {
      addToast("Error al cerrar sesión", "error");
    }
    cerrarSesion();
    navigate("/");
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? "dark" : ""}`}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed z-30 flex flex-col h-full w-64 bg-gray-900 text-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-blue-500" />
            <span className="font-bold text-lg tracking-wide">BarberShop</span>
          </div>
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 font-bold text-sm mb-2">
            {usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <p className="text-sm font-semibold truncate">
            {usuario?.nombre || "Usuario"}
          </p>
          <p className="text-xs text-white/50">
            {ROL_LABEL[usuario?.rol] || usuario?.rol}
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveItem(i);
                item.onClick?.();
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeItem === i ? "bg-amber-500 text-gray-900 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
        <header className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-600 dark:text-gray-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {titulo}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Notificaciones />
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 font-bold text-sm">
              {usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}

export default DashboardShell;
