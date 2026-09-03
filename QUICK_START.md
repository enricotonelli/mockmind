# Quick Start — MockMind GRATIS ✅

**Tiempo total:** ~15 minutos para tener MockMind funcional en tu máquina, COMPLETAMENTE GRATIS.

---

## 1. Obtener credenciales gratis (5 min)

### A. Google Gemini API Key (GRATIS - free tier)

1. Ve a https://aistudio.google.com/apikey
2. Haz click en "Create API Key"
3. Copia el valor (empieza con `AIz`)
4. **LISTO** ✅

### B. PostgreSQL (local o Supabase free)

**Opción 1: Local (si tienes PostgreSQL)**
```bash
createdb mockmind_dev
```

**Opción 2: Supabase (más fácil, gratis)**
1. Ve a https://supabase.com
2. Crea proyecto (con GitHub login es más rápido)
3. Espera 2-3 min a que se inicialize
4. Settings → Database → URI
5. Copia el valor

---

## 2. Configurar .env.local (2 min)

En `frontend-next/.env.local`:

```env
# Frontend
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Base de datos
DATABASE_URL="postgresql://postgres:password@localhost:5432/mockmind_dev"
# O si usas Supabase: DATABASE_URL="postgresql://[user]:[pass]@[host]/[db]"

# JWT (copiar tal cual, o generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="tu-clave-super-secreta-cambiar-en-produccion"

# Google Gemini (FREE TIER: 15 requests/min)
GOOGLE_GENERATIVE_AI_API_KEY="AIz..."

# Modelo
GOOGLE_GENERATIVE_AI_MODEL="gemini-1.5-flash"
```

---

## 3. Crear tablas en la BD (2 min)

```bash
cd frontend-next
npx prisma migrate dev --name initial
```

Responde que sí cuando pregunte si quieres crear la migración.

---

## 4. Iniciar servidor (1 min)

```bash
npm run dev
```

Abre http://localhost:3000 en el navegador.

---

## 5. Probar (5 min)

### a. Registro
1. Haz click en "Iniciar sesión" (en la esquina)
2. Haz click en "Crear cuenta"
3. Email: `test@example.com`
4. Contraseña: `Test1234`
5. Nombre: `Test`
6. Click en "Creá tu cuenta"

### b. Nueva entrevista
1. Click en "+ Nueva entrevista"
2. Copia cualquiera de los ejemplos (o escribe uno)
3. Click en "Continuar"
4. Elige tipo de entrevista (ej: Recursos Humanos)
5. Click en "Empezar entrevista"

### c. Chat con entrevistador
1. Verás la primera pregunta (generada por Gemini)
2. Escribe una respuesta en el textarea
3. Press Enter o click en enviar
4. Entrevistador responde (o repregunta)
5. Continúa hasta finalizar

### d. Reporte
- Al terminar: verás el reporte con puntajes y feedback

---

## ✅ Checklist

- [ ] Google Gemini API key obtenida
- [ ] `.env.local` configurado
- [ ] PostgreSQL corriendo (local o Supabase)
- [ ] `npm install` ejecutado
- [ ] `npx prisma migrate dev` ejecutado
- [ ] `npm run dev` corriendo
- [ ] http://localhost:3000 abierto en navegador
- [ ] Registro y login funcionando
- [ ] Nueva entrevista creada
- [ ] Chat con entrevistador funcionando

---

## 🐛 Si algo falla

### "Database connection error"
```bash
# Verificar DATABASE_URL en .env.local
# Si es local:
psql -U postgres -d mockmind_dev -c "SELECT 1"

# Si es Supabase:
# Ir a https://supabase.com → Settings → Database → Connection Status
```

### "GOOGLE_GENERATIVE_AI_API_KEY not found"
```bash
# Verificar que esté en .env.local
# Reiniciar servidor: Ctrl+C, luego npm run dev
```

### "Too many requests (429)"
```bash
# Google Gemini free tier: 15 requests/min
# Esperar 1-2 minutos entre entrevistas
# En noviembre: cambiar a paga si necesitas más
```

### "Web Speech API not working"
```bash
# Necesitas navegador moderno: Chrome, Firefox, Safari, Edge
# No funciona en IE
# Asegúrate de permitir micrófono en el navegador
```

---

## 💰 Costo total

| Servicio | Precio |
|----------|--------|
| Google Gemini free tier | $0 |
| Web Speech API | $0 |
| PostgreSQL local | $0 |
| Supabase free tier | $0 |
| **Total** | **$0** ✅ |

**Limitaciones:**
- Google Gemini: 15 requests/min (~1-2 sesiones/día)
- En noviembre: cambiar a pago si necesitas más

---

## 📖 Próximos pasos

1. **Explorar:** mira las entrevistas guardadas en Historial
2. **Jugar:** crea más sesiones de diferentes tipos (Técnica, Estrés)
3. **Entender el código:** lee [`AI_SDK_GUIDE.md`](./AI_SDK_GUIDE.md)
4. **Deployar:** sigue [`DEPLOYMENT.md`](./DEPLOYMENT.md) para ir a Vercel

---

## 🔗 Referencias rápidas

- [Google Gemini API](https://aistudio.google.com/apikey)
- [Supabase](https://supabase.com) (si quieres BD en la nube)
- [Web Speech API docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Prisma docs](https://www.prisma.io/docs)

---

**¿Listo? ¡Abre `frontend-next/.env.local` y empieza! 🚀**
