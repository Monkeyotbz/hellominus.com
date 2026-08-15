# Supabase de Hellominus (chat de ventas)

Proyecto Supabase dedicado al negocio de Hellominus — guarda los leads que califica el chat de ventas (`api/chat.js`). **No es el mismo proyecto que usa KAIROS** (ese lo usa `agents/linkedin-agent` con sus propias credenciales); acá se crea uno nuevo para no mezclar datos de negocio de Hellominus con la app personal.

```
Visitante del sitio          api/chat.js               Supabase (este proyecto)
┌──────────────────┐   ┌──────────────────────┐   ┌─────────────────────┐
│ chatea en el      │──▶│ Claude conduce la    │──▶│ tabla `leads`       │
│ ChatWidget        │   │ venta, cuando ya     │   │ (nombre, email,     │
│                   │   │ calificó llama la    │   │  resumen, transcript)│
│                   │   │ tool registrar_lead  │   │                     │
└──────────────────┘   └──────────────────────┘   └─────────────────────┘
                              │
                              ▼
                        también notifica por
                        Formspree (FORM_ENDPOINT)
```

## Configuración (una sola vez)

### 1. Crear el proyecto

1. [supabase.com](https://supabase.com) → **New project** → nombralo algo como `hellominus-web`.
2. Guardá la contraseña de la base que te pide crear (no hace falta para este flujo, pero Supabase la pide igual).

### 2. Crear la tabla

En el **SQL Editor** del proyecto, pegá y corré [setup.sql](setup.sql). Crea la tabla `leads` con RLS activo (el backend usa la `service_role` key, que bypassa RLS).

### 3. Credenciales

En **Project Settings → API**:
- `Project URL` → `SUPABASE_URL`
- `service_role` key (la secreta, **no** la `anon`) → `SUPABASE_SERVICE_KEY`

Estas dos variables son **server-only**: se configuran en el dashboard de Vercel (Project Settings → Environment Variables) o en tu `.env` local para `vercel dev`, nunca con el prefijo `VITE_` (eso las metería en el bundle del navegador). Ver `.env.example` en la raíz del repo.

### 4. Revisar leads

Mientras no haya un panel propio, `Table Editor → leads` en el dashboard de Supabase alcanza para ver los leads nuevos, filtrar por `estado` y marcarlos como `contactado`/`agendado`/`descartado` a mano. Si el volumen crece, vale la pena armar una vista simple en KAIROS o un panel dedicado — no está en el alcance de esta primera versión.
