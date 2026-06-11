
-- Barbería DB

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS barberia_db;
USE barberia_db;

-- Deshabilitar verificaciones de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABLA DE USUARIOS
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'barbero', 'cliente') DEFAULT 'cliente',
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_rol(rol)
);

-- 2. TABLA DE SERVICIOS
DROP TABLE IF EXISTS servicios;
CREATE TABLE servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion INT NOT NULL COMMENT 'Duración en minutos',
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo(activo)
);

-- 3. TABLA DE CITAS
DROP TABLE IF EXISTS citas;
CREATE TABLE citas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    barbero_id INT NOT NULL,
    servicio_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (barbero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_reserva (barbero_id, fecha, hora),
    INDEX idx_cliente(cliente_id),
    INDEX idx_barbero(barbero_id),
    INDEX idx_fecha_hora(fecha, hora),
    INDEX idx_estado(estado)
);

-- 4. TABLA DE HORARIOS BARBERO
DROP TABLE IF EXISTS horarios_barbero;
CREATE TABLE horarios_barbero (
    id INT PRIMARY KEY AUTO_INCREMENT,
    barbero_id INT NOT NULL,
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (barbero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_horario (barbero_id, dia_semana)
);

-- 5. TABLA DE MENSAJES DE CONTACTO
DROP TABLE IF EXISTS contacto_mensajes;
CREATE TABLE contacto_mensajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    INDEX idx_fecha(fecha),
    INDEX idx_leido(leido)
);

-- 6. TABLA DE NOTIFICACIONES
DROP TABLE IF EXISTS notificaciones;
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'sistema',
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    data JSON,
    leida BOOLEAN DEFAULT FALSE,
    creada_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_leida(usuario_id, leida),
    INDEX idx_creada(creada_en)
);

-- 7. TABLA DE CONFIGURACIÓN
DROP TABLE IF EXISTS configuracion;
CREATE TABLE configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion VARCHAR(255),
    tipo ENUM('texto','numero','booleano','json') DEFAULT 'texto',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave(clave)
);

-- Rehabilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE citas;
TRUNCATE TABLE configuracion;
TRUNCATE TABLE contacto_mensajes;
TRUNCATE TABLE horarios_barbero;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE servicios;
TRUNCATE TABLE usuarios;

SET FOREIGN_KEY_CHECKS = 1;


-- 8. VERIFICAR TABLAS CREADAS
SHOW TABLES;

-- 9. VER ESTRUCTURA DE LA TABLA CITAS
DESCRIBE citas;
SHOW COLUMNS FROM citas;

select * from usuarios;
select * from citas;
select * from servicios;
select * from configuracion;