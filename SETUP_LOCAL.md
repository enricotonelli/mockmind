# Setup Local — MockMind

Guía para ejecutar MockMind en tu máquina local para desarrollo y testing.

## Requisitos

- Node.js v23.10+ (verificar con `node --version`)
- npm v10+ (verificar con `npm --version`)
- PostgreSQL 14+ (local o Docker)
- Git

## Paso 1: Clonar y instalar

```bash
# Clonar repositorio
git clone https://github.com/tuusuario/mockmind.git
cd mockmind/frontend-next

# Instalar dependencias
npm install
```

## Paso 2: Configurar base de datos

### Opción A: PostgreSQL local

```bash
# Crear base de datos (en tu terminal PostgreSQL o psql)
createdb mockmind_dev

# En frontend-next/.env.local, setear:
DATABASE_URL="postgresql://postgres:password@localhost:5432/mockmind_dev"
```

### Opción B: PostgreSQL en Docker

```bash
docker run --name mockmind-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mockmind_dev \
  -p 5432:5432 \
  -d postgres:16

# En frontend-next/.env.local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/mockmind_dev"
```

## Paso 3: Configurar variables de entorno (GRATIS)

Crear/actualizar `frontend-next/.env.local`:

```env
# Frontend
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Base de datos
DATABASE_URL="postgresql://postgres:password@localhost:5432/mockmind_dev"

# JWT (cambiar en producción)
JWT_SECRET="secreto-desarrollo-cambiar-en-prod"

# Google Gemini (FREE TIER: 15 requests/min)
# Obtener en: https://aistudio.google.com/apikey
# Free tier suficiente para desarrollo (~1-2 sesiones/día)
GOOGLE_GENERATIVE_AI_API_KEY="AIz..."

# Modelo (gemini-1.5-flash es rápido y en free tier)
GOOGLE_GENERATIVE_AI_MODEL="gemini-1.5-flash"

# Voz (STT/TTS): Web Speech API del navegador - GRATIS 100%
# No requiere API key, corre todo en el cliente
```

**Costo: $0** ✅

**Limitaciones:**
- Google Gemini free tier: 15 requests/min (~1-2 entrevistas/día)
- Web Speech API: disponible en navegadores modernos (Chrome, Firefox, Safari, Edge)

## Paso 4: Crear tablas (primera vez)

```bash
cd frontend-next
npx prisma migrate dev --name initial
```

Esto:
- Crea todas las tablas en la base de datos local
- Genera el cliente de Prisma en `node_modules/.prisma`
- Te pregunta si quieres crear un seed (pulsa Enter para no)

## Paso 5: Ejecutar servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/

## Testing sin APIs reales

Si **no tienes** API keys de Anthropic/OpenAI:

En `frontend-next/.env.local`, setear:
```env
NEXT_PUBLIC_USE_MOCKS=true
```

Esto usa datos mock en lugar de llamar a las APIs reales. Útil para:
- Probar UI/UX sin costar dinero
- Desarrollo offline
- Testing rápido

## Recorrido de testing

### 1. Registro
```
GET http://localhost:3000/registro
- Crear usuario nuevo
- Email: test@example.com
- Contraseña: Password123
```

### 2. Login
```
GET http://localhost:3000/login
- Email: test@example.com
- Contraseña: Password123
- Debe redirigir a /entrevista/nueva
```

### 3. Nueva entrevista
```
GET http://localhost:3000/entrevista/nueva
- Poner una descripción de puesto (cualquier texto)
- Seleccionar tipo: RRHH, Técnica o Estrés
- Click "Empezar entrevista"
```

### 4. Durante la entrevista
```
GET http://localhost:3000/entrevista/[id]
- Ver pregunta del entrevistador
- Responder por texto
- Si modo voz está habilitado: grabar audio en lugar de escribir
- Continuar hasta que se cierren todas las preguntas
```

### 5. Reporte
```
GET http://localhost:3000/reporte/[id]
- Ver puntajes por dimensión
- Leer feedback
- Ver sugerencias
```

### 6. Historial
```
GET http://localhost:3000/historial
- Ver todas las sesiones del usuario
- Clickear una para ver detalles
```

## Estructura de carpetas (local)

```
frontend-next/
├── src/
│   ├── app/
│   │   ├── api/          ← API Routes (backend serverless)
│   │   ├── (auth)/       ← Login, registro
│   │   ├── (app)/        ← Dashboard, entrevista, etc.
│   │   └── layout.jsx
│   ├── components/       ← Componentes React reutilizables
│   ├── lib/              ← Services, auth, Prisma
│   ├── prompts/          ← Prompts de Claude
│   └── api/              ← Cliente HTTP (mock + real)
├── prisma/
│   └── schema.prisma     ← Modelo de datos
├── public/               ← Assets estáticos
├── .env.local            ← Variables locales (NO commitear)
├── .env.example          ← Template (commitear)
├── package.json
└── next.config.js
```

## Debugging

### Ver logs de API
```bash
# En otra terminal, mientras npm run dev esté corriendo:
# Los logs aparecen directamente en la terminal del dev server
```

### Ver base de datos
```bash
# Abrir Prisma Studio (UI interactiva)
npx prisma studio
# Abre en http://localhost:5555
```

### Consultar base de datos directamente
```bash
# Si usas PostgreSQL local:
psql mockmind_dev

# Comandos útiles:
\dt                           # Ver tablas
SELECT * FROM usuarios;       # Ver usuarios
SELECT * FROM sesiones;       # Ver sesiones
\q                            # Salir
```

### Reiniciar base de datos (if needed)
```bash
# Borrar y recrear (cuidado: pierde datos)
npx prisma migrate reset

# O borrar la tabla específica:
npx prisma db push --force-reset
```

## Troubleshooting

### Error: "DATABASE_URL not found"
- Verificar `.env.local` existe en `frontend-next/`
- Verificar que `DATABASE_URL="..."` esté definida
- Reiniciar terminal y dev server

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL no está corriendo
- Si usas Docker: `docker start mockmind-postgres`
- Si es local: iniciar el servicio PostgreSQL

### Error: "Cannot find module 'ai'"
- Ejecutar `npm install` de nuevo
- Limpiar node_modules: `rm -rf node_modules && npm install`

### API keys rechazadas
- Verificar que las keys sean válidas en sus consolas
- Asegurar que tengan saldo/crédito
- Revisar formato (no agregar comillas extra)

## Próximas etapas

Una vez que todo funcione local:

1. **Push a GitHub:** `git push origin main`
2. **Conectar Vercel:** seguir [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Testing en producción:** verificar que todo funcione igual

## Comandos útiles

```bash
# Desarrollo
npm run dev                   # Iniciar servidor dev

# Build
npm run build                 # Compilar para producción
npm start                     # Ejecutar build (usar después de npm run build)

# Prisma
npx prisma generate          # Generar cliente
npx prisma migrate dev        # Crear migración
npx prisma studio            # Abrir UI de base de datos

# Linting
npm run lint                  # Verificar código

# Limpieza
rm -rf .next node_modules    # Limpiar (si hay problemas)
npm install                   # Reinstalar todo
```

## Soporte

Si algo no funciona:

1. Revisar los logs en la terminal del dev server
2. Abrir la consola del navegador (F12) para ver errores
3. Revisar que las variables de `.env.local` sean correctas
4. Intentar limpiar y reinstalar: `rm -rf node_modules && npm install`

¡Happy coding!
