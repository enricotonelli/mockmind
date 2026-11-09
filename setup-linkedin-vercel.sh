#!/bin/bash

# Script para completar la integración de LinkedIn en Vercel
# Ejecutar desde la raíz del proyecto

echo "🔗 Setup LinkedIn OAuth - Vercel"
echo "=================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json no encontrado${NC}"
    echo "Ejecuta este script desde la raíz del proyecto (frontend-next)"
    exit 1
fi

echo -e "${GREEN}✓ Proyecto encontrado${NC}"
echo ""

# Paso 1: Verificar que las variables de entorno están en .env.linkedin
echo -e "${YELLOW}Paso 1: Verificar archivo .env.linkedin${NC}"
if [ ! -f ".env.linkedin" ]; then
    echo -e "${RED}⚠️  .env.linkedin no encontrado${NC}"
else
    echo -e "${GREEN}✓ .env.linkedin encontrado${NC}"
    echo "  Contenido:"
    cat .env.linkedin | sed 's/^/    /'
fi
echo ""

# Paso 2: Verificar que la migración existe
echo -e "${YELLOW}Paso 2: Verificar migración de Prisma${NC}"
if [ -f "prisma/migrations/add_linkedin_oauth/migration.sql" ]; then
    echo -e "${GREEN}✓ Migración encontrada${NC}"
    echo "  Contenido:"
    cat prisma/migrations/add_linkedin_oauth/migration.sql | sed 's/^/    /'
else
    echo -e "${RED}❌ Migración no encontrada${NC}"
fi
echo ""

# Paso 3: Verificar schema.prisma
echo -e "${YELLOW}Paso 3: Verificar schema.prisma actualizado${NC}"
if grep -q "linkedinId" prisma/schema.prisma; then
    echo -e "${GREEN}✓ Schema.prisma tiene campos LinkedIn${NC}"
else
    echo -e "${RED}❌ Schema.prisma no tiene campos LinkedIn${NC}"
fi
echo ""

# Paso 4: Verificar archivos del componente
echo -e "${YELLOW}Paso 4: Verificar archivos de componentes${NC}"
if [ -f "src/components/ConectarLinkedIn.jsx" ] && \
   [ -f "src/lib/linkedinConfig.js" ] && \
   [ -f "src/app/api/auth/linkedin/route.js" ] && \
   [ -f "src/app/api/auth/linkedin/callback/route.js" ]; then
    echo -e "${GREEN}✓ Todos los archivos de LinkedIn existen${NC}"
else
    echo -e "${RED}❌ Algunos archivos faltan${NC}"
fi
echo ""

# Resumen final
echo "=================================="
echo -e "${GREEN}✅ Setup completado${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Sube los cambios a GitHub:"
echo "   git add ."
echo "   git commit -m 'Agrega integración OAuth con LinkedIn'"
echo "   git push origin main"
echo ""
echo "2. Configura variables en Vercel:"
echo "   https://vercel.com/projects/mockmind"
echo "   Settings → Environment Variables"
echo "   Agrega:"
echo "     LINKEDIN_CLIENT_ID=77gz1f8clxm7nq"
echo "     LINKEDIN_CLIENT_SECRET=[Tu client secret de LinkedIn]"
echo "     LINKEDIN_CALLBACK_URL=https://mockmind-nine.vercel.app/api/auth/linkedin/callback"
echo ""
echo "3. Configura redirect URIs en LinkedIn Developer:"
echo "   https://linkedin.com/developers/apps/mockmind"
echo "   Auth → Authorized redirect URLs"
echo "   Agrega: https://mockmind-nine.vercel.app/api/auth/linkedin/callback"
echo ""
echo -e "${YELLOW}⏱️  LinkedIn tardará 24-48 horas en aprobar el acceso a perfil${NC}"
echo ""
