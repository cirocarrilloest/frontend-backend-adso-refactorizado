import React from "react";
import Ingreso from "../components/Ingreso";
import Registro from "../components/Registro";

export function Home() {
  const [isIngreso, setIsIngreso] = React.useState(true);

  return (
    <div className="min-h-124 flex flex-col md:flex-row items-center justify-center gap-4 px-6 py-2">
      {/* Imagen */}
      <div className="flex-shrink-0">
        <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full flex items-center justify-center shadow-lg">
          <img
            src="./src/assets/barber.png"
            alt="barber logo"
            className="w-[90%] h-[90%] object-contain rounded-full bg-blue-800 p-2"
          />
        </div>
      </div>

      {/* Contenedor fijo del formulario */}
      <div className="w-full max-w-2xl min-h-[420px] flex items-center justify-center">
        {isIngreso ? (
          <Ingreso onSwitch={() => setIsIngreso(false)} />
        ) : (
          <Registro onSwitch={() => setIsIngreso(true)} />
        )}
      </div>
    </div>
  );
}

export default Home;
