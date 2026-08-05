// Cliente único de Prisma para todo el backend. Se instancia una sola vez
// acá y se importa donde haga falta, en vez de crear un PrismaClient por
// archivo (agotaría las conexiones a la base bajo carga).

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
