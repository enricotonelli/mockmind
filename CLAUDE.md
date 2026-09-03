# MockMind — Entrenador de entrevistas laborales con IA

> Contexto persistente para Claude Code. Leer completo antes de cada tarea.

---

## 1. Identidad del proyecto

- **Nombre:** MockMind — Entrenador de entrevistas laborales con IA
- **Alumno:** Enrico Tonelli
- **Universidad:** Universidad del Salvador (USAL) — Facultad de Ingeniería
- **Carrera:** Ingeniería en Informática
- **Materia:** Proyecto Final de Ingeniería en Informática 2026
- **Profesor:** Ing. Esteban Tissera MBA
- **Área:** Laboral / Social / Inteligencia Artificial Aplicada
- **Modalidad:** Desarrollo individual
- **Entrega final:** Octubre/Noviembre 2026

---

## 2. De qué trata el proyecto

MockMind es una plataforma web que permite a cualquier persona simular
entrevistas laborales reales de forma autónoma, con un entrevistador virtual
conversacional impulsado por IA (Claude Haiku API). Soporta respuestas por texto
o voz: el usuario puede escribir, grabar audio (que se transcribe automáticamente),
o escuchar las preguntas en audio generado por TTS.

**El problema que resuelve:** la mayoría de la gente llega a sus entrevistas sin
haber practicado nunca en un entorno real. Leen guías, miran videos, pero nunca
tienen la experiencia de que alguien les repregunte, los interrumpa o les pida
que desarrollen una respuesta. Esa falta de práctica genera nerviosismo,
respuestas vagas y oportunidades perdidas, no por falta de capacidad sino de
entrenamiento. Las alternativas actuales (coaches, simuladores online básicos)
son caras, tienen horarios o usan preguntas fijas que no se adaptan al puesto.

**Cómo funciona la solución:** el usuario carga la descripción del puesto al que
quiere aplicar y elige el tipo de entrevista. La IA toma el rol de entrevistador
y genera preguntas específicas para ese puesto. Analiza cada respuesta en tiempo
real: si es vaga, repregunta; si el usuario menciona un proyecto, profundiza. Al
terminar, genera un reporte de feedback estructurado con puntajes por dimensión
y sugerencias concretas de mejora. La plataforma guarda el historial de sesiones
para que el usuario vea su evolución.

**Diferencial:** no es un chatbot que hace preguntas de una lista. Tiene lógica
propia de entrevistador: repregunta, profundiza, detecta vaguedad y evalúa la
coherencia del discurso.

**Público objetivo:** estudiantes buscando su primer empleo, profesionales que
quieren cambiar de trabajo, cualquiera que quiera llegar mejor preparado a una
entrevista.

**Hipótesis del proyecto:** la práctica repetida en un entorno que simula
condiciones reales, con feedback inmediato, genera una mejora progresiva medible
en la calidad de las respuestas a lo largo de las sesiones.

---

## 3. Alcance

### MVP — Módulo 1: Motor de entrevistas (COMPLETO)

- ✅ Registro e inicio de sesión con autenticación segura (JWT + bcrypt)
- ✅ Perfil de usuario
- ✅ Configuración de sesión: carga de descripción del puesto + selección del tipo
  de entrevista (RRHH / Técnica / Estrés)
- ✅ Motor de entrevista por chat con integración a Claude Haiku API
- ✅ Modo de voz: grabación de respuestas (STT con Whisper), generación de audio
  para preguntas (TTS con OpenAI), transcripción automática
- ✅ Análisis de respuestas por turno: detección de vaguedad, ausencia de ejemplos
  concretos, evaluación del método STAR
- ✅ Generación de reporte de feedback estructurado con puntajes por dimensión y
  sugerencias de mejora
- ✅ Historial de sesiones con visualización de evolución del desempeño
- Frontend migrado a Next.js 15 + React 19 + Tailwind v4 (App Router)

### Segunda fase (NO arrancar hasta tener el Módulo 1 funcionando)

- **Módulo 2 — Analizador de CV:** el usuario sube su CV (PDF/Word), la IA lo
  analiza en 4 dimensiones (compatibilidad ATS, completitud, calidad de
  contenido, veredicto final) y devuelve un reporte con score y sugerencias.
- **Módulo 3 — Creador de CV conversacional:** la IA guía al usuario con
  preguntas de a una y genera dos versiones del CV (una optimizada para ATS en
  texto plano, otra visual para humanos).

### Explícitamente FUERA de alcance (trabajo futuro, no implementar)

- Detección de contradicciones entre turnos distantes (el análisis es por turno)
- Entrenamiento o desarrollo de modelos de lenguaje propios
- Conexión con ofertas laborales reales o reclutadores
- Análisis de lenguaje corporal o tono de voz (solo transcripción de audio)

Estas exclusiones son decisiones deliberadas para garantizar que lo que se
entrega funcione bien dentro del tiempo disponible. Cualquier desvío del alcance
se trata como trabajo futuro, no como ajuste al plan.

