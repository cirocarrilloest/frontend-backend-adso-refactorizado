## trabajo de frontend y backend

# BarberShop — Aplicación Web

Sistema de gestión para barbería con reservas en línea, panel de administración y dashboards por rol (admin, barbero, cliente).

---

## Tecnologías

**Frontend**

- React 18 + Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React

**Backend**

- Node.js + Express
- MySQL 2 (pool de conexiones)
- JWT (jsonwebtoken)
- bcryptjs
- Joi (validación)
- Morgan, Chalk, Clear

---

## Requisitos previos

- Node.js 18+
- MySQL 8+
- npm o yarn

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/cirocarrilloest/frontend-backend-adso.git
cd barbershop
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

#### completa

```bash
cd backend
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv joi chalk morgan clear
npm install -D nodemon
```

Crea el archivo `.env` en `backend/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=barberia_db
JWT_SECRET=una_clave_secreta_larga
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

### 3. Configurar la base de datos

Crea la base de datos en MySQL:

```sql
CREATE DATABASE barberia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego ejecuta el archivo de migración (si existe) o crea las tablas manualmente. Las tablas requeridas son:

- `usuarios`
- `servicios`
- `citas`
- `horarios_barbero`
- `notificaciones`
- `contacto_mensajes`
- `configuracion`

### 4. Configurar el frontend

```bash
cd ../frontend
npm install
```

#### completa

```bash
cd frontend
npm install react react-dom react-router-dom axios lucide-react react-icons
npm install -D vite @vitejs/plugin-react tailwindcss autoprefixer postcss
npx tailwindcss init -p
```

El frontend apunta a `http://localhost:3000/api` por defecto. Si cambias el puerto del backend, edita `frontend/src/services/axiosConfig.js`.

---

### Verificar instalacion

```bash
cd frontend
npm list --depth=0
```

### Ejecutar seed

```bash
cd frontend
node seed.js
```

## Ejecutar en desarrollo

Abre dos terminales:

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## Estructura del proyecto

```
barbershop/
├── backend/
│   └── src/
│       ├── app.js                  # Entrada principal, middlewares, rutas
│       ├── config/
│       │   └── db.js               # Conexión MySQL (pool)
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── citaController.js
│       │   ├── configController.js
│       │   ├── contactoController.js
│       │   ├── notificacionController.js
│       │   ├── servicioController.js
│       │   └── userController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js       # Verifica JWT
│       │   ├── roleMiddleware.js       # Verifica rol (admin / barbero)
│       │   ├── validationMiddleware.js # Joi schemas
│       │   ├── configMiddleware.js     # Carga configuración global
│       │   └── dateValidationMiddleware.js
│       ├── models/
│       │   ├── configModel.js
│       │   ├── notificacionModel.js
│       │   ├── servicioModel.js
│       │   └── userModel.js
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth
│       │   ├── citaRoutes.js       # /api/citas
│       │   ├── configRoutes.js     # /api/config
│       │   ├── contactoRoutes.js   # /api/contacto
│       │   ├── notificacionRoutes.js # /api/notificaciones
│       │   ├── servicioRoutes.js   # /api/servicios
│       │   └── userRoutes.js       # /api/usuarios
│       ├── services/
│       │   └── tokenService.js     # JWT: generar, verificar, invalidar
│       └── utils/
│           └── validador.js        # Validaciones de registro/ingreso
│
└── frontend/
    └── src/
        ├── App.jsx                 # Rutas públicas y protegidas
        ├── main.jsx                # Providers (Auth, Theme)
        ├── index.css / style.css
        ├── assets/                 # Imágenes estáticas
        ├── components/
        │   ├── dashboard/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── BarberoDashboard.jsx
        │   │   ├── ClienteDashboard.jsx
        │   │   ├── DashboardShell.jsx
        │   │   ├── DrawerDetalleCita.jsx
        │   │   ├── ModalReagendar.jsx
        │   │   ├── PerfilView.jsx
        │   │   ├── VistaCitasAdmin.jsx
        │   │   ├── VistaAgendaSemanal.jsx
        │   │   └── WidgetDisponibilidad.jsx
        │   ├── admin/
        │   │   ├── UserCitasModal.jsx
        │   │   └── VistaTodasLasCitas.jsx
        │   ├── ui/
        │   │   ├── ConfirmModal.jsx
        │   │   ├── ErrorBanner.jsx
        │   │   ├── Modal.jsx
        │   │   └── Spinner.jsx
        │   ├── ContactoFormulario.jsx
        │   ├── ContactoInfo.jsx
        │   ├── Ingreso.jsx
        │   ├── Navbar.jsx
        │   ├── Notificaciones.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Registro.jsx
        │   └── ServiciosCard.jsx
        ├── context/
        │   ├── AuthContext.jsx     # Token + usuario en localStorage
        │   └── ThemeContext.jsx    # Modo oscuro persistente
        ├── hooks/
        │   └── useApi.js           # Hook genérico loading/error/data
        ├── layouts/
        │   ├── DashboardLayout.jsx
        │   └── PublicLayout.jsx
        ├── pages/
        │   ├── Home.jsx            # Login / Registro
        │   ├── Servicios.jsx
        │   ├── Contacto.jsx
        │   └── DashBoard.jsx       # Router por rol
        └── services/
            ├── axiosConfig.js      # Instancia Axios + interceptores
            ├── authService.js
            ├── citaService.js
            ├── configService.js
            ├── contactoService.js
            ├── notificacionService.js
            ├── servicioService.js
            └── usuarioService.js
```

