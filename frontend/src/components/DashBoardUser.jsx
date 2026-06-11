// src/components/DashBoardUser.jsx
import React from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Folder,
  Calendar,
  File,
  Database,
  Sun,
  Moon,
} from "lucide-react";
export const DashBoardUser = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard /> },
    { name: "Projects", icon: <Folder /> },
    { name: "Calendar", icon: <Calendar /> },
    { name: "Documents", icon: <File /> },
    { name: "Reports", icon: <Database /> },
  ];

  return (
    <div
      className={`flex bg-gray-100 ${darkMode ? "dark" : ""} h-screen dark dark:bg-gray-900`}
    >
      {/* barra lateral */}
      <div
        className={`fixed bg-white w-64 h-screen  shadow  ${sidebarOpen ? "-translate-x-0" : "-translate-x-64"} lg:translate-x-0 lg:static dark:bg-gray-900`}
      >
        <div className="p-4 flex justify-between border-b">
          <div className="text-xl font-bold dark:text-gray-100">Logo</div>
          <button
            className="lg:hidden dark:text-gray-100 "
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>
        {/* barra de navegacion */}
        <div className="p-4 space-y-2">
          {navItems.map((item) => {
            return (
              <div key={item.name} className="flex p-2 hover: bg-gray-100">
                <div className="text-xl">{item.icon}</div>
                <div className="text-xl dark:text-gray-100 dark:hover:text-gray-900">
                  {item.name}
                </div>
              </div>
            );
          })}
        </div>
        {/* boton modo oscuro */}
        <div className="flex text-xl justify-left p-4">
          {darkMode ? (
            <button
              className="p-2 bg-black rounded-full"
              onClick={() => setDarkMode(false)}
            >
              <Sun />
            </button>
          ) : (
            <button
              className="p-2 bg-white rounded-full"
              onClick={() => setDarkMode(true)}
            >
              <Moon />
            </button>
          )}
        </div>
      </div>
      {/* contenido principal */}
      <main className="flex-1">
        <header className="bg-white flex justify-between p-4 dark:bg-gray-900">
          <button
            className="p-2 text-xl font-bold lg:hidden dark:text-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
          <h1 className="text-2xl font-bold dark:text-gray-100">DashBoard</h1>
          <div className="bg-gray-300 w-10 h10 rounded-full"></div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
          {/* todas las tarjetas */}
          <div className="bg-white p-6 shodow-lg rounded-lg dark:bg-gray-800">
            <h2 className="text-xl font-bold dark:text-gray-100">Card</h2>
            <p className="text-lg p-1 text-gray-700 dark:text-gray-100">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
              voluptas molestiae enim praesentium fugit nemo velit similique
              molestias tempore veniam perspiciatis iure esse facere culpa, sint
              repellendus, aliquid est nam.
            </p>
          </div>
          <div className="bg-white p-6 shodow-lg rounded-lg dark:bg-gray-800">
            <h2 className="text-xl font-bold dark:text-gray-100">Card</h2>
            <p className="text-lg p-1 text-gray-700 dark:text-gray-100">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
              voluptas molestiae enim praesentium fugit nemo velit similique
              molestias tempore veniam perspiciatis iure esse facere culpa, sint
              repellendus, aliquid est nam.
            </p>
          </div>
          <div className="bg-white p-6 shodow-lg rounded-lg dark:bg-gray-800">
            <h2 className="text-xl font-bold dark:text-gray-100">Card</h2>
            <p className="text-lg p-1 text-gray-700 dark:text-gray-100">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
              voluptas molestiae enim praesentium fugit nemo velit similique
              molestias tempore veniam perspiciatis iure esse facere culpa, sint
              repellendus, aliquid est nam.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
export default DashBoardUser;
