import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  try {
    const sesiones = await prisma.sesion.findMany({
      where: {
        usuario: {
          email: {
            contains: '@calibracion.test'
          }
        }
      },
      include: {
        usuario: true,
        reporteEntrevista: true
      },
      orderBy: {
        fecha: 'asc'
      }
    });

    console.log(`\n✓ ${sesiones.length} sesiones encontradas\n`);

    const datos = sesiones.map((s, idx) => ({
      numero: idx + 1,
      usuario: s.usuario.email,
      tipo: s.tipoEntrevista,
      puntaje_general: s.puntajeGeneral,
      claridad: s.reporteEntrevista?.puntajeClaridad || null,
      star: s.reporteEntrevista?.puntajeStar || null,
      ejemplos: s.reporteEntrevista?.puntajeEjemplos || null,
      coherencia: s.reporteEntrevista?.puntajeCoherencia || null,
      repreguntas: s.reporteEntrevista?.cantidadRepreguntas || null,
      fecha: s.fecha.toISOString().split('T')[0]
    }));

    console.log('Sesiones de Calibración:');
    console.log('========================\n');
    datos.forEach(d => {
      const stats = d.claridad ? `C:${d.claridad} S:${d.star} E:${d.ejemplos} Co:${d.coherencia}` : 'Generando...';
      console.log(`${d.numero}. ${d.usuario.padEnd(30)} ${d.tipo.padEnd(8)} General:${d.puntaje_general || 'N/A'} ${stats}`);
    });

    // Crear resumen
    const clariReales = datos.filter(d => d.claridad !== null).map(d => d.claridad);
    const promClari = clariReales.length > 0 ? (clariReales.reduce((a, b) => a + b) / clariReales.length).toFixed(1) : 'N/A';

    console.log(`\n✓ Promedio de Claridad: ${promClari}`);
    console.log(`✓ Sesiones con reporte: ${datos.filter(d => d.claridad !== null).length} de ${datos.length}`);

    fs.writeFileSync('../DATOS_CALIBRACION.json', JSON.stringify(datos, null, 2));
    console.log('✓ Datos exportados a DATOS_CALIBRACION.json\n');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
