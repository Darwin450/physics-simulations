# Laboratorio de Física Interactivo

Simulador 2D con 7 módulos: tiro parabólico, leyes de Newton, péndulo y caos,
colisiones 2D, gravitación y órbitas, electrostática, y termodinámica
(incluye sistemas abiertos, cerrados y aislados).

## Publicarlo en GitHub Pages

1. Crea un repositorio nuevo y público en GitHub (por ejemplo `laboratorio-fisica`).
2. Sube **todo el contenido de esta carpeta** manteniendo la estructura:
   ```
   index.html
   styles.css
   js/engine.js
   js/ui.js
   js/simulations/*.js
   ```
   (arrástralos todos juntos con "Add file" → "Upload files", conservando las
   subcarpetas `js/` y `js/simulations/`).
3. Ve a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`, guarda.
4. En un minuto tendrás tu enlace público: `tu-usuario.github.io/laboratorio-fisica`.

Como `index.html` ya está en la raíz, no hace falta renombrar nada esta vez.

## Cómo seguir ampliándolo

Cada simulación vive en su propio archivo dentro de `js/simulations/`. Para
agregar un módulo nuevo (ej. Ondas):

1. Crea `js/simulations/waves.js` con una clase `WavesSimulation` que tenga
   `reset()`, `update(dt)` y `draw(engine)` (copia la forma de `pendulum.js` como plantilla).
2. Agrega `<script src="js/simulations/waves.js"></script>` en `index.html`.
3. En `js/ui.js`, agrega `waves: new WavesSimulation()` al objeto `simulations`,
   y un bloque `else if (simKey === 'waves') {...}` en `renderControls` y `updateInfoCard`.
4. Cambia el botón bloqueado de "Ondas" en el sidebar de `index.html` de
   `class="sim-tab-btn locked" disabled` a `class="sim-tab-btn" data-sim="waves"`.

## Cambios de esta revisión

- Arreglado: el canvas se distorsionaba progresivamente cada vez que se
  redimensionaba la ventana (el `scale` de alta resolución se acumulaba en
  vez de resetearse).
- Arreglado: la etiqueta "Vectores" mostraba código LaTeX sin renderizar.
- Agregado: sección "Próximamente" en el menú lateral para los módulos futuros.
