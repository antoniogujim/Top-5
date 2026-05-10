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

---

## Qué hace la app

**Top5** permite a cualquier usuario:

1. Crear rankings de hasta 5 elementos con un título y una categoría.
2. Ver todos sus rankings en una cuadrícula responsiva desde la página principal.
3. Editar o eliminar cualquier ranking (con confirmación modal antes de borrar).
4. Compartir un ranking: si el navegador soporta la Web Share API, abre el diálogo nativo del sistema; si no, copia el enlace directo al portapapeles y muestra el texto "¡Copiado!".
5. Añadir o quitar categorías personalizadas directamente desde el formulario de creación.
6. Cambiar entre modo claro y modo oscuro, que se recuerda entre sesiones.

Los datos de rankings y preferencia de tema se persisten en `localStorage`, por lo que no se pierden al cerrar el navegador.

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
│   ├── router/
│   │   └── index.tsx             # Definición de rutas con React Router
│   ├── pages/
│   │   ├── Home/                 # Listado de rankings del usuario
│   │   ├── CreateRanking/        # Formulario crear / editar ranking
│   │   ├── ViewRanking/          # Vista pública de un ranking concreto
│   │   ├── Premium/              # Comparativa de planes y precio
│   │   ├── Auth/                 # Login y registro (UI lista, lógica pendiente)
│   │   └── Profile/              # Perfil del usuario
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx        # Barra de navegación principal
│   │   ├── ranking/
│   │   │   └── RankingCard.tsx   # Tarjeta con Top 5, acciones y modal de confirmación
│   │   └── ui/
│   │       └── Modal.tsx         # Modal reutilizable de confirmación
│   ├── context/
│   │   ├── AuthContext.tsx       # Estado de sesión (usuario logado / no logado)
│   │   ├── RankingContext.tsx    # CRUD de rankings + persistencia en localStorage
│   │   ├── CategoryContext.tsx   # Gestión de categorías (añadir / eliminar)
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
│       ├── config.ts             # Variables de entorno (puerto, JWT secret)
│       ├── types.ts              # Tipos compartidos del servidor (JwtPayload...)
│       ├── routes/
│       │   ├── auth.routes.ts    # POST /register, POST /login, GET /me
│       │   ├── rankings.routes.ts# CRUD completo de rankings
│       │   ├── categories.routes.ts # CRUD de categorías
│       │   └── middleware.ts     # requireAuth — valida Bearer JWT
│       ├── controllers/
│       │   ├── rankings.controller.ts
│       │   └── categories.controller.ts
│       └── services/
│           ├── rankings.service.ts
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

Muestra todos los rankings existentes en una cuadrícula responsiva (1 columna en móvil, 2 en tablet, 3 en escritorio). Cada ranking se renderiza con un `RankingCard` que expone tres acciones:

- **Editar** → navega a `/edit/:id` con el formulario pre-relleno.
- **Compartir** → usa la Web Share API si está disponible o copia el enlace `/ranking/:id` al portapapeles.
- **Eliminar** → abre un `Modal` de confirmación antes de borrar definitivamente.

Si no hay rankings, se muestra un mensaje de estado vacío.

### `/create` — Crear ranking

Formulario con tres secciones:

1. **Título** — campo de texto libre, obligatorio.
2. **Categoría** — se muestra como chips/píldoras seleccionables. Se puede añadir una categoría nueva pulsando `+`, escribir el nombre y confirmar con `Enter` o `✓`. También se puede eliminar cualquier categoría con la `×` de cada chip.
3. **Top 5** — cinco campos numerados. La posición 1 es obligatoria; las demás son opcionales. Los campos vacíos se descartan al guardar.

Al enviar, se valida el formulario. Si hay errores se muestran inline. Si todo es correcto se añade el ranking al estado global y se redirige al home.

### `/edit/:id` — Editar ranking

Usa el mismo componente `CreateRanking` pero en modo edición: carga los datos del ranking existente, muestra "Editar Ranking" como título y al guardar llama a `updateRanking` en vez de `addRanking`. Si el `:id` no existe en el estado, redirige automáticamente al home.

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

### `/auth` — Autenticación

Formulario con toggle entre **Iniciar sesión** (email + contraseña) y **Registrarse** (usuario + email + contraseña + confirmar contraseña). La UI está completa pero la lógica de conexión con el backend está pendiente — se muestra un aviso en la parte inferior.

---

## Arquitectura frontend

