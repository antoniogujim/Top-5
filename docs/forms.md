# Formularios — Top5

Documentación de los formularios de la aplicación: patrón controlado, gestión de estado, validación y mensajes de error.

---

## Índice

- [Formulario controlado vs no controlado](#formulario-controlado-vs-no-controlado)
- [Formulario de autenticación](#formulario-de-autenticación-srcpagesauthindextsx)
- [Formulario de ranking](#formulario-de-ranking-srcpagescreaterankingindextsx)

---

## Formulario controlado vs no controlado

En React hay dos formas de gestionar inputs:

| | Controlado | No controlado |
|---|---|---|
| El valor vive en | `useState` | el DOM (vía `useRef`) |
| React conoce el valor | En cada tecla | Solo al leer `.current.value` |
| Validación en tiempo real | Sí | No (solo al enviar) |
| Cuándo usarlo | La mayoría de casos | Integraciones con librerías externas, inputs de fichero |

**Todos los formularios de este proyecto usan el patrón controlado**: cada input tiene un `value` ligado a estado y un `onChange` que actualiza ese estado. Esto permite validar en tiempo real, limpiar el formulario programáticamente y reflejar el estado en la UI sin leer el DOM.

---

## Formulario de autenticación — `src/pages/Auth/index.tsx`

Formulario con dos modos (login / registro) que comparten estructura pero muestran campos distintos.

### Estado

```ts
const [mode, setMode]         = useState<Mode>('login')   // 'login' | 'register'
const [error, setError]       = useState('')               // mensaje de error global
const [loading, setLoading]   = useState(false)            // deshabilita el botón al enviar
const [username, setUsername] = useState('')
const [email, setEmail]       = useState('')
const [password, setPassword] = useState('')
const [confirm, setConfirm]   = useState('')
```

### Componente `Field`

Wrapper controlado que recibe el valor y el setter como props:

```tsx
function Field({ label, type, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
```

### Validación

Se ejecuta al enviar (`onSubmit`). Solo hay una regla local: que las contraseñas coincidan en modo registro. El resto de validación (email ya en uso, contraseña incorrecta) llega del servidor como `Error.message`.

```ts
if (mode === 'register' && password !== confirm) {
  setError('Las contraseñas no coinciden')
  return
}
```

### Mensajes de error

Un único `error` de tipo `string` cubre tanto los errores locales como los del servidor. Se muestra centrado, en rojo, encima del botón de envío:

```tsx
{error && <p className="text-sm text-red-500 text-center">{error}</p>}
```

Al cambiar de modo (login ↔ registro) el error se limpia con `setError('')` para no mostrar mensajes del modo anterior.

### Flujo completo

```
Usuario escribe → onChange actualiza estado
Usuario pulsa "Entrar" → handleSubmit:
  1. setError('')
  2. Validación local (contraseñas)  → si falla: setError + return
  3. setLoading(true)
  4. login() / register()            → si falla: setError con mensaje del servidor
  5. navigate('/')                   → si éxito
  6. setLoading(false)               → siempre (finally)
```

---

## Formulario de ranking — `src/pages/CreateRanking/index.tsx`

Formulario complejo que funciona en dos modos: **crear** (`/create`) y **editar** (`/edit/:id`). En modo edición los campos se pre-rellenan con los datos del ranking existente.

### Estado

```ts
const [title, setTitle]       = useState(() => existing?.title ?? '')
const [category, setCategory] = useState<Category>(() => existing?.category ?? 'movies')
const [items, setItems]       = useState<string[]>(() =>
  existing ? EMPTY_ITEMS.map((_, i) => existing.items[i]?.title ?? '') : EMPTY_ITEMS
)
const [errors, setErrors]     = useState<Record<string, string>>({})
const [isAdding, setIsAdding] = useState(false)   // toggle del input de nueva categoría
const [newLabel, setNewLabel] = useState('')       // valor del input de nueva categoría
```

Los estados de `title`, `category` e `items` usan una función inicializadora que se ejecuta solo en el primer render, leyendo el ranking existente si estamos en modo edición.

### Validación

Separada del submit en una función `validate()` que devuelve un mapa de errores:

```ts
const validate = () => {
  const next: Record<string, string> = {}
  if (!title.trim())    next.title = 'El título es obligatorio'
  if (!items[0].trim()) next.item0 = 'La posición 1 es obligatoria'
  return next
}
```

Si el mapa tiene entradas, se guarda en `errors` y se corta el envío. Los errores se limpian campo a campo cuando el usuario empieza a escribir:

```tsx
onChange={(e) => {
  setTitle(e.target.value)
  setErrors((prev) => ({ ...prev, title: '' }))
}}
```

### Mensajes de error inline

Cada campo tiene su propio mensaje debajo del input, visible solo si el error existe:

```tsx
{errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
{errors.item0 && <span className="text-xs text-red-500">{errors.item0}</span>}
```

### Inputs del Top 5

Los 5 items se gestionan como un array de strings. Un helper `updateItem` actualiza solo la posición modificada sin mutar el array:

```ts
const updateItem = (index: number, value: string) =>
  setItems((prev) => prev.map((item, i) => (i === index ? value : item)))
```

Al guardar, los items vacíos se descartan:

```ts
const itemsFiltered = items
  .map((t, i) => ({ position: i + 1, title: t.trim() }))
  .filter((item) => item.title !== '')
```

### Flujo completo

```
Usuario rellena campos → onChange actualiza estado en tiempo real
Usuario pulsa "Crear" / "Guardar" → handleSubmit:
  1. validate()                      → si hay errores: setErrors + return
  2. Filtrar items vacíos
  3. addRanking() / updateRanking()  → si falla: toast de error (en el context), return
  4. navigate('/')                   → si éxito
```