### Tipos de entrevista

- **RRHH:** competencias blandas, trayectoria profesional, motivaciones
- **Técnica:** conocimientos específicos del área del puesto
- **Estrés:** comportamiento del candidato bajo presión

---

## 4. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind CSS v4 + Axios |
| Backend | Node.js + Express + Vercel AI SDK |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT + bcrypt |
| IA motor de entrevistas | Claude Haiku 4.5 (Anthropic) — optimizado por costo |
| STT (voz a texto) | Whisper (OpenAI) |
| TTS (texto a voz) | OpenAI Text-to-Speech |
| Generación de objetos | Vercel AI SDK + Zod |
| Deploy frontend | Vercel (Next.js nativo) |
| Deploy backend | Railway o Render |
| DB en la nube | Supabase |
| Versionado | Git + GitHub |
| IDE | Visual Studio Code |

---

## 5. Arquitectura

- **Monorepo** con dos carpetas en la raíz: `/backend` y `/frontend`.
- Comunicación **API REST** cliente-servidor.
- **REGLA DE SEGURIDAD CRÍTICA:** la API key de Anthropic vive SOLO en el
  backend. El frontend nunca la ve ni la usa. Todas las llamadas a Claude pasan
  por endpoints del backend.
- Toda variable sensible (API keys, JWT secret, connection string de la DB) va
  en `.env` del backend. `.env` está en `.gitignore` desde el primer commit.
- Se versiona un `.env.example` con las claves pero sin valores reales.

### Estructura de carpetas objetivo

```
mockmind/
├── CLAUDE.md
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.js            # entrypoint Express
│       ├── config/             # config, cliente Prisma, cliente Anthropic
│       ├── routes/             # definición de rutas REST
│       ├── controllers/        # lógica de cada endpoint
│       ├── services/           # lógica de negocio + integración con Claude
│       ├── middleware/         # auth JWT, manejo de errores
│       └── prompts/            # prompts del entrevistador y del análisis
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                # cliente Axios, llamadas al backend
        ├── pages/             # login, registro, dashboard, entrevista, historial
        ├── components/        # componentes reutilizables
        └── context/           # estado de auth
```

---

## 6. Modelo de datos (Prisma / PostgreSQL)

Tablas principales del Módulo 1:

- **usuarios:** id, nombre, email (único), password (hasheada con bcrypt),
  fecha_registro
- **sesiones:** id, id_usuario (FK), puesto_aplicado, tipo_entrevista
  (enum: RRHH / Tecnica / Estres), fecha, duracion, puntaje_general
- **mensajes:** id, id_sesion (FK), rol (enum: usuario / entrevistador),
  contenido, timestamp
- **reportes_entrevista:** id, id_sesion (FK), puntaje_claridad, puntaje_star,
  puntaje_ejemplos, puntaje_coherencia, cantidad_repreguntas, feedback_texto,
  sugerencias

(Las tablas `cvs_analizados` y `cvs_creados` son de la segunda fase; no crearlas
todavía.)

---

## 7. Indicadores de evaluación (operacionalización)

El sistema calcula, por sesión, puntajes de 0 a 100 en cada dimensión:

| Indicador | Qué mide |
|---|---|
| Claridad expositiva | Qué tan comprensible y directa fue la respuesta |
| Uso del método STAR | Si estructuró: Situación, Tarea, Acción, Resultado |
| Concreción de ejemplos | Si respaldó afirmaciones con casos y datos reales |
| Coherencia del discurso | Si las respuestas fueron consistentes en la sesión |
| Cantidad de repreguntas | Indicador indirecto de respuestas vagas |
| Puntaje general | Promedio ponderado de las cuatro dimensiones |

---

## 8. Flujo del Módulo 1 (motor de entrevistas)

1. Usuario se registra / inicia sesión → backend genera JWT
2. Dashboard → usuario carga la descripción del puesto
3. Usuario selecciona el tipo de entrevista
4. Claude genera las preguntas iniciales según el puesto
5. El entrevistador envía la primera pregunta por chat
6. El usuario responde → se guarda el mensaje en PostgreSQL
7. Claude analiza la respuesta:
   - ¿Detectó vaguedad o falta de ejemplo? → genera repregunta específica
   - ¿No? → ¿hay más preguntas? → siguiente pregunta / cierre
8. Al cerrar: Claude genera el reporte, se calculan los puntajes por dimensión
9. Se guardan sesión y reporte en la DB
10. Se muestra el reporte al usuario

---

## 9. Orden de construcción (seguir esta secuencia)

Construir por criticidad, probando cada módulo de forma aislada antes de
integrarlo:

1. **Esqueleto del monorepo** + configuración de Prisma + schema de la DB
2. **Autenticación:** registro/login (JWT + bcrypt) + middleware + perfil
3. **Configuración de sesión:** carga de puesto + tipo de entrevista
4. **Motor de entrevista + integración con Claude API** (el componente más
   crítico; acá se itera fuerte el diseño de prompts)
