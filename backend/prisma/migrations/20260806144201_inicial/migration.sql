-- CreateEnum
CREATE TYPE "TipoEntrevista" AS ENUM ('RRHH', 'Tecnica', 'Estres');

-- CreateEnum
CREATE TYPE "RolMensaje" AS ENUM ('usuario', 'entrevistador');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "puesto_aplicado" TEXT NOT NULL,
    "tipo_entrevista" "TipoEntrevista" NOT NULL,
    "cantidad_preguntas" INTEGER NOT NULL DEFAULT 6,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracion" INTEGER,
    "puntaje_general" DOUBLE PRECISION,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "id_sesion" INTEGER NOT NULL,
    "rol" "RolMensaje" NOT NULL,
    "contenido" TEXT NOT NULL,
    "es_repregunta" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes_entrevista" (
    "id" SERIAL NOT NULL,
    "id_sesion" INTEGER NOT NULL,
    "puntaje_claridad" DOUBLE PRECISION NOT NULL,
    "puntaje_star" DOUBLE PRECISION NOT NULL,
    "puntaje_ejemplos" DOUBLE PRECISION NOT NULL,
    "puntaje_coherencia" DOUBLE PRECISION NOT NULL,
    "cantidad_repreguntas" INTEGER NOT NULL,
    "feedback_texto" TEXT NOT NULL,
    "sugerencias" TEXT NOT NULL,

    CONSTRAINT "reportes_entrevista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reportes_entrevista_id_sesion_key" ON "reportes_entrevista"("id_sesion");

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_sesion_fkey" FOREIGN KEY ("id_sesion") REFERENCES "sesiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_entrevista" ADD CONSTRAINT "reportes_entrevista_id_sesion_fkey" FOREIGN KEY ("id_sesion") REFERENCES "sesiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
