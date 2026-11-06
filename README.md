# Physics Lab

Proyecto de simulación interactiva de física 2D con módulos para tiro parabólico,
leyes de Newton, péndulo y caos, colisiones 2D, gravitación y órbitas,
electrostática y termodinámica.

## Estructura del proyecto

```text
.
├── index.html
├── styles.css
├── js/
│   ├── engine.js
│   ├── ui.js
│   └── simulations/
│       ├── collisions.js
│       ├── electrostatics.js
│       ├── newton.js
│       ├── orbits.js
│       ├── pendulum.js
│       ├── projectile.js
│       └── thermodynamics.js
├── LICENSE
└── README.md
```

## Cómo ejecutarlo

1. Abre la carpeta del proyecto en tu navegador.
2. Carga `index.html` directamente en el navegador o usa un servidor local simple.
3. Si prefieres un servidor local:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Cómo ampliar el proyecto

Cada simulación vive en su propio archivo dentro de `js/simulations/`.
Para añadir una nueva, sigue este patrón:

1. Crea una nueva clase con los métodos `reset()`, `update(dt)` y `draw(engine)`.
2. Añade el script en `index.html` antes de `js/ui.js`.
3. Registra la simulación en `UIController` dentro de `js/ui.js`.
4. Añade su configuración visual y sus textos de ayuda.

## Mejora incluida en esta revisión

- Se normalizó la estructura de carpetas para que coincida con la referencia del `index.html`.
- Se añadió la simulación faltante de colisiones 2D.
- Se documentó la estructura del proyecto y la forma de ejecutarlo.
- Se dejó la base lista para seguir ampliando módulos con una organización consistente.
