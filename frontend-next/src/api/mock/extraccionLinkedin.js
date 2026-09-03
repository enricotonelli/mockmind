// Lee el PDF que exporta LinkedIn del propio perfil usando pdf.js (corre
// entero en el navegador, sin backend) y delega la interpretación del texto
// en analizarLineasLinkedin.js.

import * as pdfjsLib from 'pdfjs-dist';
import { analizarLineasLinkedin } from './analizarLineasLinkedin';

// Next.js no tiene el import "?url" de Vite: el worker se copia a /public
// en cada install (ver scripts/copiar-worker-pdf.js) y se referencia acá
// como una ruta estática común. Este archivo solo se carga vía import()
// dinámico desde el navegador (ver mock/cv.js), nunca durante el render de
// servidor, así que es seguro tocar pdfjsLib acá.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// pdf.js entrega los fragmentos de texto en el orden del content stream del
// PDF. En las exportaciones de LinkedIn eso coincide con el orden de lectura
// por columna (toda la barra lateral primero, después la columna principal),
// así que no se reordena por posición: alteraría ese orden ya correcto.
// Solo se agrupan los fragmentos en líneas (misma coordenada Y) y se marca
// con una línea vacía un salto de párrafo (hueco vertical más grande de lo
// normal), para poder separar después bloques de texto sin depender de nada
// más que la propia geometría del PDF.
async function extraerLineas(archivo) {
  const datos = new Uint8Array(await archivo.arrayBuffer());
  const documento = await pdfjsLib.getDocument({ data: datos }).promise;

  const lineas = [];

  for (let numPagina = 1; numPagina <= documento.numPages; numPagina++) {
    const pagina = await documento.getPage(numPagina);
    const contenido = await pagina.getTextContent();

    let lineaActual = '';
    let yAnterior = null;
    let alturaAnterior = null;

    for (const item of contenido.items) {
      if (!item.str) continue;
      const y = item.transform[5];
      const altura = item.height || 10;

      if (yAnterior === null) {
        lineaActual = item.str;
      } else if (Math.abs(y - yAnterior) < altura * 0.5) {
        lineaActual += item.str;
      } else {
        lineas.push(lineaActual);
        if (alturaAnterior && Math.abs(y - yAnterior) > alturaAnterior * 1.8) {
          lineas.push('');
        }
        lineaActual = item.str;
      }
      yAnterior = y;
      alturaAnterior = altura;
    }
    if (lineaActual) lineas.push(lineaActual);
  }

  return lineas
    .map((l) => l.trim())
    .filter((l, i, arr) => l !== '' || arr[i - 1] !== '');
}

// Devuelve los campos del CV reconocidos con confianza, o null si el PDF no
// tiene texto extraíble (por ejemplo, si es un escaneo de imagen).
export async function extraerCvDePdf(archivo) {
  const lineas = await extraerLineas(archivo);
  if (lineas.length === 0) return null;
  return analizarLineasLinkedin(lineas);
}
