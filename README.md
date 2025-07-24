# PromotoriaCia

Sistema de gestión para promotores de compañía.

## Configuración del Entorno

### 1. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales de base de datos:
   ```env
   DB_HOST=tu_servidor_bd
   DB_USER=tu_usuario_bd
   DB_PASSWORD=tu_contraseña_bd
   DB_NAME=tu_base_datos
   ```

### 2. Instalar Dependencias

```bash
composer install
```

### 3. Estructura de Archivos

- **Backend/ConexionBD/**: Archivos de conexión a la base de datos
- **Backend/FuncionalidadPHP/**: Lógica PHP del backend
- **Backend/FuncionalidadJS/**: Scripts JavaScript
- **Visuales/**: Interfaces de usuario
- **Storage/**: Archivos subidos por usuarios
- **Backend/Archivos/**: Plantillas y archivos generados

### 4. Seguridad

- El archivo `.env` contiene información sensible y **NO** debe subirse al repositorio
- Las credenciales de base de datos están protegidas usando variables de entorno
- Los archivos generados dinámicamente son ignorados por Git

## Instalación

1. Clona el repositorio
2. Configura el archivo `.env` como se indica arriba
3. Ejecuta `composer install`
4. Configura tu servidor web para apuntar al directorio del proyecto

## Contribución

Para contribuir al proyecto:

1. Crea una rama desde `Santiago-Dev`
2. Realiza tus cambios
3. Asegúrate de no subir el archivo `.env`
4. Crea un pull request