---

## Roles del sistema

| Rol       | Acceso                                                                          |
| --------- | ------------------------------------------------------------------------------- |
| `cliente` | Reservar citas, ver historial, reagendar, cancelar                              |
| `barbero` | Agenda del día, semana, confirmar/finalizar citas, disponibilidad               |
| `admin`   | Todo lo anterior + gestión de usuarios, servicios, horarios, reportes, mensajes |

---

## Endpoints principales

| Método | Ruta                            | Descripción          | Acceso        |
| ------ | ------------------------------- | -------------------- | ------------- |
| POST   | `/api/auth/registro`            | Crear cuenta         | Público       |
| POST   | `/api/auth/ingreso`             | Iniciar sesión       | Público       |
| GET    | `/api/auth/perfil`              | Ver perfil propio    | Autenticado   |
| PUT    | `/api/auth/perfil`              | Editar perfil propio | Autenticado   |
| POST   | `/api/citas`                    | Agendar cita         | Autenticado   |
| GET    | `/api/citas/mis-citas`          | Citas del cliente    | Cliente       |
| GET    | `/api/citas/agenda-dia`         | Agenda del día       | Barbero/Admin |
| GET    | `/api/citas/dashboard`          | Estadísticas         | Admin         |
| GET    | `/api/usuarios/barberos/listar` | Listar barberos      | Autenticado   |
| POST   | `/api/contacto`                 | Enviar mensaje       | Público       |
| GET    | `/api/notificaciones`           | Mis notificaciones   | Autenticado   |

---

## Variables de entorno

| Variable             | Descripción                      | Ejemplo                |
| -------------------- | -------------------------------- | ---------------------- |
| `PORT`               | Puerto del servidor              | `3000`                 |
| `DB_HOST`            | Host de MySQL                    | `localhost`            |
| `DB_PORT`            | Puerto de MySQL                  | `3306`                 |
| `DB_USER`            | Usuario de MySQL                 | `root`                 |
| `DB_PASSWORD`        | Contraseña de MySQL              | `mi_pass`              |
| `DB_NAME`            | Nombre de la base de datos       | `barberia_db`          |
| `JWT_SECRET`         | Clave secreta para firmar tokens | cadena larga aleatoria |
| `JWT_EXPIRES_IN`     | Duración del token               | `1h`                   |
| `BCRYPT_SALT_ROUNDS` | Rounds de hashing                | `10`                   |

---

## Notas de desarrollo

- El frontend espera el backend en `http://localhost:3000`. El backend tiene CORS configurado para aceptar solo `http://localhost:5173`. Si cambias algún puerto, actualiza ambos archivos (`app.js` y `axiosConfig.js`).
- Los tokens JWT se almacenan en `localStorage`. Al recibir un 401, el interceptor de Axios limpia la sesión automáticamente y redirige a `/`.
- Las notificaciones se recargan cada 30 segundos desde el componente `Notificaciones.jsx`.
- La tabla `configuracion` permite ajustar parámetros como horario de apertura/cierre y moneda sin modificar código.
