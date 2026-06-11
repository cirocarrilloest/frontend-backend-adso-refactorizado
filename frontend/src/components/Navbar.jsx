// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Moon, Menu, Sun, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { darkMode, toggleDark } = useTheme();
  const [mobilMenu, setMobilMenu] = useState(false);

  const theme = {
    nav: darkMode
      ? "bg-gradient-to-r from-black to-blue-800"
      : "bg-white shadow-sm",
    text: darkMode ? "text-white" : "text-gray-900",
    hover: darkMode ? "hover:text-blue-300" : "hover:text-blue-700",
    logo: darkMode ? "text-white" : "text-gray-900",
    btn: darkMode ? "text-white" : "text-gray-900",
  };

  const linkClass = ({ isActive }) =>
    `no-underline px-4 py-2 rounded-full transition-all duration-300 
     ${theme.text} ${theme.hover}
     ${isActive ? "bg-blue-500 !text-white shadow-md" : ""}`;

  return (
    <nav className={`${theme.nav}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className={`no-underline text-4xl ${theme.logo}`}>
          <h1 className="font-rye text-4xl">BarberShop</h1>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/servicios" className={linkClass}>
            Servicios
          </NavLink>
          <NavLink to="/contacto" className={linkClass}>
            Contacto
          </NavLink>
          <button onClick={toggleDark} className={theme.btn}>
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobilMenu(!mobilMenu)}
            className={theme.btn}
          >
            {mobilMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobilMenu && (
        <div className="md:hidden px-4 pb-4 flex flex-col space-y-3">
          <NavLink
            to="/"
            className={linkClass}
            onClick={() => setMobilMenu(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/servicios"
            className={linkClass}
            onClick={() => setMobilMenu(false)}
          >
            Servicios
          </NavLink>
          <NavLink
            to="/contacto"
            className={linkClass}
            onClick={() => setMobilMenu(false)}
          >
            Contacto
          </NavLink>
          <button
            onClick={toggleDark}
            className={`flex items-center ${theme.btn}`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
