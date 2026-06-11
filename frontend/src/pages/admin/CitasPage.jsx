// frontend/src/pages/admin/CitasPage.jsx
import React from "react";
import VistaCitasAdmin from "../../components/dashboard/VistaCitasAdmin";

export const CitasPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Citas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra las citas de todos los barberos
        </p>
      </div>
      <VistaCitasAdmin />
    </div>
  );
};

export default CitasPage;
