# Estructura de rutas — Top5

Documentación del sistema de enrutado con React Router DOM v7.

---

## Índice

- [Mapa de rutas](#mapa-de-rutas)
- [Guards de ruta](#guards-de-ruta)
- [Página 404](#página-404)
- [Navegación en el código](#navegación-en-el-código)

---

## Mapa de rutas

Definidas en `src/router/index.tsx` con `BrowserRouter` + `Routes` + `Route`.

| Ruta | Página | Acceso | Descripción |
|---|---|---|---|
| `/` | `Home` | Público | Lista de rankings. Sin sesión muestra demo; con sesión muestra los del usuario |
| `/create` | `CreateRanking` | Privado | Formulario para crear un ranking nuevo |
| `/edit/:id` | `CreateRanking` | Privado | Mismo componente que `/create` en modo edición; carga datos del ranking existente |
| `/ranking/:id` | `ViewRanking` | Público | Vista de detalle de un ranking concreto |
| `/premium` | `Premium` | Público | Comparativa de planes y botón de upgrade |
| `/profile` | `Profile` | Privado | Datos de cuenta y progreso de plan del usuario autenticado |
| `/auth` | `Auth` | Solo sin sesión | Formulario de login y registro; redirige al home si ya hay sesión activa |
| `*` | `NotFound` | Público | Página 404 para cualquier URL no reconocida |

---

## Guards de ruta

Implementados como componentes wrapper en el mismo archivo del router.

### `PrivateRoute`

Redirige a `/auth` si el usuario no está autenticado. Aplicado a `/create`, `/edit/:id` y `/profile`.

```tsx
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  if (!isInitialized) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}
```

`if (!isInitialized) return null` — evita redirigir a `/auth` mientras `AuthContext` aún está comprobando el JWT guardado en `localStorage`. Sin esta espera, un usuario con sesión activa vería un flash de redirección al recargar la página.

### `PublicOnlyRoute`

Redirige al home si el usuario ya tiene sesión. Aplicado a `/auth`.

```tsx
function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  if (!isInitialized) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}
```

---

## Página 404

**Ruta:** `src/pages/NotFound/index.tsx`

Se activa con la ruta catch-all `path="*"`, que React Router empareja solo cuando ninguna otra ruta encaja. Muestra el código 404, un mensaje descriptivo y un enlace para volver al home.

```tsx
<Route path="*" element={<NotFound />} />
```

La ruta `*` debe ir siempre la última dentro de `<Routes>` para que las rutas más específicas tengan prioridad.

---

## Navegación en el código

React Router provee tres mecanismos de navegación usados en el proyecto:

**`<Link>`** — navegación declarativa en JSX. Usado en `Navbar`, `NotFound`, `ViewRanking` y `Profile`.
```tsx
<Link to="/create">Crear ranking</Link>
```

**`<Navigate>`** — redirección declarativa en el render. Usado en `PrivateRoute` y `PublicOnlyRoute`.
```tsx
<Navigate to="/auth" replace />
```
El prop `replace` sustituye la entrada actual del historial en lugar de añadir una nueva, evitando que el botón "atrás" lleve a la ruta protegida.

**`useNavigate()`** — navegación imperativa desde event handlers. Usado en `CreateRanking` (tras guardar) y `Auth` (tras login/registro).
```tsx
const navigate = useNavigate()
navigate('/')
```
