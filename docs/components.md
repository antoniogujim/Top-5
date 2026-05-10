# Documentación de componentes — Top5

Referencia de todos los componentes React del proyecto. Se divide en componentes reutilizables (usables desde cualquier página) y sub-componentes locales (definidos dentro de una página y usados solo en ella).

---

## Índice

- [Componentes reutilizables](#componentes-reutilizables)
  - [Modal](#modal)
  - [RankingCard](#rankingcard)
  - [Navbar](#navbar)
- [Sub-componentes de página](#sub-componentes-de-página)
  - [Field (Auth)](#field--auth)
  - [FeatureValue / Check / Cross (Premium)](#featurevalue--check--cross--premium)

---

## Componentes reutilizables

### Modal

**Ruta:** `src/components/ui/Modal.tsx`

Modal de confirmación genérico con dos acciones: confirmar y cancelar. El padre controla si está abierto o cerrado.

**Props:**

```ts
interface ModalProps {
  title: string           // Título del modal
  children: ReactNode     // Contenido del cuerpo (texto, JSX)
  onConfirm: () => void   // Callback al pulsar el botón de confirmar
  onCancel: () => void    // Callback al pulsar cancelar o el fondo oscuro
  confirmLabel?: string   // Texto del botón confirmar (default: "Confirmar")
  confirmDanger?: boolean // true → botón rojo; false (default) → botón verde
}
```

**Uso:**

```tsx
<Modal
  title="Eliminar ranking"
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
  confirmLabel="Eliminar"
  confirmDanger
>
  ¿Seguro que quieres eliminar <strong>{ranking.title}</strong>?
</Modal>
```

**Comportamiento:**
- Se renderiza encima de todo (posición `fixed`, z-index alto).
- El fondo oscuro semitransparente actúa como botón de cancelar.
- Soporta modo oscuro con clases `dark:`.

**Dónde se usa:** `RankingCard` para confirmar borrado.

---

### RankingCard

**Ruta:** `src/components/ranking/RankingCard.tsx`

Tarjeta que muestra un ranking completo con sus items y las acciones disponibles (editar, eliminar, compartir).

**Props:**

```ts
interface RankingCardProps {
  ranking: Ranking   // Datos del ranking a mostrar
  onEdit: (id: string) => void    // Callback al pulsar editar
  onDelete: (id: string) => void  // Callback al pulsar eliminar
}
```

**Tipos relacionados:**

```ts
interface Ranking {
  id: string
  title: string
  category: string
  items: RankingItem[]   // máximo 5
  userId: string
  createdAt: string      // ISO 8601
  isPublic: boolean
}

interface RankingItem {
  position: number       // 1–5
  title: string
  description?: string
}
```

**Uso:**

```tsx
<RankingCard
  ranking={ranking}
  onEdit={(id) => navigate(`/edit/${id}`)}
  onDelete={(id) => removeRanking(id)}
/>
```

**Comportamiento:**
- Muestra el badge de categoría, título, y la lista numerada de items.
- Los botones editar y eliminar son visibles siempre (el control de si el usuario es el propietario lo hace el padre antes de renderizar el componente).
- El botón compartir usa `useShare()`: Web Share API si está disponible, o copia al portapapeles con feedback visual "¡Copiado!" durante 1,5 s.
- Al pulsar eliminar abre un `Modal` de confirmación con `confirmDanger`. Solo llama a `onDelete` si el usuario confirma.
- Soporta modo oscuro.

**Hooks internos:** `useShare()`, `useAuth()`, `useCategories()`.

**Composición:** usa `Modal` internamente para la confirmación de borrado.

**Dónde se usa:** `Home`.

---

### Navbar

**Ruta:** `src/components/layout/Navbar.tsx`

Barra de navegación principal. No recibe props; lee el estado directamente de los contexts.

**Props:** ninguna.

**Uso:**

```tsx
<Navbar />
```

**Comportamiento según estado de auth:**

| Estado | Elementos visibles |
|---|---|
| Sin sesión | Logo, enlace "Crear", "Premium", toggle tema, "Acceder" |
| Con sesión (plan gratis, límite no alcanzado) | Logo, "Crear", "Premium", nombre de usuario → `/profile`, "Cerrar sesión" |
| Con sesión (plan gratis, límite alcanzado) | "Crear" se reemplaza por "Mejorar" → `/premium` |
| Con sesión (Premium) | Igual que con sesión normal, sin restricción de "Mejorar" |

**Diseño responsive:**
- **Desktop** — una sola fila con todos los controles.
- **Móvil** — fila superior: Logo + controles de sesión; fila inferior: enlaces de navegación. Los textos "Modo oscuro/claro" y "Cerrar sesión" se acortan a "Oscuro/Claro" y "Salir".

**Hooks internos:** `useTheme()`, `useAuth()`, `useRankings()`.

**Dónde se usa:** `App.tsx` / `AppRouter`, una sola vez como layout global.

---

## Sub-componentes de página

Estos componentes están definidos dentro del archivo de su página y no se exportan. Se documentan aquí para tener una referencia completa.

---

### Field — Auth

**Definido en:** `src/pages/Auth/index.tsx`

Wrapper de un campo de formulario con su label asociada.

**Props:**

```ts
interface FieldProps {
  label: string                       // Texto de la etiqueta
  type: string                        // Tipo del input (text, email, password)
  placeholder: string                 // Placeholder del input
  inputRef: RefObject<HTMLInputElement> // Ref para leer el valor al enviar
}
```

**Por qué es local:** solo se usa en el formulario de login/registro. No hay otro formulario en la app con la misma estructura de campo.

---

### FeatureValue / Check / Cross — Premium

**Definidos en:** `src/pages/Premium/index.tsx`

Tres mini-componentes para la tabla comparativa de planes.

```ts
// Muestra un check verde o una cruz roja según el valor
interface FeatureValueProps {
  value: boolean | string
}

// Sin props — solo renderiza un SVG de check verde
const Check = () => ...

// Sin props — solo renderiza un SVG de cruz roja
const Cross = () => ...
```

**Por qué son locales:** son específicos de la tabla de comparativa de planes. No hay otro lugar en la app donde se necesite esta semántica visual.
