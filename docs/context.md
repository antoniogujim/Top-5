# Context API — Top5

Documentación de los contextos globales del proyecto: qué problema resuelve cada uno, cómo está implementado y cuándo tiene sentido usar Context API.

---

## Índice

- [Cuándo usar Context API](#cuándo-usar-context-api)
- [Árbol de providers](#árbol-de-providers)
- [Contextos](#contextos)
  - [ToastContext](#toastcontext)
  - [ThemeContext](#themecontext)
  - [AuthContext](#authcontext)
  - [CategoryContext](#categorycontext)
  - [RankingContext](#rankingcontext)

---

## Cuándo usar Context API

Context API resuelve el problema de **prop drilling**: pasar datos a través de múltiples niveles de componentes que no los necesitan pero los transmiten para que lleguen a un nieto o bisnieto.

| Situación | ¿Usar Context? | Alternativa |
|---|---|---|
| Estado compartido por muchos componentes no relacionados (auth, tema) | Sí | — |
| Estado que sube y baja entre padre e hijo directo | No | Props |
| Estado local de un formulario o componente | No | `useState` local |
| Estado complejo con muchas acciones y actualizaciones frecuentes | Con cuidado | Zustand, Redux |
| Caché de datos del servidor | No | React Query, SWR |

**Limitación clave:** cualquier componente que consuma un context se re-renderiza cuando el valor del context cambia. Si el valor cambia muy frecuentemente (ej. posición del ratón, timers), Context API puede degradar el rendimiento. En este proyecto todos los contexts cambian poco (login/logout, cambio de tema, operaciones CRUD), por lo que es la herramienta adecuada.

---

## Árbol de providers

Definido en `src/App.tsx`. El orden importa: un provider solo puede consumir los contexts que están por encima de él en el árbol.

```
ToastProvider          ← más externo: cualquier context puede mostrar toasts
  ThemeProvider        ← independiente de auth y datos
    AuthProvider       ← debe ir antes que ranking y categorías
      CategoryProvider ← puede mostrar toasts de error si falla el fetch
        RankingProvider← depende de isAuthenticated para decidir qué fetch hacer
          AppRouter
```

---

## Contextos

### ToastContext

**Ruta:** `src/context/ToastContext.tsx`

**Problema que resuelve:** mostrar notificaciones transitorias (éxito, error) desde cualquier punto de la app, incluyendo otros contexts que hacen llamadas a la API.

**Estado:**
```ts
interface Toast {
  id: number
  msg: string
  type: 'error' | 'success'
}

const [toasts, setToasts] = useState<Toast[]>([])
```

**API expuesta:**
```ts
showError(msg: string): void    // muestra un toast rojo
showSuccess(msg: string): void  // muestra un toast verde
```

**Comportamiento:** cada toast se elimina automáticamente a los 4 segundos. El usuario también puede cerrarlo pulsándolo. Se renderiza fijo en la esquina inferior-derecha con `position: fixed`, encima de cualquier otro elemento.

**Por qué está en el nivel más externo:** los otros contexts (`RankingContext`, `CategoryContext`, `AuthContext`) necesitan mostrar toasts cuando una llamada a la API falla. Si `ToastProvider` estuviera dentro de `AuthProvider`, el `AuthContext` no podría consumirlo.

**Consumido en:** `RankingContext`, `CategoryContext`, `AuthContext`, y cualquier página que llame a operaciones de la API.

---

### ThemeContext

**Ruta:** `src/context/ThemeContext.tsx`

**Problema que resuelve:** compartir la preferencia de tema (claro/oscuro) y la función para cambiarlo entre `Navbar` y cualquier componente que necesite reaccionar al tema.

**Estado:**
```ts
const [theme, setTheme] = useState<'light' | 'dark'>(() =>
  (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
)
```

La función inicializadora de `useState` lee `localStorage` una sola vez al montar, evitando el flash de tema incorrecto.

**API expuesta:**
```ts
theme: 'light' | 'dark'
toggleTheme(): void
```

**Efecto secundario:** cuando `theme` cambia, se añade o quita la clase `dark` en `<html>` (necesaria para las utilidades `dark:` de Tailwind) y se persiste en `localStorage`.

**Consumido en:** `Navbar` (botón de toggle), y de forma implícita en todos los componentes con clases `dark:` de Tailwind.

---

### AuthContext

**Ruta:** `src/context/AuthContext.tsx`

**Problema que resuelve:** compartir la identidad del usuario autenticado y las funciones de sesión (login, register, logout) con cualquier parte de la app sin pasar props por cada nivel.

**Estado:**
```ts
const [user, setUser] = useState<User | null>(null)
const [isInitialized, setIsInitialized] = useState(false)
```

**API expuesta:**
```ts
user: User | null
isAuthenticated: boolean          // derivado: user !== null
isInitialized: boolean            // true cuando el check inicial de JWT ha terminado
login(email, password): Promise<void>
register(username, email, password): Promise<void>
logout(): void
```

**Inicialización:** al montar, comprueba si hay un JWT en `localStorage`. Si lo hay, llama a `GET /api/auth/me` para validarlo y restaurar el objeto `user`. Solo cuando este proceso termina (con éxito o con error) se pone `isInitialized = true`. Los guards de ruta (`PrivateRoute`, `PublicOnlyRoute`) esperan a `isInitialized` antes de redirigir, evitando flashes de redirección incorrecta.

**Consumido en:** `Navbar`, `Auth`, `Profile`, `RankingCard`, `PrivateRoute`, `PublicOnlyRoute`, `RankingContext`.

---

### CategoryContext

**Ruta:** `src/context/CategoryContext.tsx`

**Problema que resuelve:** compartir la lista de categorías disponibles y las funciones para añadir o eliminar categorías entre el formulario de creación de rankings y cualquier componente que muestre badges de categoría.

**Estado:**
```ts
const [categories, setCategories] = useState<Category[]>([])
```

**API expuesta:**
```ts
categories: Category[]
addCategory(label: string): Promise<void>
removeCategory(value: string): Promise<void>
```

**Comportamiento:** al montar hace `GET /api/categories`. `addCategory` normaliza el `label` a kebab-case para generar el `value` y llama a `POST /api/categories`. Si cualquier operación falla, el estado local no se modifica y se muestra un toast de error, manteniendo la UI consistente con lo que hay en el servidor.

**Consumido en:** `CreateRanking` (selector de categoría), `RankingCard` (badge de categoría), `ViewRanking` (badge de categoría).

---

### RankingContext

**Ruta:** `src/context/RankingContext.tsx`

**Problema que resuelve:** compartir la lista de rankings del usuario y las operaciones CRUD entre `Home`, `CreateRanking` y `Profile`, sin que cada página tenga que hacer su propio fetch.

**Estado:**
```ts
const [rankings, setRankings] = useState<Ranking[]>([])
const [isLoading, setIsLoading] = useState(false)
```

**API expuesta:**
```ts
rankings: Ranking[]
isLoading: boolean
canCreate: boolean                        // false si plan gratis y límite alcanzado
addRanking(data): Promise<boolean>        // false si no se pudo crear
removeRanking(id: string): Promise<boolean>
updateRanking(id: string, data: Partial<Ranking>): Promise<boolean>
```

**Comportamiento:** se recarga automáticamente cuando cambia `isAuthenticated` (efecto con dependencia en `AuthContext`). Sin token devuelve rankings de demo públicos; con token devuelve los del usuario. Todas las operaciones devuelven `boolean` para que el componente llamador sepa si tuvo éxito sin tener que capturar errores — los errores se gestionan internamente con toasts.

**Lógica de plan:** `canCreate` comprueba si el usuario es Premium o si tiene menos de `FREE_LIST_LIMIT = 10` rankings. Si el backend devuelve `403` al intentar crear, también muestra un toast y redirige a `/premium`.

**Consumido en:** `Home`, `CreateRanking`, `Profile`, `Navbar` (para el estado de `canCreate`).
