# Despliegue en Vercel

URL de producción: **https://top-5-nine.vercel.app**

---

## Arquitectura del despliegue

Frontend y backend se despliegan en el mismo proyecto de Vercel gracias a `vercel.json`:

- **Frontend** — build estático (`npm run build` → `dist/`), servido como SPA.
- **Backend** — `server/src/index.ts` convertido en una serverless function con `@vercel/node`.
- **Enrutado** — las peticiones a `/api/*` van al backend; el resto al frontend. Al estar en el mismo dominio, el cliente usa rutas relativas (`/api/...`) sin CORS ni URLs absolutas.

```json
// vercel.json
{
  "builds": [
    { "src": "package.json",       "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "server/src/index.ts","use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/src/index.ts" },
    { "handle": "filesystem" },
    { "src": "/(.*)",     "dest": "/index.html" }
  ]
}
```

---

## Variables de entorno

Configúralas en **Vercel → proyecto → Settings → Environment Variables**:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `JWT_SECRET` | Sí | Cadena aleatoria larga para firmar los JWT. Nunca usar el valor de desarrollo. |
| `PORT` | No | Vercel lo gestiona automáticamente; no hace falta definirlo. |

> El frontend no necesita ninguna variable de entorno porque usa rutas relativas.

---

## Primer despliegue

### Opción A — CLI de Vercel

```bash
npm i -g vercel   # instalar si no está disponible
vercel login
vercel            # preview
vercel --prod     # producción
```

### Opción B — Dashboard de Vercel

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**.
2. Importar el repositorio de GitHub.
3. Vercel detecta automáticamente el `vercel.json` — no hay que cambiar la configuración de build.
4. Añadir `JWT_SECRET` en **Environment Variables** antes de hacer deploy.
5. Pulsar **Deploy**.

---

## Actualizaciones

Cada `git push` a `main` dispara un deploy automático de producción si el repositorio está conectado a Vercel. Con la CLI:

```bash
vercel --prod
```

---

## Verificar que funciona

Tras el deploy, comprobar:

```bash
# Frontend carga
curl -I https://top-5-nine.vercel.app/

# API responde
curl https://top-5-nine.vercel.app/api/rankings
# Debe devolver JSON con { data, total, page, pages }
```

---

## Limitaciones conocidas

- **Datos en memoria** — El backend usa arrays en memoria. Cada nueva invocación serverless arranca con los datos de demo vacíos. Los datos creados por usuarios no persisten entre invocaciones. Pendiente: integrar una base de datos real.
- **Cold starts** — Las serverless functions tienen latencia inicial en la primera petición tras un periodo de inactividad.