### Contexts y estado global

El árbol de providers en `App.tsx` sigue este orden (de exterior a interior):

```
ThemeProvider
  └── AuthProvider
        └── CategoryProvider
              └── RankingProvider
                    └── AppRouter
```

**`ThemeContext`** — Gestiona `'light' | 'dark'`. Al cambiar, añade/quita la clase `dark` en `<html>` (Tailwind dark mode por clase) y lo guarda en `localStorage`.

**`AuthContext`** — Almacena el objeto `User | null` en memoria. Expone `login(user)`, `logout()` e `isAuthenticated`. Al recargar la página la sesión se pierde (pendiente conectar con JWT del backend).

**`CategoryContext`** — Array de `{ value, label }`. Permite añadir categorías nuevas (normaliza el label a kebab-case para el value) y eliminarlas. No persiste entre sesiones.

**`RankingContext`** — Array de `Ranking[]` persistido en `localStorage` (clave `rankings`). Aplica el límite de `FREE_LIST_LIMIT = 10` para usuarios no premium. Expone `addRanking`, `removeRanking` y `updateRanking`.

### Modelo de datos

```ts
interface User {
  id: string
  username: string
  email: string
  isPremium: boolean
}

interface Ranking {
  id: string          // crypto.randomUUID()
  title: string
  category: string    // valor del CategoryItem
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
| `POST` | `/api/auth/login` | Devuelve un JWT |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado (auth) |

### Rankings

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/rankings` | Lista todos los rankings públicos |
| `GET` | `/api/rankings/:id` | Detalle de un ranking concreto |
| `POST` | `/api/rankings` | Crea un ranking (auth) |
| `PUT` | `/api/rankings/:id` | Actualiza un ranking (auth) |
| `DELETE` | `/api/rankings/:id` | Elimina un ranking (auth) |

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Lista categorías disponibles |
| `POST` | `/api/categories` | Crea una categoría (auth) |
| `DELETE` | `/api/categories/:value` | Elimina una categoría (auth) |

El middleware `requireAuth` extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jsonwebtoken` y adjunta el `userId` al request. Devuelve `401` si falta el token o es inválido.

---

## Planes: Gratis vs Premium

La lógica de límites vive en `RankingContext`:

```ts
const FREE_LIST_LIMIT = 10 // src/utils/constants.ts

const canCreate = isPremium || rankings.length < FREE_LIST_LIMIT
```

Si `canCreate` es `false`, el método `addRanking` devuelve `false` sin añadir nada. La UI debe gestionar ese caso mostrando un aviso o redirigiendo a `/premium`.

---

## Instalación y desarrollo local

### Requisitos

- Node.js 18+
- npm 9+

### Frontend

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con HMR en http://localhost:5173
npm run dev

# Compilar para producción
npm run build

# Previsualizar el build de producción
npm run preview

# Lint
npm run lint
```

### Backend

```bash
cd server

# Instalar dependencias
npm install

# Servidor de desarrollo con recarga automática en http://localhost:3000
npm run dev

# Compilar TypeScript a dist/
npm run build

# Arrancar el build compilado
npm start
```

### Variables de entorno del backend

Crea un archivo `server/.env` (o configúralo en Vercel) con:

```env
PORT=3000
JWT_SECRET=tu_secreto_muy_seguro
```

---

## Despliegue en Vercel

`vercel.json` configura dos builders:

- **Frontend** — `@vercel/static-build` ejecuta `npm run build` y sirve la carpeta `dist/` como SPA (cualquier ruta no encontrada redirige a `index.html`).
- **Backend** — `@vercel/node` convierte `server/src/index.ts` en una serverless function.

Las peticiones a `/api/*` se enrutan automáticamente al servidor Express. El resto llega al frontend React.

```bash
# Desplegar
vercel deploy

# Desplegar en producción
vercel --prod
```

---

## Estado actual del proyecto

| Funcionalidad | Estado |
|---|---|
| CRUD de rankings (frontend) | Completo |
| Persistencia en localStorage | Completo |
| Modo oscuro / claro | Completo |
| Compartir rankings | Completo |
| Categorías personalizadas | Completo |
| UI de autenticación | Completo (sin lógica) |
| API REST backend | Estructura completa |
| Conexión frontend ↔ backend | Pendiente |
| Autenticación real (JWT) | Pendiente |
| Plan Premium / pagos | Pendiente (UI lista) |
| Persistencia de categorías | Pendiente |
