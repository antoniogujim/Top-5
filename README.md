# Top5

Aplicación web para crear, gestionar y compartir rankings personales de Top 5 en distintas categorías (películas, canciones, videojuegos, comida...). Incluye planes gratuito y Premium, modo oscuro y una API REST propia.

---

## Tabla de contenidos

- [Qué hace la app](#qué-hace-la-app)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Páginas y flujo de usuario](#páginas-y-flujo-de-usuario)
- [Arquitectura frontend](#arquitectura-frontend)
- [API REST (backend)](#api-rest-backend)
- [Planes: Gratis vs Premium](#planes-gratis-vs-premium)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Estado actual del proyecto](#estado-actual-del-proyecto)
- [Pendiente](#pendiente)

---

## Qué hace la app

**Top5** permite a cualquier usuario:

1. Crear rankings de hasta 5 elementos con un título y una categoría.
2. Ver todos sus rankings en una cuadrícula responsiva desde la página principal.
3. Editar o eliminar cualquier ranking (con confirmación modal antes de borrar).
4. Compartir un ranking: si el navegador soporta la Web Share API, abre el diálogo nativo del sistema; si no, copia el enlace directo al portapapeles y muestra el texto "¡Copiado!".
5. Añadir o quitar categorías personalizadas directamente desde el formulario de creación.
6. Cambiar entre modo claro y modo oscuro, que se recuerda entre sesiones.
7. Registrarse e iniciar sesión con email y contraseña — el JWT se persiste en `localStorage` y la sesión se restaura automáticamente al recargar.

Los rankings y categorías se persisten en la API REST. El tema (claro/oscuro) se guarda en `localStorage`.

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | UI |
| TypeScript | 6 | Tipado estático |
| Vite | 8 | Bundler y servidor de desarrollo |
| Tailwind CSS | 4 | Estilos utilitarios |
| React Router DOM | 7 | Enrutado SPA |

### Backend

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js + Express | 4 | Servidor HTTP |
| TypeScript | 5 | Tipado estático |
| JSON Web Tokens | 9 | Autenticación |
| tsx | 4 | Ejecución en desarrollo |

### Herramientas

- **ESLint** con `typescript-eslint`, `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`
- **Vercel** para despliegue (frontend estático + backend como serverless functions)

---

## Estructura del proyecto

```
├── src/                          # Frontend (React)
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Árbol de providers + router
│   ├── api/
│   │   └── client.ts             # Wrapper de fetch: añade JWT automáticamente
│   ├── router/
│   │   └── index.tsx             # Definición de rutas con React Router
│   ├── pages/
│   │   ├── Home/                 # Listado de rankings del usuario
│   │   ├── CreateRanking/        # Formulario crear / editar ranking
│   │   ├── ViewRanking/          # Vista pública de un ranking concreto
│   │   ├── Premium/              # Comparativa de planes y precio
│   │   ├── Auth/                 # Login y registro (conectado con la API)
│   │   └── Profile/              # Perfil del usuario
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx        # Barra de navegación principal
│   │   ├── ranking/
│   │   │   └── RankingCard.tsx   # Tarjeta con Top 5, acciones y modal de confirmación
│   │   └── ui/
│   │       └── Modal.tsx         # Modal reutilizable de confirmación
│   ├── context/
│   │   ├── AuthContext.tsx       # JWT en localStorage, restaura sesión al recargar
│   │   ├── RankingContext.tsx    # CRUD de rankings vía API REST
│   │   ├── CategoryContext.tsx   # Categorías vía API REST
│   │   └── ThemeContext.tsx      # Modo claro/oscuro + persistencia en localStorage
│   ├── hooks/
│   │   ├── useAuth.ts            # Acceso a AuthContext
│   │   ├── useRankings.ts        # Acceso a RankingContext
│   │   └── useShare.ts           # Web Share API con fallback a clipboard
│   ├── types/
│   │   └── index.ts              # Interfaces: User, Ranking, RankingItem, Category
│   └── utils/
│       └── constants.ts          # FREE_LIST_LIMIT = 10, TOP_SIZE = 5, CATEGORIES
│
├── server/                       # Backend (Express)
│   └── src/
│       ├── index.ts              # Entry point, monta Express y define middleware global
│       ├── config/
│       │   └── index.ts          # Variables de entorno (puerto, JWT secret)
│       ├── express.d.ts          # Extiende Request con userId?: string
│       ├── types.ts              # Tipos compartidos del servidor (User, Ranking, JwtPayload...)
│       ├── routes/
│       │   ├── auth.routes.ts    # POST /register, POST /login, GET /me
│       │   ├── rankings.routes.ts# CRUD completo de rankings
│       │   ├── categories.routes.ts # CRUD de categorías
│       │   └── middleware.ts     # requireAuth + optionalAuth (valida Bearer JWT)
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── rankings.controller.ts
│       │   └── categories.controller.ts
│       └── services/
│           ├── auth.service.ts   # Usuarios en memoria (pendiente: base de datos)
│           ├── rankings.service.ts  # Rankings en memoria (pendiente: base de datos)
│           └── categories.service.ts
│
├── public/                       # Assets estáticos servidos por Vite
├── vercel.json                   # Configuración de despliegue (frontend + serverless)
├── package.json                  # Dependencias y scripts del frontend
└── tsconfig*.json                # Configuración TypeScript (app / node / base)
```

---

## Páginas y flujo de usuario

### `/` — Home

- **Sin sesión** — muestra rankings de ejemplo (solo botón "Compartir" visible).
- **Con sesión** — muestra los rankings del usuario. Cada tarjeta expone tres acciones solo si el ranking pertenece al usuario:
  - **Editar** → navega a `/edit/:id` con el formulario pre-relleno.
  - **Compartir** → usa la Web Share API si está disponible o copia el enlace `/ranking/:id` al portapapeles.
  - **Eliminar** → abre un `Modal` de confirmación antes de borrar definitivamente (llama a `DELETE /api/rankings/:id`).

Si no hay rankings propios, se muestra un mensaje de estado vacío.

### `/create` — Crear ranking

Formulario con tres secciones:

1. **Título** — campo de texto libre, obligatorio.
2. **Categoría** — se muestra como chips/píldoras seleccionables. Se puede añadir una categoría nueva pulsando `+`, escribir el nombre y confirmar con `Enter` o `✓`. También se puede eliminar cualquier categoría con la `×` de cada chip.
3. **Top 5** — cinco campos numerados. La posición 1 es obligatoria; las demás son opcionales. Los campos vacíos se descartan al guardar.

Al enviar, el ranking se crea en el backend (`POST /api/rankings`) y redirige al home.

### `/edit/:id` — Editar ranking

Usa el mismo componente `CreateRanking` pero en modo edición: carga los datos del ranking existente y al guardar llama a `PUT /api/rankings/:id`. Si el `:id` no existe, redirige automáticamente al home.

### `/ranking/:id` — Vista pública

Muestra el ranking completo: badge de categoría, título y la lista ordenada de elementos. Incluye un enlace `← Ver todos los rankings` para volver al home.

### `/premium` — Planes

Tabla comparativa entre el plan **Gratis** y **Premium**:

| Característica | Gratis | Premium |
|---|---|---|
| Rankings guardados | Hasta 10 | Ilimitados |
| Top 5 por ranking | Sí | Sí |
| Compartir rankings | Sí | Sí |
| Categorías propias | Sí | Sí |
| Acceso anticipado | No | Sí |

Precio estimado: **2,99 € / mes**. El botón de pago está deshabilitado ("Próximamente").

### `/profile` — Perfil de usuario

Página de solo lectura con la información de la cuenta autenticada:

- **Tarjeta de usuario** — avatar con las iniciales del nombre, username, email y badge de plan (verde para Gratis, amarillo para Premium).
- **Sección de plan** — número de rankings creados frente al límite (con barra de progreso en plan Gratis). Si hay slots disponibles muestra cuántos quedan; si no, muestra un enlace directo a `/premium`.
- **Botón de acción rápida** — "Crear nuevo ranking" si `canCreate`, o "Mejorar plan para crear más" (apunta a `/premium`) si se ha alcanzado el límite.

### `/auth` — Autenticación

Formulario con toggle entre **Iniciar sesión** (email + contraseña) y **Registrarse** (usuario + email + contraseña + confirmar contraseña). Conectado con la API: llama a `POST /api/auth/login` o `POST /api/auth/register`, guarda el JWT en `localStorage` y redirige al home. Los errores del servidor se muestran inline. Si ya hay sesión activa, redirige automáticamente al home.

**Cuentas de prueba disponibles:**

| Email | Contraseña | Plan |
|---|---|---|
| `demo@example.com` | `123456` | Gratis |
| `premium@example.com` | `123456` | Premium |

---

## Arquitectura frontend

### Cliente API (`src/api/client.ts`)

Wrapper sobre `fetch` que centraliza todas las llamadas al backend:

- Añade automáticamente el header `Authorization: Bearer <token>` si hay un JWT en `localStorage`.
- Lanza un `Error` con el mensaje del servidor cuando la respuesta no es `2xx`.
- Maneja correctamente las respuestas `204 No Content` (DELETE).

```ts
import { api } from '../api/client'

const rankings = await api.get<Ranking[]>('/rankings')
const created  = await api.post<Ranking>('/rankings', data)
await api.put('/rankings/123', updates)
await api.del('/rankings/123')
```

### Navbar

La barra de navegación es consciente del estado de autenticación y se adapta al tamaño de pantalla:

- **Sin sesión** — muestra el enlace "Acceder". El botón "Crear" está oculto.
- **Con sesión** — muestra el nombre de usuario (enlace a `/profile`, con estilo de píldora) y el botón "Cerrar sesión". Al hacer logout redirige al home.
- **Plan gratuito con límite alcanzado** — el enlace "Crear" cambia a "Mejorar" y apunta a `/premium`.
- **Móvil** — fila superior con Logo + controles de sesión; fila inferior con los enlaces de navegación (Crear/Mejorar, Premium, username). Los textos "Modo oscuro/claro" y "Cerrar sesión" se acortan a "Oscuro/Claro" y "Salir".

### Protección de rutas

El router usa dos guards:

- **`PrivateRoute`** — si el usuario no está autenticado redirige a `/auth`. Aplicado a `/create`, `/edit/:id` y `/profile`.
- **`PublicOnlyRoute`** — si el usuario ya tiene sesión redirige al home. Aplicado a `/auth`.

Ambos guards esperan a que `isInitialized` sea `true` antes de actuar, evitando redirecciones incorrectas durante la restauración de la sesión.

### Contexts y estado global

El árbol de providers en `App.tsx` sigue este orden (de exterior a interior):

```
ThemeProvider
  └── AuthProvider
        └── CategoryProvider
              └── RankingProvider
                    └── AppRouter
```

**`ThemeContext`** — Gestiona `'light' | 'dark'`. Al cambiar, añade/quita la clase `dark` en `<html>` y lo guarda en `localStorage`.

**`AuthContext`** — Al montar comprueba si hay un token en `localStorage` y llama a `GET /api/auth/me` para restaurar la sesión. Expone `login(email, password)`, `register(username, email, password)` y `logout()`. El flag `isInitialized` evita flashes de redirección mientras se verifica el token al cargar la página.

**`CategoryContext`** — Carga las categorías de `GET /api/categories` al montar. `addCategory` y `removeCategory` sincronizan con la API (requieren autenticación).

**`RankingContext`** — Carga rankings de `GET /api/rankings` al montar y cada vez que cambia el estado de autenticación. Con token devuelve los rankings del usuario; sin token devuelve únicamente los rankings de demo (no los de otros usuarios). Expone `addRanking`, `removeRanking` y `updateRanking` (todos asíncronos).

### Modelo de datos

```ts
interface User {
  id: string
  username: string
  email: string
  isPremium: boolean
}

interface Ranking {
  id: string
  title: string
  category: string
  items: RankingItem[] // máximo 5
  userId: string
  createdAt: string   // ISO 8601
  isPublic: boolean
}

interface RankingItem {
  position: number    // 1–5
  title: string
  description?: string
}
```

### Hook `useShare`

Abstrae el comportamiento de compartir:

1. Construye la URL `/ranking/:id`.
2. Si `navigator.share` existe (móviles, Safari), llama a la Web Share API nativa.
3. Si no, copia la URL con `navigator.clipboard.writeText` y activa el estado `copied` durante 1,5 segundos para mostrar "¡Copiado!" en el botón.

---

## API REST (backend)

El servidor Express expone tres grupos de rutas bajo el prefijo `/api`. Las rutas marcadas con `(auth)` requieren un header `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Crea una cuenta nueva |
| `POST` | `/api/auth/login` | Devuelve un JWT (7 días de validez) |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado (auth) |

### Rankings

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/rankings` | Opcional | Con token → rankings del usuario; sin token → rankings públicos |
| `GET` | `/api/rankings/:id` | No | Detalle de un ranking concreto |
| `POST` | `/api/rankings` | Sí | Crea un ranking |
| `PUT` | `/api/rankings/:id` | Sí | Actualiza un ranking (solo el propietario) |
| `DELETE` | `/api/rankings/:id` | Sí | Elimina un ranking (solo el propietario) |

### Categorías

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/categories` | No | Lista todas las categorías |
| `POST` | `/api/categories` | Sí | Crea una categoría nueva |
| `DELETE` | `/api/categories/:value` | Sí | Elimina una categoría |

### Middlewares

- **`requireAuth`** — Extrae el token del header `Authorization: Bearer <token>`, lo verifica y adjunta `userId` al request. Devuelve `401` si falta o es inválido.
- **`optionalAuth`** — Igual que `requireAuth` pero no bloquea si no hay token. Usado en `GET /api/rankings` para personalizar la respuesta según si el usuario está logado o no.

---

## Planes: Gratis vs Premium

La lógica de límites vive en el backend (`rankings.service.ts`) y se replica en el frontend (`RankingContext`):

```ts
const FREE_LIST_LIMIT = 10 // src/utils/constants.ts

// Backend: rankings.service.ts
canCreate(userId: string, isPremium: boolean): boolean {
  if (isPremium) return true
  return rankings.filter(r => r.userId === userId).length < freeListLimit
}
```

Si `canCreate` devuelve `false`, el backend responde `403` y el frontend redirige a `/premium` (tanto desde `/create` como desde el botón de perfil y el enlace de la Navbar).

---

## Instalación y desarrollo local

### Requisitos

- Node.js 18+
- npm 9+

### Frontend

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint
```

### Backend

```bash
cd server
npm install
npm run dev      # http://localhost:3001
npm run build
npm start
```

### Variables de entorno del backend

Crea `server/.env`:

```env
PORT=3001
JWT_SECRET=tu_secreto_muy_seguro
```

> El proxy de Vite (`/api → http://localhost:3001`) hace que el frontend en local apunte automáticamente al backend sin cambiar nada más.

---

## Despliegue en Vercel

`vercel.json` configura dos builders:

- **Frontend** — `@vercel/static-build` ejecuta `npm run build` y sirve `dist/` como SPA.
- **Backend** — `@vercel/node` convierte `server/src/index.ts` en una serverless function.

Las peticiones a `/api/*` se enrutan al servidor Express. El resto llega al frontend React. Al estar en el mismo dominio, el cliente API usa rutas relativas (`/api/...`) sin necesidad de configurar CORS ni URLs absolutas.

### Variables de entorno en Vercel

En el panel de Vercel → tu proyecto → **Settings → Environment Variables**:

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Cadena aleatoria larga para firmar los JWT |
| `PORT` | Opcional — Vercel lo gestiona automáticamente |

```bash
vercel deploy        # preview
vercel --prod        # producción
```

---

## Estado actual del proyecto

| Funcionalidad | Estado |
|---|---|
| CRUD de rankings | Completo (frontend + backend + API) |
| Autenticación JWT | Completo (registro, login, sesión persistente) |
| Protección de rutas | Completo (PrivateRoute + PublicOnlyRoute) |
| Navbar contextual | Completo (muestra usuario, logout, oculta "Crear" sin sesión, responsive) |
| Navbar límite de plan | Completo ("Crear" pasa a "Mejorar" al alcanzar el límite gratuito) |
| Rankings de ejemplo públicos | Completo (solo demo; los rankings de usuarios no se exponen públicamente) |
| Perfil de usuario | Completo (datos de cuenta, progreso de plan, acceso rápido a crear) |
| Categorías personalizadas | Completo (frontend + backend + API) |
| Modo oscuro / claro | Completo |
| Compartir rankings | Completo |
| Vista pública de ranking | Completo |
| Plan Premium / pagos | UI lista — lógica pendiente |

---

## Pendiente

### Prioridad alta

- **Base de datos real** — Actualmente usuarios, rankings y categorías se almacenan en arrays en memoria dentro de los servicios del backend. Al reiniciar el servidor (o en Vercel entre invocaciones serverless) los datos se pierden. Hay que integrar una base de datos persistente (PostgreSQL, MongoDB, SQLite...).
- **Hash de contraseñas** — Las contraseñas se guardan en texto plano. Hay que usar `bcrypt` antes de almacenarlas y al verificar el login.

### Prioridad media

- **Manejo de errores en la UI** — Mostrar mensajes de error cuando las llamadas a la API fallan en Home, CreateRanking o CategoryContext (ahora fallan silenciosamente).
- **Edición de perfil** — La página `/profile` muestra los datos del usuario pero no permite editarlos (requiere endpoint `PUT /api/auth/me` en el backend).

### Prioridad baja

- **Plan Premium / pagos** — Integrar pasarela de pago (Stripe) y lógica de upgrade de cuenta.
- **Persistencia de sesión mejorada** — Refresh tokens para no tener que volver a logarse cada 7 días.
- **Tests** — No hay tests unitarios ni de integración.
