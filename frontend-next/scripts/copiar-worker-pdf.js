// Next.js no tiene el import "?url" de Vite que usábamos para el worker de
// pdf.js. Se copia el archivo a /public en cada install, y se referencia
// como una ruta estática común (ver src/api/mock/extraccionLinkedin.js).
const fs = require('fs');
const path = require('path');

const origen = path.join(
  __dirname,
  '..',
  'node_modules',
  'pdfjs-dist',
  'build',
  'pdf.worker.min.mjs'
);
const destino = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs');

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.copyFileSync(origen, destino);
console.log('pdf.worker.min.mjs copiado a public/');
