# Documentación de hooks — Top5

Referencia de todos los hooks de React usados en el proyecto: hooks nativos y custom hooks propios.

---

## Índice

- [Hooks nativos](#hooks-nativos)
  - [useState](#usestate)
  - [useEffect](#useeffect)
  - [useMemo](#usememo)
  - [useCallback](#usecallback)
- [Custom hooks](#custom-hooks)
  - [useAuth](#useauth)
  - [useRankings](#userankings)
  - [useShare](#useshare)

---

## Hooks nativos

### useState

Gestiona estado local dentro de un componente o hook. En este proyecto se usa para:

| Archivo | Variable | Tipo | Propósito |
|---|---|---|---|
| `AuthContext.tsx` | `user` | `User \| null` | Usuario autenticado actual |
| `AuthContext.tsx` | `isInitialized` | `boolean` | Evita redirecciones prematuras mientras se restaura la sesión |
| `RankingContext.tsx` | `rankings` | `Ranking[]` | Lista de rankings del usuario |
| `RankingContext.tsx` | `isLoading` | `boolean` | Estado de carga durante el fetch |
| `CategoryContext.tsx` | `categories` | `Category[]` | Lista de categorías disponibles |
| `ThemeContext.tsx` | `theme` | `'light' \| 'dark'` | Tema activo, inicializado desde `localStorage` |
| `ToastContext.tsx` | `toasts` | `Toast[]` | Notificaciones activas en pantalla |
| `useShare.ts` | `copied` | `boolean` | Feedback visual del botón "Copiar enlace" |

---

### useEffect

Ejecuta efectos secundarios (llamadas a la API, sincronización con el DOM, limpieza de recursos) después del render.

**`AuthContext.tsx` — restaurar sesión al cargar:**
```ts
useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) { setIsInitialized(true); return }
  api.get<User>('/auth/me')
    .then(user => setUser(user))
    .finally(() => setIsInitialized(true))
}, [])
```
Se ejecuta una sola vez al montar. Si hay token en `localStorage`, lo valida con el backend antes de marcar `isInitialized`.

---

**`RankingContext.tsx` — recargar rankings cuando cambia la sesión:**
```ts
useEffect(() => {
  let cancelled = false
  setIsLoading(true)
  api.get<Ranking[]>('/rankings')
    .then(data => { if (!cancelled) setRankings(data) })
    .finally(() => { if (!cancelled) setIsLoading(false) })
  return () => { cancelled = true }
}, [isAuthenticated])
```
Depende de `isAuthenticated`: cuando el usuario hace login o logout, la lista se recarga automáticamente. La función de limpieza (`cancelled = true`) evita actualizar el estado si el componente se desmonta antes de que llegue la respuesta.

---

**`CategoryContext.tsx` — cargar categorías al montar:**
```ts
useEffect(() => {
  api.get<Category[]>('/categories').then(setCategories)
}, [])
```
Array de dependencias vacío: se ejecuta una sola vez al montar el provider.

---

**`ThemeContext.tsx` — sincronizar tema con el DOM:**
```ts
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('theme', theme)
}, [theme])
```
Se ejecuta cada vez que `theme` cambia: actualiza la clase `dark` en `<html>` y persiste la preferencia en `localStorage`.

---

### useMemo

Memoriza el resultado de un cálculo y solo lo recalcula cuando cambian sus dependencias.

> **Nota:** El uso en este proyecto es **demostrativo**. El cálculo de `canCreate` es trivial (una comparación booleana) y no justifica la memoización en producción. `useMemo` aporta valor real cuando el cálculo es costoso (filtrados complejos, transformaciones de listas grandes) o cuando el resultado se pasa como prop a un componente memoizado con `React.memo`.

**`useRankings.ts` — `canCreate`:**
```ts
const canCreate = useMemo(
  () => isPremium || rankings.length < FREE_LIST_LIMIT,
  [isPremium, rankings.length]
)
```
Deriva si el usuario puede crear más rankings. Solo se recalcula si cambia `isPremium` o el número de rankings.

**Cuándo usarlo de verdad en este proyecto:** si se añade filtrado o búsqueda en `Home` (ej. filtrar rankings por categoría), el array filtrado sería un candidato real para `useMemo`.

---

### useCallback

Memoriza una función y mantiene la misma referencia entre renders mientras sus dependencias no cambien.

**`ToastContext.tsx` — funciones de notificación (uso genuino):**
```ts
const remove = useCallback((id: number) => {
  setToasts(prev => prev.filter(t => t.id !== id))
}, [])

const addToast = useCallback((msg: string, type: ToastType) => {
  const id = Date.now()
  setToasts(prev => [...prev, { id, msg, type }])
  setTimeout(() => remove(id), 4000)
}, [remove])

const showError   = useCallback((msg: string) => addToast(msg, 'error'),   [addToast])
const showSuccess = useCallback((msg: string) => addToast(msg, 'success'), [addToast])
```
Aquí es genuinamente útil: `addToast` depende de `remove`, y `showError`/`showSuccess` dependen de `addToast`. Sin `useCallback`, cada render del provider crearía nuevas referencias, rompiendo las cadenas de dependencias entre los propios callbacks.

---

**`useShare.ts` — función `share` (uso demostrativo):**
```ts
const share = useCallback(async (id: string, title: string) => {
  // ...
}, [])
```

> **Nota:** Demostrativo. `useCallback` solo evita renders innecesarios si la función se pasa como prop a un componente envuelto en `React.memo`. Actualmente `RankingCard` no usa `React.memo`, así que el beneficio es nulo. Aportaría valor real si se añadiera `React.memo` a `RankingCard`.

---

## Custom hooks

### useAuth

**Ruta:** `src/hooks/useAuth.ts`

Acceso directo a `AuthContext`. Evita importar `useContext` y `AuthContext` en cada componente.

```ts
export function useAuth() {
  return useContext(AuthContext)
}
```

**Retorna:** `{ user, isAuthenticated, isInitialized, login, register, logout }`

**Dónde se usa:** `Navbar`, `Auth`, `Profile`, `RankingCard`, `PrivateRoute`, `PublicOnlyRoute`.

---

### useRankings

**Ruta:** `src/hooks/useRankings.ts`

Gestiona el estado local de rankings con lógica de límite de plan integrada.

```ts
export function useRankings(isPremium: boolean) {
  const [rankings, setRankings] = useState<Ranking[]>([])

  const canCreate = useMemo(
    () => isPremium || rankings.length < FREE_LIST_LIMIT,
    [isPremium, rankings.length]
  )

  // addRanking, removeRanking, updateRanking
}
```

**Parámetros:** `isPremium: boolean` — determina si aplica el límite de `FREE_LIST_LIMIT = 10`.

**Retorna:** `{ rankings, canCreate, addRanking, removeRanking, updateRanking }`

**Nota:** Este hook gestiona estado local. El estado global de rankings de la app vive en `RankingContext`, que consume la API REST.

---

### useShare

**Ruta:** `src/hooks/useShare.ts`

Abstrae la lógica de compartir un ranking: Web Share API con fallback a portapapeles.

```ts
export function useShare() {
  const [copied, setCopied] = useState(false)

  const share = useCallback(async (id: string, title: string) => {
    const url = `${window.location.origin}/ranking/${id}`
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  return { share, copied }
}
```

**Retorna:**
- `share(id, title)` — ejecuta el flujo de compartir
- `copied` — `true` durante 1,5 s tras copiar al portapapeles; úsalo para mostrar "¡Copiado!" en la UI

**Flujo:**
1. Si `navigator.share` está disponible (móviles, Safari) → abre el diálogo nativo del sistema.
2. Si no → copia la URL al portapapeles y activa `copied` temporalmente.

**Dónde se usa:** `RankingCard`.
