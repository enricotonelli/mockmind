# MockMind

Entrenador de entrevistas laborales con IA. Proyecto final de Ingeniería en
Informática (USAL) — ver [CLAUDE.md](./CLAUDE.md) para el contexto completo del
proyecto (alcance, arquitectura, modelo de datos, etc).

## Estructura

- `backend/`: API REST en Node.js + Express + Prisma (PostgreSQL) + Claude
  (Anthropic). Motor de entrevistas del Módulo 1 completo: auth, sesiones,
  turnos de la entrevista y reporte de feedback.
- `frontend/`: React + Vite + Tailwind CSS. Funciona sola, sin backend, en
  modo demostración (ver más abajo).

## Cómo levantar el proyecto

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Completá `backend/.env` con las **3 credenciales obligatorias** — es el
único archivo donde hay que tocar algo, todas las demás variables ya tienen
un valor por defecto que funciona:

1. **`DATABASE_URL`** — la base PostgreSQL. Lo más simple es crear un
   proyecto gratis en [Supabase](https://supabase.com) y copiar el
   `Connection string` → `URI`. También sirve un Postgres local.
2. **`ANTHROPIC_API_KEY`** — se genera en
   [console.anthropic.com](https://console.anthropic.com) (cuenta distinta a
   la suscripción de Claude/Claude Code). Es la que hace funcionar al
   entrevistador.
3. **`JWT_SECRET`** — un string largo y aleatorio, por ejemplo generado con
   `openssl rand -base64 32`.

Con esas tres completas, creá las tablas en la base y arrancá el servidor:

```bash
npx prisma migrate dev --name inicial
npm run dev
```

Corre en `http://localhost:3000`. `GET /api/health` responde `{ "ok": true }`
si el servidor está arriba (no hace falta la base para eso).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`.

## Modo demostración: la app funciona con o sin backend

El frontend **no necesita que el backend esté prendido** para poder
navegarse: si el backend no responde (está apagado, no configuraste las
credenciales, se cae a mitad de una sesión), cada pantalla cae sola a datos
simulados, sin romperse — vas a ver el aviso "Modo demostración" en la barra
lateral cuando eso pase.

Esto es automático, no hay que tocar nada. Si en algún momento querés
**forzar** que el frontend ignore el backend directamente (por ejemplo para
trabajar en la interfaz sin depender de nada más), creá `frontend/.env` con:

```
VITE_USE_MOCKS=true
```

Ningún módulo del Módulo 3 (creador de CV) tiene backend todavía: corre
siempre en el navegador, a propósito — CLAUDE.md dice explícitamente no
construirlo hasta tener el Módulo 1 funcionando de punta a punta.

Ninguna credencial se sube nunca al repositorio: `backend/.env` y
`frontend/.env` están en `.gitignore` desde el primer commit.
