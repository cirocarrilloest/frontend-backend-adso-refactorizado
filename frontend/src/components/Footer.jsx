//Frontend/src/components/Footer.jsx
import React from "react";
import { FaFacebookSquare, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer>
      <div className="bg-gray-950 px-4 md:px-16 lg:px-28">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          {/* Columna 1 - Sobre nosotros */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-white">
              Sobre nosotros
            </h2>
            <p className="text-gray-300">Empresa de barbería</p>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-white ">
              Enlaces rápidos
            </h2>
            <ul className="flex gap-4">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/servicios"
                  className="text-gray-300 hover:text-white"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Síguenos */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-white">Síguenos</h2>
            <ul className="flex gap-4">
              <li className="flex items-center gap-2">
                <FaFacebookSquare className="text-blue-500" />
                <a
                  href="https://www.facebook.com"
                  className="text-gray-300 hover:text-white"
                >
                  Facebook
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaInstagram className="text-pink-500" />
                <a
                  href="https://www.instagram.com"
                  className="text-gray-300 hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaTwitter className="text-blue-400" />
                <a
                  href="https://www.twitter.com"
                  className="text-gray-300 hover:text-white"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-950 border-t border-gray-600 py-6 text-gray-300 text-center">
        <div className="max-w-6xl mx-auto">
          <p>&copy; 2026 Barbershop, Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