5. **Análisis de respuestas por turno** (vaguedad, STAR, ejemplos)
6. **Generación del reporte de feedback** con puntajes y sugerencias
7. **Historial de sesiones** y visualización de evolución

Trabajar de forma incremental: entregar versiones que funcionen aunque sean
parciales, en lugar de construir todo en paralelo.

---

## 10. Convenciones de código

- Código, comentarios, nombres de variables y mensajes de commit **en español**.
- **Sin sobre-ingeniería.** Es un proyecto académico individual con tiempo
  acotado. Preferir lo simple y directo sobre lo elegante o abstracto.
- No agregar dependencias que no sean estrictamente necesarias.
- Manejo de errores explícito en las llamadas a la API de Claude (pueden fallar
  o tardar; nunca dejar que un error tire el servidor).
- Separar responsabilidades: rutas → controladores → servicios. La lógica de
  negocio y la integración con Claude van en `services/`, no en las rutas.
- Los prompts del entrevistador y del análisis viven en `backend/src/prompts/`,
  separados del código, para poder iterarlos sin tocar la lógica.
- Ningún módulo se integra al sistema principal sin haber sido probado por
  separado antes.

---

## 11. Gestión de calidad

- **Motor de entrevista:** antes de darlo por bueno, probarlo en escenarios
  distintos (usuario que responde bien, uno que responde con vaguedad, uno que
  no da ejemplos). Debe reaccionar con sentido: repreguntar cuando corresponde,
  avanzar cuando la respuesta está completa. Si repregunta de más o avanza con
  respuestas incompletas, ajustar los prompts.
- **Reporte de feedback:** lo que dice debe tener correspondencia real con lo que
  pasó en la sesión. Si hubo cinco repreguntas por vaguedad y el reporte no lo
  menciona, algo está mal en el prompt de análisis.
- **Control de versiones desde el primer commit** para poder revertir sin dramas.

---

## 12. Flujo de trabajo con Git y GitHub

- El repositorio se llama **mockmind** y se aloja en GitHub.
- Commits **atómicos y frecuentes**, con mensajes claros en español que
  describan el cambio (ej: "Agrega registro de usuarios con bcrypt").
- Hacer commit al completar cada unidad de trabajo funcional, no acumular
  muchos cambios en un solo commit gigante.
- `main` es la rama estable. Se puede trabajar directo en `main` dado que es un
  proyecto individual, pero cada commit debe dejar el proyecto en un estado que
  al menos levante sin romperse.
- Antes del primer push, verificar que `.gitignore` excluya `node_modules/`,
  `.env`, y archivos de build. **Nunca** commitear el `.env` ni ninguna API key
  o token.

### Autenticación de GitHub (importante)

La autenticación con GitHub se maneja **fuera de este archivo y fuera del
repositorio**. Se usa GitHub CLI (`gh auth login`) o una clave SSH / Personal
Access Token configurados en el entorno local. **Nunca** se escriben
credenciales, tokens ni contraseñas dentro del código, del `CLAUDE.md` ni de
ningún archivo versionado. Si una operación de git necesita autenticación y no
está configurada, avisar al usuario para que la resuelva él en su terminal, no
pedir ni almacenar credenciales.

---

## 13. Sobre las APIs de IA

### Anthropic (Claude Haiku para entrevistas)

- Se necesita una API key de Anthropic (distinta de la suscripción de Claude
  Code), obtenida en console.anthropic.com.
- Modelo: **Claude Haiku 4.5** (no Sonnet) — elegido para **minimizar costos** sin
  sacrificar calidad. Haiku es tan capaz como Sonnet para tareas estructuradas
  (generar reporte, decidir si repreguntar), pero 5-6x más barato.
- La key se guarda en `backend/.env` como variable de entorno, nunca en código.
- Costo: ~$0.80 entrada, ~$4 salida por millón de tokens.
- Presupuesto estimado para desarrollo y pruebas: $2-3 USD (vs $5-10 con Sonnet).

### OpenAI (STT + TTS para voz)

- Se necesita una API key de OpenAI (platform.openai.com), distinta de ChatGPT.
- Modelos: Whisper para transcripción (STT), TTS para generación de voz.
- Costos: ~$0.01 USD por minuto de audio (Whisper), ~$0.015 por 1000 caracteres
  (TTS). Muy económico comparado con soluciones especializadas.
- La key se guarda en `backend/.env` como variable de entorno, nunca en código.

### Vercel AI SDK

- Librería que abstrae proveedores (Anthropic, OpenAI, etc.) con interfaz única.
- Se usa `generateObject` + Zod para structured output en lugar de JSON schemas brutos.
- Simplifica cambios de proveedor: si Anthropic saca un modelo nuevo o se quiere
  cambiar de provider, solo se toca la config, no toda la lógica.
