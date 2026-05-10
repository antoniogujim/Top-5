# Capa de red — cliente API y contrato de tipos

Documento de referencia para la capa de comunicación entre el frontend React y el backend Express.

---

## Índice

- [Wrapper `src/api/client.ts`](#wrapper-srcapiclientts)
- [Contrato de tipos](#contrato-de-tipos)
- [Estados de red en la UI](#estados-de-red-en-la-ui)
- [Flujo de un error de red](#flujo-de-un-error-de-red)

---

## Wrapper `src/api/client.ts`

Abstracción sobre `fetch` que centraliza todas las llamadas HTTP al backend. Ningún componente ni contexto llama a `fetch` directamente.

### API pública

```ts
api.get<T>(path: string): Promise<T>
api.post<T>(path: string, body: unknown): Promise<T>
api.put<T>(path: string, body: unknown): Promise<T>
api.del(path: string): Promise<void>
```

### Comportamiento interno

| Responsabilidad | Detalle |
|---|---|
| Prefijo de ruta | Añade `/api` a todos los paths (`/rankings` → `/api/rankings`) |
| JWT automático | Lee `localStorage.getItem('token')` y añade `Authorization: Bearer <token>` si existe |
| Respuesta 204 | Devuelve `undefined` sin intentar parsear JSON |
| Error de red | Lanza `Error` con `body.message` del servidor o `HTTP <status>` si no hay mensaje |
| Tipado de respuesta | El genérico `<T>` fuerza al llamador a declarar el tipo esperado |

### Ejemplo de uso

```ts
import { api } from '../api/client'

// GET tipado
const rankings = await api.get<Ranking[]>('/rankings')

// POST — el servidor devuelve el recurso creado
const created = await api.post<Ranking>('/rankings', { title, category, items, isPublic: true })

// PUT — actualización parcial
const updated = await api.put<Ranking>(`/rankings/${id}`, { title })

// DELETE — sin cuerpo de respuesta
await api.del(`/rankings/${id}`)
```

---

## Contrato de tipos

Los tipos en `src/types/index.ts` espejean exactamente las interfaces del backend (`server/src/types.ts`). Cualquier cambio en uno debe reflejarse en el otro.

### `User`

```ts
interface User {
  id: string
  username: string
  email: string
  isPremium: boolean
  // password nunca se expone al cliente
}
```

Devuelto por `GET /api/auth/me` y `POST /api/auth/register`.

### `Ranking`

```ts
interface Ranking {
  id: string
  title: string
  category: string   // valor kebab-case, ej. "peliculas"
  items: RankingItem[]
  userId: string
  createdAt: string  // ISO 8601, ej. "2024-01-01"
  isPublic: boolean
}
```

Devuelto por todos los endpoints de `/api/rankings`.

### `RankingItem`

```ts
interface RankingItem {
  position: number      // 1–5
  title: string
  description?: string
}
```

### `Category`

```ts
type Category = string  // valor kebab-case, ej. "peliculas"
```

El backend también maneja un objeto `{ value: string; label: string }` para las categorías completas (valor interno + nombre legible). El frontend lo define como `CategoryItem` en `CategoryContext.tsx`:

```ts
interface CategoryItem {
  value: string   // kebab-case, usado como identificador
  label: string   // nombre legible, ej. "Películas"
}
```

---

## Estados de red en la UI

Cada origen de datos expone los tres estados. La tabla muestra dónde vive cada uno:

| Contexto | `isLoading` | Éxito | Error |
|---|---|---|---|
| `RankingContext` | `isLoading: boolean` | `rankings: Ranking[]` | toast via `showError` |
| `CategoryContext` | `isLoading: boolean` | `categories: CategoryItem[]` | toast via `showError` |
| `AuthContext` | `isInitialized: boolean` (invertido) | `user: User` | lanza `Error` al llamador |

### Cómo consume la UI cada estado

**`Home`** — usa `isLoading` de `RankingContext`:

```tsx
const { rankings, isLoading } = useRankings()

if (isLoading) return <Spinner />
if (rankings.length === 0) return <EmptyState />
return <Grid rankings={rankings} />
```

**`Auth`** — estado local `loading` en el formulario:

```tsx
const [loading, setLoading] = useState(false)
// botón: disabled={loading}, texto: loading ? 'Cargando…' : 'Entrar'
```

**`CreateRanking`** — estado local `isSubmitting` en el formulario:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
// botón: disabled={isSubmitting}, texto: isSubmitting ? 'Guardando…' : 'Crear ranking'
```

---

## Flujo de un error de red

```
fetch lanza / res.ok === false
        │
        ▼
client.ts → throw new Error(body.message ?? `HTTP ${status}`)
        │
        ▼
Context (catch) → showError('mensaje descriptivo')   ← toast visible 4 s
        │
        ▼
Estado local no se modifica  (optimistic update NO aplicado)
```

Las mutaciones (`addRanking`, `updateRanking`, `removeRanking`) devuelven `boolean` para que el componente llamador sepa si debe navegar o mantener el formulario abierto.
