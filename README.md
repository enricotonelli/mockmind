# MockMind

Entrenador de entrevistas laborales con IA. Proyecto final de Ingeniería en
Informática (USAL) — ver [CLAUDE.md](./CLAUDE.md) para el contexto completo del
proyecto (alcance, arquitectura, modelo de datos, etc).

## Estructura

- `backend/`: API REST en Node.js + Express + Prisma (PostgreSQL).
- `frontend/`: React + Vite + Tailwind CSS.

## Cómo levantar el proyecto

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completar las variables, ver abajo
npm run dev
```

Corre en `http://localhost:3000` por defecto. `GET /api/health` responde
`{ "ok": true }` si todo está bien configurado.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173` por defecto (puerto de Vite).

## Próximos pasos para vos (antes de poder probar la app entera)

Este esqueleto levanta, pero para que la aplicación funcione de verdad
(guardar usuarios, chatear con el entrevistador de IA) necesitás completar
`backend/.env` con tres cosas que solo vos podés generar:

1. **Base de datos PostgreSQL** — la forma más simple es crear un proyecto
   gratis en [Supabase](https://supabase.com) y copiar la cadena de conexión
   (`Connection string` → `URI`) en `DATABASE_URL`. También podés usar un
   Postgres local si preferís.
2. **API key de Anthropic** — se genera en
   [console.anthropic.com](https://console.anthropic.com) (es una cuenta
   distinta a tu suscripción de Claude/Claude Code). Copiala en
   `ANTHROPIC_API_KEY`.
3. **JWT_SECRET** — cualquier string largo y aleatorio que uses para firmar
   los tokens de sesión (por ejemplo, generado con
   `openssl rand -base64 32`).

Ninguna de estas credenciales se sube nunca al repositorio: `backend/.env`
está en `.gitignore` desde el primer commit.

Una vez que tengas esas tres variables, avisame y seguimos con el paso 2:
registro e inicio de sesión (JWT + bcrypt).
