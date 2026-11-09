# TABLA 7.4 - Puntajes de Sesiones por Usuario

## Instrucciones

Ingresa los puntajes (0-100) para cada sesión de U1, U2 y U3. Cada usuario tiene 3 sesiones completadas.

Los puntajes provienen del reporte generado al finalizar cada entrevista:
- **Claridad:** Qué tan comprensible fue la respuesta
- **STAR:** Si estructura Situación, Tarea, Acción, Resultado
- **Ejemplos:** Si usa ejemplos específicos y concretos
- **Coherencia:** Si la respuesta tiene lógica interna
- **General:** Puntaje general del reporte
- **Repreguntas:** Cantidad de veces que el entrevistador repreuntó

---

## TABLA 7.4: Puntajes por Usuario y Sesión

| Usuario | Sesión | Claridad | STAR | Ejemplos | Coherencia | General | Repreguntas |
|---------|--------|----------|------|----------|------------|---------|-------------|
| U1      | 1      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U1      | 2      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U1      | 3      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U2      | 1      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U2      | 2      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U2      | 3      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U3      | 1      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U3      | 2      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |
| U3      | 3      | [C]      | [C]  | [C]      | [C]        | [C]     | [C]         |

---

## Cálculos Posteriores

Una vez completes la tabla, se calcularán:

### Media por Usuario y Dimensión
```
Media U1 Claridad = (Sesión 1 + Sesión 2 + Sesión 3) / 3
...
```

### Evolución (Sesión 1 → Sesión 3)
```
Evolución U1 General = Sesión 3 - Sesión 1
```

### Estadísticas Globales
```
Media General (todos los usuarios) = promedio de todas las celdas "General"
Desviación estándar = √[ Σ(x - media)² / n ]
```

### Correlación
```
Correlación entre "Repreguntas" y "General"
(Para ver si más repreguntas → mejores puntajes)
```

---

## Dónde Obtener los Datos

### Opción 1: Manual (Recomendado si tienes acceso)
- Abrir la BD Supabase
- Para cada usuario:
  - Ir a tabla `sesiones`
  - Filtrar por usuario
  - Abrir cada sesión
  - Ir a tabla `reporteEntrevista`
  - Copiar puntajes: claridad, star, ejemplos, coherencia, general
  - Copiar cantidadRepreguntas

### Opción 2: Desde la Aplicación (Si la BD no es accesible)
- Login como U1 en MockMind
- Ir a "Historial"
- Clickear en cada sesión
- Ver el reporte
- Anotar manualmente los puntajes

### Opción 3: Exportar de un CSV si lo tienes guardado
- Si ya tienes un export de reporteEntrevista, pegarlo aquí

---

## Ejemplo Completado (Referencia)

| Usuario | Sesión | Claridad | STAR | Ejemplos | Coherencia | General | Repreguntas |
|---------|--------|----------|------|----------|------------|---------|-------------|
| U1      | 1      | 45       | 30   | 20       | 50         | 36      | 3           |
| U1      | 2      | 65       | 55   | 60       | 70         | 62      | 2           |
| U1      | 3      | 85       | 90   | 95       | 90         | 90      | 1           |

**Análisis:** U1 muestra evolución clara: de 36 a 90 puntos en General.

---

## Próximos Pasos

1. **Completa la tabla** con los datos reales de U1, U2, U3
2. **Exporta como CSV** o captura la tabla
3. **Calcula estadísticas:**
   - Media por usuario
   - Evolución (sesión 1 → sesión 3)
   - Desviación estándar
   - Correlación repreguntas vs puntaje general
4. **Inserta en la tesis** en sección 7.6.2

---

**Marcadores cerrados con esta tabla:**
- [C] Tabla 7.4 - Puntajes por sesión
- [C] Evolución de desempeño (7.6.2)
- [C] Análisis cuantitativo (Cap. 8)

---

**Última actualización:** 20 Octubre 2026
