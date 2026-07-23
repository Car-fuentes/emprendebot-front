# EmprendeBot — Frontend

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Node.js + Express](https://img.shields.io/badge/Node.js_+_Express-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

**EmprendeBot** es una plataforma web que permite a emprendedores configurar un asistente comercial, publicar productos y servicios, administrar preguntas frecuentes, recibir consultas y ofrecer un chatbot público mediante un enlace único para su negocio.

El frontend está construido como una SPA con React, TypeScript y Vite. Consume una API REST desarrollada con Node.js y Express, conectada a PostgreSQL mediante Prisma.

## Contenido

- [Características principales](#características-principales)
- [Flujo general](#flujo-general)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución local](#ejecución-local)
- [Scripts](#scripts)
- [Rutas](#rutas)
- [Arquitectura](#arquitectura)
- [Integración con el backend](#integración-con-el-backend)
- [Autenticación](#autenticación)
- [Generación del enlace público](#generación-del-enlace-público)
- [Persistencia local](#persistencia-local)
- [Integraciones](#integraciones)
- [Build y despliegue](#build-y-despliegue)
- [Solución de problemas](#solución-de-problemas)
- [Documentación adicional](#documentación-adicional)
- [Estado del proyecto](#estado-del-proyecto)

## Características principales

- Registro e inicio de sesión con email y contraseña.
- Inicio de sesión con Google Identity Services.
- Configuración de los datos y la identidad del negocio.
- Carga de logo con validación de formato y tamaño.
- Generación automática de un slug único.
- Personalización del enlace público disponible una única vez.
- Catálogo de productos y servicios con precio fijo o a convenir.
- Administración de preguntas frecuentes y categorías.
- Normalización y prevención de preguntas frecuentes duplicadas.
- Dashboard para centralizar la actividad comercial.
- Listado, detalle y actualización de consultas.
- Acceso rápido a WhatsApp desde los datos de contacto.
- Chatbot público accesible mediante el enlace del negocio.
- Solicitud de presupuestos desde la conversación.
- Captura de nombre y teléfono para derivaciones.
- Temas claro y oscuro con preferencia persistente.

<!--
## Capturas de pantalla

Agregar aquí capturas representativas del dashboard, la configuración del negocio y el chat público.
-->

## Flujo general

1. El emprendedor crea una cuenta o ingresa con Google.
2. Configura los datos de su negocio y la identidad del asistente.
3. El sistema genera un enlace público único.
4. El emprendedor carga su catálogo y organiza las preguntas frecuentes.
5. Los clientes acceden al chatbot mediante el enlace compartido.
6. El chatbot responde utilizando la información configurada.
7. Las consultas y los datos de contacto quedan registrados.
8. El emprendedor administra la actividad desde su panel.

```mermaid
flowchart LR
    E[Emprendedor] --> F[Frontend React]
    C[Cliente] --> F
    F --> G[Google Identity Services]
    F --> A[API REST]
    A --> B[Backend Node.js y Express]
    B --> P[Prisma ORM]
    P --> D[(PostgreSQL)]
```

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React 19 | Interfaz y composición de componentes |
| TypeScript 6 | Tipado estático |
| Vite 8 | Desarrollo y build |
| React Router 7 | Enrutamiento SPA |
| `@react-oauth/google` | Inicio de sesión con Google |
| ESLint | Análisis estático |
| CSS | Tokens, temas y estilos globales |

## Requisitos

- Node.js compatible con Vite 8. Se recomienda Node.js 20.19 o superior.
- npm.
- Backend de EmprendeBot instalado y ejecutándose.
- Una base PostgreSQL accesible por el backend.
- Un OAuth Client ID de Google si se habilitará el acceso con Google.

## Instalación

Desde la carpeta del frontend:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

No se deben subir archivos `.env` ni credenciales al repositorio.

## Variables de entorno

### `VITE_API_URL`

URL base de la API, incluyendo el prefijo `/api`.

```env
VITE_API_URL=http://localhost:3000/api
```

Si no se define, el cliente utiliza:

```text
http://localhost:3000/api
```

Ejemplo de producción:

```env
VITE_API_URL=https://api.ejemplo.com/api
```

### `VITE_GOOGLE_CLIENT_ID`

Client ID público de Google OAuth utilizado por `GoogleOAuthProvider`.

```env
VITE_GOOGLE_CLIENT_ID=000000000000-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

El mismo Client ID debe estar configurado en el backend como `GOOGLE_CLIENT_ID`. Los orígenes autorizados en Google Cloud deben incluir las URLs exactas desde las que se sirve el frontend, por ejemplo:

```text
http://localhost:5173
https://frontend.ejemplo.com
```

> Las variables cuyo nombre comienza con `VITE_` quedan disponibles en el bundle del navegador. Nunca deben contener secretos.

## Ejecución local

### 1. Levantar el backend

En otra terminal:

```bash
cd ../chatbot-innova-backend
npm run dev
```

El backend local debe quedar disponible en:

```text
http://localhost:3000
```

### 2. Levantar el frontend

```bash
npm run dev
```

Vite mostrará la URL local, normalmente:

```text
http://localhost:5173
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite en modo desarrollo con recarga rápida |
| `npm run build` | Ejecuta TypeScript y genera el bundle de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run preview` | Sirve localmente el build generado en `dist/` |

Antes de entregar cambios se recomienda ejecutar:

```bash
npm run lint
npm run build
```

## Rutas

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Público | Splash inicial |
| `/presentacion` | Público | Presentación y opciones de acceso |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Creación de cuenta |
| `/configurar` | Protegido | Alta y edición del negocio y del bot |
| `/dashboard` | Protegido | Panel principal del emprendedor |
| `/consultas` | Protegido | Listado y detalle de consultas |
| `/faq` | Protegido | Administración de FAQ y categorías |
| `/catalogo` | Protegido | Catálogo de productos y servicios |
| `/catalogo/agregar` | Protegido | Alta de producto o servicio |
| `/catalogo/editar/:id` | Protegido | Edición de producto o servicio |
| `/:slug` | Público | Chat público de un negocio |

Las rutas privadas se protegen mediante `ProtectedRoute`. Si no existe un usuario autenticado, la navegación se reemplaza por `/login`.

## Arquitectura

```text
src/
├── components/
│   ├── chat/          Componentes de conversación pública
│   ├── consultas/     Tarjetas y detalle de consultas
│   ├── dashboard/     Componentes de métricas
│   ├── faq/           Formularios y tarjetas de FAQ
│   ├── layout/        Navegación lateral
│   └── ui/            Componentes visuales reutilizables
├── context/
│   ├── AuthContext.tsx       Sesión, login y registro
│   ├── BusinessContext.tsx   Negocio activo y operaciones asociadas
│   └── ThemeContext.tsx      Tema claro/oscuro
├── hooks/
│   ├── useChat.ts            Flujo conversacional
│   ├── useConsultas.ts       Estado de consultas
│   ├── useFaqs.ts            Gestión de FAQ
│   └── useTheme.ts           Acceso al tema
├── pages/              Pantallas asociadas a rutas
├── services/
│   ├── apiClient.ts            Cliente HTTP central
│   ├── faqApi.ts               API privada de FAQ
│   ├── faqCategoryApi.ts       API de categorías
│   ├── publicApi.ts            API pública de FAQ
│   ├── publicConsultationApi.ts API pública de consultas
│   └── *Storage.ts             Persistencia de datos en el navegador
├── styles/             Identidad visual
├── types/              Tipos compartidos
├── App.tsx             Definición de rutas
├── main.tsx            Providers y montaje de React
└── index.css           Tokens y estilos globales
```

### Providers

La aplicación se monta con esta jerarquía:

```text
BrowserRouter
└── GoogleOAuthProvider
    └── ThemeProvider
        └── AuthProvider
            └── BusinessProvider
                └── App
```

- `AuthProvider` mantiene el usuario y el JWT.
- `BusinessProvider` sincroniza el negocio del usuario y limpia el estado al cambiar de cuenta.
- `ThemeProvider` conserva la preferencia visual.

## Integración con el backend

Todas las solicitudes pasan por `src/services/apiClient.ts`.

El cliente:

- Usa `VITE_API_URL` como URL base.
- Agrega `Content-Type: application/json` salvo que el cuerpo sea `FormData`.
- Adjunta `Authorization: Bearer <token>` en endpoints privados.
- Permite desactivar autenticación con `{ auth: false }`.
- Convierte respuestas HTTP fallidas en errores con un mensaje legible.

Ejemplo privado:

```ts
await apiRequest('/bot', {
  method: 'PUT',
  body: JSON.stringify({ nombreNegocio: 'Mi negocio' }),
})
```

Ejemplo público:

```ts
await apiRequest('/public/chatbot/mi-negocio/faqs', {
  auth: false,
})
```

### Endpoints principales utilizados

| Área | Endpoints |
| --- | --- |
| Autenticación | `/auth/register`, `/auth/login`, `/auth/google` |
| Bot | `/bot`, `/bot/config`, `/bot/slug`, `/bot/rubros` |
| FAQ | `/faqs`, `/faqs/:id` |
| Categorías | `/faq-categories`, `/faq-categories/:id` |
| Consultas privadas | `/consultations`, `/consultations/:id` |
| Chat público | `/public/chatbot/:slug/faqs` y endpoints públicos de consultas, mensajes y contacto |

## Autenticación

Después del login, el frontend guarda:

```text
eb_auth_token
eb_current_user
```

El JWT se envía en los endpoints protegidos. Al cerrar sesión se eliminan ambos valores y `BusinessProvider` limpia el negocio activo para impedir que una cuenta nueva herede información visual de la cuenta anterior.

### Google

`GoogleLogin` obtiene una credencial de Google y la envía a:

```http
POST /api/auth/google
```

La credencial se verifica en el backend. El nombre personal de Google no debe utilizarse automáticamente como nombre del negocio.

En desarrollo, React `StrictMode` puede provocar la advertencia de que `google.accounts.id.initialize()` fue llamado más de una vez. Es una advertencia asociada al doble montaje de efectos en desarrollo; no equivale a un error HTTP del backend.

## Generación del enlace público

El flujo esperado es:

1. Se crea la cuenta del emprendedor.
2. El bot inicial queda sin `nombreNegocio` y sin `slug`.
3. El emprendedor completa la configuración.
4. El backend genera un slug único usando el nombre real del negocio.
5. El frontend presenta la URL como `${window.location.origin}/${slug}`.

Ejemplo:

```text
Nombre personal: Juan Pérez
Nombre del negocio: Pastelería Dulce
Enlace público: https://frontend.ejemplo.com/pasteleria-dulce
```

Si el slug ya existe, el backend agrega un sufijo numérico. El emprendedor puede personalizarlo una vez desde Configuración.

## Persistencia local

El MVP utiliza `localStorage` y `sessionStorage` para complementar la API.

| Clave o grupo | Contenido |
| --- | --- |
| `eb_auth_token` | JWT de la sesión |
| `eb_current_user` | Usuario autenticado |
| `eb_businesses` | Datos de negocios asociados a los usuarios del navegador |
| Preferencia de tema | Tema claro u oscuro |
| Historial del chat | Mensajes mostrados en el navegador |
| Estado del chat | Etapa activa del flujo conversacional |
| Consultas locales | Datos de consultas conservados en el navegador |
| `emprendebot:consulta:<slug>` | ID de consulta pública durante la pestaña actual |

No se deben almacenar secretos en estas claves. El usuario puede modificar o eliminar cualquier dato guardado en el navegador.

## Integraciones

| Módulo | Integración |
| --- | --- |
| Registro e inicio de sesión | API REST |
| Inicio de sesión con Google | Google Identity Services y API REST |
| Configuración del negocio | API REST |
| Logo | API mediante `FormData` |
| Slug y enlace público | API REST |
| Preguntas frecuentes y categorías | API REST |
| Catálogo | Aplicación web |
| Consultas | API REST |
| Chat público | API REST y aplicación web |
| Historial de conversación | Navegador |
| Tema visual | Navegador |

## Build y despliegue

Generar el build:

```bash
npm run build
```

La salida se escribe en:

```text
dist/
```

Probar el resultado localmente:

```bash
npm run preview
```

### Reescritura de rutas SPA

El proyecto incluye `public/_redirects`:

```text
/* /index.html 200
```

Esto permite que rutas como `/dashboard` o `/mi-negocio` funcionen al abrirse directamente en plataformas compatibles con este formato, como Netlify.

En otros proveedores debe configurarse una regla equivalente para enviar las rutas desconocidas a `index.html`.

### Variables en producción

Configurar en el proveedor de despliegue:

```env
VITE_API_URL=https://url-publica-del-backend/api
VITE_GOOGLE_CLIENT_ID=client-id-de-google
```

Las variables de Vite se incorporan durante el build. Después de modificarlas es necesario volver a desplegar.

## Solución de problemas

### `ERR_CONNECTION_REFUSED` hacia el puerto 3000

El frontend no encuentra el backend local.

Comprobar:

```bash
cd ../chatbot-innova-backend
npm run dev
```

También verificar que `VITE_API_URL` incluya `/api`.

### Error de CORS

La URL exacta del frontend debe estar permitida en la configuración CORS del backend. El protocolo, dominio y puerto deben coincidir.

### Google muestra `origin is not allowed`

Agregar la URL del frontend en **Authorized JavaScript origins** dentro de Google Cloud Console y comprobar que frontend y backend utilicen el mismo Client ID.

### Google se inicializa más de una vez

En desarrollo puede deberse a React `StrictMode`. Si el acceso funciona, la advertencia no está relacionada con una solicitud rechazada por la API.

### El backend responde `401`

- Comprobar que exista `eb_auth_token`.
- Volver a iniciar sesión si el JWT expiró.
- Verificar que `VITE_API_URL` apunte al entorno correcto.

### Los cambios del `.env` no aparecen

Detener y volver a iniciar Vite:

```bash
npm run dev
```

## Documentación adicional

- `COMPONENTS.md`: inventario visual y convenciones de componentes.
- `src/App.tsx`: rutas disponibles.
- `src/services/apiClient.ts`: comportamiento del cliente HTTP.
- Repositorio backend: API, Prisma, autenticación y servicios públicos.

## Estado del proyecto

EmprendeBot corresponde al MVP funcional desarrollado para InnovaLab. El sistema integra autenticación, configuración del negocio, catálogo, preguntas frecuentes, gestión de consultas y un chatbot público conectado mediante API REST.

La arquitectura está organizada para facilitar el mantenimiento, la lectura del código y futuras ampliaciones del producto.
