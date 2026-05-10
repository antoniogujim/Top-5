# Decisiones de arquitectura — Top5

Documento de referencia técnica. Complementa el README con los contratos de la API, el modelo de persistencia, el flujo de datos y las decisiones de diseño sobre componentes y estado.

---

## Índice

- [Flujo de datos](#flujo-de-datos)
- [Persistencia: servidor vs cliente](#persistencia-servidor-vs-cliente)
- [Contratos de la API](#contratos-de-la-api)
- [Componentes reutilizables](#componentes-reutilizables)
- [Gestión de estado](#gestión-de-estado)
- [Decisiones destacadas](#decisiones-destacadas)

---

## Flujo de datos

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│                                                         │
│  Página / Componente                                    │
│       │  useRankings() / useAuth() / useToast()         │
│       ▼                                                 │
│  Context (RankingContext, AuthContext, CategoryContext)  │
│       │  api.get() / api.post() / api.put() / api.del() │
│       ▼                                                 │
│  src/api/client.ts  ←── JWT desde localStorage         │
│       │  fetch("/api/...")                              │
└───────┼─────────────────────────────────────────────────┘
        │  HTTP + Authorization: Bearer <token>
        ▼
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS (server/)                     │
│                                                         │
│  vercel.json → /api/* → server/src/index.ts            │
│       │                                                 │
│  middleware: requireAuth / optionalAuth                 │
│       │  req.userId adjuntado al request                │
│       ▼                                                 │
│  Router → Controller → Service                          │
│                │                                        │
│                ▼                                        │
│         Arrays en memoria                               │
│         (pendiente: base de datos real)                 │
└─────────────────────────────────────────────────────────┘
```

**Ciclo de una operación típica (crear ranking):**

1. El usuario rellena el formulario en `/create`.
2. `RankingContext.addRanking()` llama a `api.post('/rankings', data)`.
3. `client.ts` adjunta el JWT del localStorage en el header `Authorization`.
4. Express recibe la petición, `requireAuth` verifica el token y adjunta `userId`.
5. `rankings.controller.ts → rankings.service.ts` comprueba el límite del plan y guarda.
6. La respuesta `201` llega al contexto, que actualiza el estado local sin recargar la página.
7. Si hay error, el contexto llama a `showError()` del `ToastContext` y devuelve `false`.

---

## Persistencia: servidor vs cliente

| Dato | Dónde vive | Por qué |
|---|---|---|
| Usuarios (id, username, email, isPremium, password) | Servidor (en memoria, pendiente BD) | Datos sensibles, nunca en el cliente |
| Rankings (id, título, categoría, items, userId) | Servidor (en memoria, pendiente BD) | Datos compartidos entre sesiones |
| Categorías | Servidor (en memoria, pendiente BD) | Compartidas entre usuarios |
| JWT de sesión | `localStorage` | Permite restaurar la sesión sin login repetido al recargar |
| Preferencia de tema (light/dark) | `localStorage` | Preferencia de UI local, no necesita sincronización con el servidor |

**Regla general:** todo lo que necesita sobrevivir a recargas de página y ser compartido entre dispositivos va al servidor. Solo van al cliente las preferencias de UI y el token de sesión.

---

## Contratos de la API

Todas las rutas tienen el prefijo `/api`. Las marcadas con `(auth)` requieren el header `Authorization: Bearer <token>`.

### Autenticación

#### `POST /api/auth/register`

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Respuesta `201`:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isPremium": false
}
```

**Errores:** `400` si faltan campos · `409` si el email ya existe.

---

#### `POST /api/auth/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respuesta `200`:**
```json
{
  "token": "string (JWT, validez 7 días)"
}
```

**Errores:** `400` si faltan campos · `401` si credenciales incorrectas.

---

#### `GET /api/auth/me` — (auth)

**Body:** ninguno.

**Respuesta `200`:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "isPremium": false
}
```

**Errores:** `401` si el token falta o es inválido.

---

### Rankings

#### `GET /api/rankings` — (auth opcional)

**Body:** ninguno.

**Respuesta `200` sin token:** rankings públicos de demo.

**Respuesta `200` con token:** rankings propios del usuario autenticado.

```json
[
  {
    "id": "string",
    "title": "string",
    "category": "string",
    "items": [
      { "position": 1, "title": "string", "description": "string (opcional)" }
    ],
    "userId": "string",
    "createdAt": "string (ISO 8601)",
    "isPublic": true
  }
]
```

---

#### `GET /api/rankings/:id`

**Body:** ninguno.

**Respuesta `200`:** objeto `Ranking` (mismo esquema que arriba).

**Errores:** `404` si no existe.

---

#### `POST /api/rankings` — (auth)

**Body:**
```json
{
  "title": "string",
  "category": "string",
  "items": [
    { "position": 1, "title": "string", "description": "string (opcional)" }
  ],
  "isPublic": true
}
```

**Respuesta `201`:** objeto `Ranking` completo con `id`, `userId` y `createdAt` generados por el servidor.

**Errores:** `400` si faltan campos obligatorios · `403` si el usuario gratuito ha alcanzado el límite de 10 rankings · `401` si no hay token.

---

#### `PUT /api/rankings/:id` — (auth)

**Body:** igual que `POST`, todos los campos son opcionales (solo se actualizan los enviados).

**Respuesta `200`:** objeto `Ranking` actualizado.

**Errores:** `404` si no existe · `403` si el ranking no pertenece al usuario autenticado.

---

#### `DELETE /api/rankings/:id` — (auth)

**Body:** ninguno.

**Respuesta `204`:** sin cuerpo.

**Errores:** `404` si no existe · `403` si el ranking no pertenece al usuario autenticado.

---

### Categorías

#### `GET /api/categories`

**Body:** ninguno.

**Respuesta `200`:**
```json
["peliculas", "series", "canciones", "videojuegos", "comida", "otros"]
```

---

#### `POST /api/categories` — (auth)

**Body:**
```json
{
  "value": "string (kebab-case)",
  "label": "string (nombre legible)"
}
```

**Respuesta `201`:** la cadena `value` de la categoría creada.

**Errores:** `400` si faltan campos · `409` si ya existe.

---

#### `DELETE /api/categories/:value` — (auth)

**Body:** ninguno.

**Respuesta `204`:** sin cuerpo.

**Errores:** `404` si no existe.

---

## Componentes reutilizables

### `Modal` — `src/components/ui/Modal.tsx`

Modal de confirmación genérico. Se usa actualmente para confirmar el borrado de un ranking.

**Props:**
```ts
interface ModalProps {
  isOpen: boolean          // controla visibilidad
  title: string            // título del modal
  message: string          // cuerpo del mensaje
  onConfirm: () => void    // callback al pulsar confirmar
  onCancel: () => void     // callback al pulsar cancelar o el backdrop
  danger?: boolean         // true → botón confirmar en rojo; false (default) → verde
}
```

**Decisión de diseño:** el componente no gestiona su propio estado abierto/cerrado — el padre decide cuándo mostrarlo y cuándo cerrarlo. Esto evita que el modal tenga lógica de negocio propia.

---

### `RankingCard` — `src/components/ranking/RankingCard.tsx`

Tarjeta que representa un ranking completo con sus acciones.

**Props:**
```ts
interface RankingCardProps {
  ranking: Ranking         // datos del ranking a mostrar
  isOwner: boolean         // muestra/oculta los botones editar y eliminar
}
```

Internamente contiene el estado `showDeleteModal` (boolean) para el modal de confirmación de borrado y el estado `copied` para el feedback visual del botón compartir. Llama a `useRankings()` para ejecutar el borrado y a `useShare()` para compartir.

**Decisión de diseño:** el componente encapsula toda la interacción de una tarjeta (compartir, confirmar borrado) para que la página `Home` sea solo una cuadrícula sin lógica por elemento.

---

## Gestión de estado

Se usa **React Context** en lugar de una librería externa (Redux, Zustand) porque la aplicación tiene un árbol de dependencias sencillo y predecible. No hay estado compartido entre ramas no relacionadas del árbol de componentes.

### Árbol de providers (`App.tsx`)

```
ToastProvider          ← nivel más externo: cualquier context puede mostrar toasts
  ThemeProvider        ← independiente de auth
    AuthProvider       ← auth debe estar antes que ranking y categorías
      CategoryProvider ← carga categorías al montar
        RankingProvider← recarga rankings cuando cambia el estado de auth
          AppRouter
```

**Por qué este orden:**
- `ToastProvider` está arriba de todo para que los otros contexts puedan llamar a `showError` / `showSuccess` desde sus propios efectos sin romper las reglas de hooks.
- `AuthProvider` va antes que `RankingProvider` porque `RankingContext` necesita saber si el usuario está autenticado para decidir qué endpoint llamar (`GET /api/rankings` con o sin token).

### Qué gestiona cada context

| Context | Estado | Efectos secundarios |
|---|---|---|
| `ToastContext` | Lista de toasts activos | Auto-dismiss a los 4 s |
| `ThemeContext` | `'light' \| 'dark'` | Añade/quita clase `dark` en `<html>`, escribe en localStorage |
| `AuthContext` | `user`, `isAuthenticated`, `isInitialized` | Al montar: verifica JWT en localStorage con `GET /api/auth/me` |
| `CategoryContext` | `categories[]` | Al montar: `GET /api/categories` |
| `RankingContext` | `rankings[]`, `canCreate` | Al cambiar `isAuthenticated`: `GET /api/rankings` |

---

## Decisiones destacadas

### Autenticación sin refresh tokens
El JWT tiene validez de 7 días y se guarda en `localStorage`. No hay refresh token. Decisión deliberada de simplicidad para la versión actual — se puede añadir después (ver sección Pendiente del README).

### `isInitialized` en `AuthContext`
Antes de que `AuthProvider` termine de verificar el JWT almacenado, `isAuthenticated` es `false`. Sin el flag `isInitialized`, los guards de ruta (`PrivateRoute`, `PublicOnlyRoute`) redirigirían al login antes de que la sesión se restaure. Los guards esperan a que `isInitialized === true` antes de actuar.

### Datos en memoria en el backend
Los servicios del servidor usan arrays en memoria. En producción (Vercel serverless) cada invocación puede arrancar una instancia nueva, perdiendo los datos. Es el principal pendiente técnico del proyecto (ver README → Pendiente → Prioridad alta).

### Rutas relativas en el cliente API
`client.ts` usa rutas relativas (`/api/...`) en lugar de una URL absoluta. Funciona en local gracias al proxy de Vite y en producción porque frontend y backend comparten dominio en Vercel. Si el backend se mueve a otro dominio habrá que añadir una variable de entorno `VITE_API_URL`.
