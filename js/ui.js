/**
 * Manejador de Interfaz de Usuario y Eventos (UI Controller)
 */
class UIController {
  constructor(engine) {
    this.engine = engine;
    
    // Instanciar simulaciones
    this.simulations = {
      projectile: new ProjectileSimulation(),
      newton: new NewtonSimulation(),
      pendulum: new PendulumSimulation(),
      collisions: new CollisionsSimulation(),
      orbits: new OrbitsSimulation(),
      electrostatics: new ElectrostaticsSimulation(),
      thermodynamics: new ThermodynamicsSimulation()
    };
    
    this.currentSimKey = 'projectile';
    this.initDOM();
    this.bindEvents();
    this.switchSimulation('projectile');
    
    // Iniciar bucle de actualización de métricas UI en tiempo real
    setInterval(() => this.updateTelemetry(), 80);
  }
  
  initDOM() {
    this.playBtn = document.getElementById('playBtn');
    this.stepBtn = document.getElementById('stepBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedVal = document.getElementById('speedVal');
    
    this.toggleVectors = document.getElementById('toggleVectors');
    this.toggleGrid = document.getElementById('toggleGrid');
    this.toggleTrail = document.getElementById('toggleTrail');
    
    this.controlsContainer = document.getElementById('dynamicControls');
    this.presetsContainer = document.getElementById('dynamicPresets');
    
    // Elementos del HUD y del Cuadro de Explicación Inferior
    this.hudSimName = document.getElementById('hudSimName');
    this.infoIcon = document.getElementById('infoIcon');
    this.infoTitle = document.getElementById('infoTitle');
    this.infoDesc = document.getElementById('infoDesc');
    this.infoFormula = document.getElementById('infoFormula');
    
    // Métricas UI y sus etiquetas
    this.metricTime = document.getElementById('metricTime');
    this.labelMetricSpeed = document.getElementById('labelMetricSpeed');
    this.metricSpeed = document.getElementById('metricSpeed');
    this.labelMetricHeight = document.getElementById('labelMetricHeight');
    this.metricHeight = document.getElementById('metricHeight');
    this.metricEnergy = document.getElementById('metricEnergy');
  }
  
  bindEvents() {
    // Pestañas de navegación vertical (al costado izquierdo)
    document.querySelectorAll('.sim-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const simKey = e.currentTarget.dataset.sim;
        document.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.switchSimulation(simKey);
      });
    });
    
    // Controles de reproducción
    this.playBtn.addEventListener('click', () => {
      this.engine.togglePlay();
      this.playBtn.innerHTML = this.engine.isRunning ? '⏸ PAUSAR' : '▶ REANUDAR';
      if (this.engine.isRunning) {
        this.playBtn.classList.add('btn-primary');
      } else {
        this.playBtn.classList.remove('btn-primary');
      }
    });
    
    this.stepBtn.addEventListener('click', () => {
      this.engine.step(0.016);
      this.engine.render();
    });
    
    this.resetBtn.addEventListener('click', () => {
      this.engine.resetTime();
    });
    
    this.speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.timeScale = val;
      this.speedVal.textContent = `${val.toFixed(1)}x`;
    });
    
    // Toggles de visualización
    this.toggleVectors.addEventListener('change', (e) => this.engine.showVectors = e.target.checked);
    this.toggleGrid.addEventListener('change', (e) => this.engine.showGrid = e.target.checked);
    this.toggleTrail.addEventListener('change', (e) => this.engine.showTrail = e.target.checked);
  }
  
  switchSimulation(simKey) {
    this.currentSimKey = simKey;
    const sim = this.simulations[simKey];
    
    // Asignar simulación al motor y reiniciar la historia de telemetría
    this.engine.setSimulation(sim);
    
    // Actualizar nombre en el HUD superior en vivo
    if (this.hudSimName) {
      this.hudSimName.textContent = sim.name;
    }
    
    this.renderControls(simKey);
    this.updateInfoCard(simKey);
  }
  
  renderControls(simKey) {
    const sim = this.simulations[simKey];
    this.controlsContainer.innerHTML = '';
    this.presetsContainer.innerHTML = '';
    
    if (simKey === 'projectile') {
      this.addSlider('Velocidad Inicial (v₀)', 5, 80, sim.v0, 'm/s', (v) => { sim.v0 = v; sim.reset(); });
      this.addSlider('Ángulo de Lanzamiento (θ)', 0, 90, sim.angle, '°', (v) => { sim.angle = v; sim.reset(); });
      this.addSlider('Altura Inicial (h₀)', 0, 30, sim.h0, 'm', (v) => { sim.h0 = v; sim.reset(); });
      this.addSlider('Gravedad (g)', 1.6, 25, sim.gravity, 'm/s²', (v) => sim.gravity = v);
      this.addSlider('Resistencia del Aire', 0, 0.3, sim.drag, '', (v) => sim.drag = v);
      
      this.addPreset('🌍 Tierra', () => { sim.gravity = 9.81; sim.drag = 0.05; sim.reset(); this.renderControls(simKey); });
      this.addPreset('🌙 Luna', () => { sim.gravity = 1.62; sim.drag = 0; sim.reset(); this.renderControls(simKey); });
      this.addPreset('🔴 Marte', () => { sim.gravity = 3.71; sim.drag = 0.01; sim.reset(); this.renderControls(simKey); });
      this.addPreset('⚡ Júpiter', () => { sim.gravity = 24.79; sim.drag = 0.1; sim.reset(); this.renderControls(simKey); });
    } else if (simKey === 'newton') {
      if (sim.mode === 'incline') {
        this.addSlider('Masa del Bloque (m)', 1, 30, sim.mass, 'kg', (v) => { sim.mass = v; sim.reset(); });
        this.addSlider('Ángulo de Inclinación (θ)', 0, 60, sim.angle, '°', (v) => { sim.angle = v; sim.reset(); });
        this.addSlider('Fricción (μk)', 0, 0.8, sim.mu, '', (v) => sim.mu = v);
        this.addSlider('Gravedad (g)', 1.6, 25, sim.gravity, 'm/s²', (v) => sim.gravity = v);
      } else if (sim.mode === 'atwood') {
        this.addSlider('Masa 1 (m₁)', 1, 20, sim.m1, 'kg', (v) => { sim.m1 = v; sim.reset(); });
        this.addSlider('Masa 2 (m₂)', 1, 20, sim.m2, 'kg', (v) => { sim.m2 = v; sim.reset(); });
      }
      
      this.addPreset('📐 Plano Inclinado', () => { sim.mode = 'incline'; sim.reset(); this.renderControls(simKey); });
      this.addPreset('⚙️ Máquina de Atwood', () => { sim.mode = 'atwood'; sim.reset(); this.renderControls(simKey); });
      this.addPreset('🧊 Plano Sin Fricción', () => { sim.mode = 'incline'; sim.mu = 0; sim.reset(); this.renderControls(simKey); });
    } else if (simKey === 'pendulum') {
      this.addSlider('Longitud L₁', 1, 6, sim.l1, 'm', (v) => { sim.l1 = v; sim.reset(); });
      this.addSlider('Longitud L₂', 1, 6, sim.l2, 'm', (v) => { sim.l2 = v; sim.reset(); });
      this.addSlider('Fricción / Amortiguamiento', 0, 0.02, sim.damping, '', (v) => sim.damping = v);
      
      this.addPreset('🌀 Péndulo Doble (Caos)', () => { sim.mode = 'double'; sim.reset(); });
      this.addPreset('📐 Péndulo Simple', () => { sim.mode = 'simple'; sim.reset(); });
    } else if (simKey === 'collisions') {
      this.addSlider('Coeficiente Restitución (e)', 0, 1, sim.restitution, '', (v) => sim.restitution = v);
      
      this.addPreset('💎 Totalmente Elástica', () => { sim.restitution = 1.0; sim.reset(); });
      this.addPreset('🛑 Inelástica (e=0.3)', () => { sim.restitution = 0.3; sim.reset(); });
    } else if (simKey === 'orbits') {
      this.addSlider('Masa Solar', 200, 3000, sim.star.m, 'kg', (v) => sim.star.m = v);
      this.addPreset('🪐 Sistema Solar', () => sim.reset());
    } else if (simKey === 'electrostatics') {
      this.addSlider('Constante Coulomb (k)', 20, 300, sim.k, '', (v) => sim.k = v);
      this.addPreset('⚡ Dipolo Eléctrico', () => sim.reset());
    } else if (simKey === 'thermodynamics') {
      this.addSlider('Temperatura (T)', -100, 500, sim.T, '°C', (v) => sim.T = v);
      
      if (sim.mode === 'rod') {
        this.addSlider('Longitud Inicial (L₀)', 2, 20, sim.L0, 'm', (v) => sim.L0 = v);
      }
      
      this.addPreset('🔓 Sistema Abierto', () => { sim.mode = 'open_system'; sim.reset(); this.updateInfoCard(simKey); });
      this.addPreset('🔒 Sistema Cerrado', () => { sim.mode = 'closed_system'; sim.reset(); this.updateInfoCard(simKey); });
      this.addPreset('🛡️ Sistema Aislado', () => { sim.mode = 'isolated_system'; sim.reset(); this.updateInfoCard(simKey); });
      this.addPreset('🟠 Dilatación Cobre', () => { sim.mode = 'rod'; sim.material = 'copper'; sim.reset(); this.renderControls(simKey); });
      this.addPreset('🌗 Lámina Bimetálica', () => { sim.mode = 'bimetallic'; sim.reset(); this.renderControls(simKey); });
      this.addPreset('💨 Pistón Gas Ideal', () => { sim.mode = 'gas'; sim.reset(); this.renderControls(simKey); });
    }
  }
  
  addSlider(label, min, max, val, unit, onChange) {
    const div = document.createElement('div');
    div.className = 'control-group';

    const id = `slider_${Math.random().toString(36).slice(2, 7)}`;
    const labelRow = document.createElement('div');
    labelRow.className = 'label-row';

    const labelText = document.createElement('label');
    labelText.htmlFor = id;
    labelText.textContent = label;

    const badge = document.createElement('output');
    badge.className = 'val-badge';
    badge.htmlFor = id;
    badge.textContent = `${Number(val).toFixed(1)} ${unit}`;

    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = String(min);
    input.max = String(max);
    input.step = String((max - min) / 100);
    input.value = String(val);
    input.setAttribute('aria-label', label);

    labelRow.append(labelText, badge);
    div.append(labelRow, input);
    this.controlsContainer.appendChild(div);

    input.addEventListener('input', () => {
      const v = Number(input.value);
      badge.textContent = `${v.toFixed(1)} ${unit}`;
      onChange(v);
      this.engine.render();
      this.updateTelemetry();
    });
  }
  
  addPreset(name, onClick) {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = name;
    btn.addEventListener('click', onClick);
    this.presetsContainer.appendChild(btn);
  }
  
  updateInfoCard(simKey) {
    const sim = this.simulations[simKey];
    
    let info = {
      icon: "🎯",
      title: "Tiro Parabólico",
      desc: "Estudia la trayectoria parabólica producida por la aceleración de gravedad g y la resistencia del aire.",
      formula: "📐 Fórmula: y(t) = y₀ + v₀y·t - ½g·t²  |  v_x = v₀·cos(θ)"
    };
    
    if (simKey === 'projectile') {
      info = {
        icon: "🎯",
        title: "Tiro Parabólico",
        desc: "Estudia la trayectoria parabólica producida por la aceleración de gravedad g y la resistencia del aire.",
        formula: "📐 Fórmula: y(t) = y₀ + v₀y·t - ½g·t²  |  v_x = v₀·cos(θ)"
      };
    } else if (simKey === 'newton') {
      info = {
        icon: "⚖️",
        title: "Leyes de Newton & Dinámica",
        desc: "Demuestra la 2ª Ley F_neta = m·a en planos inclinados con fricción f_k = μ·N y la aceleración en poleas atwood.",
        formula: "📐 2ª Ley: F_neta = m · a  |  Diagrama de Cuerpo Libre (N, W, f_k)"
      };
    } else if (simKey === 'pendulum') {
      info = {
        icon: "🌀",
        title: "Péndulo y Caos",
        desc: "Demuestra la dinámica caótica del péndulo doble, sensible a fluctuaciones infinitésimas en sus ángulos iniciales.",
        formula: "📐 Ecuación: d²θ/dt² + (g/L)·sin(θ) + c·v = 0"
      };
    } else if (simKey === 'collisions') {
      info = {
        icon: "💥",
        title: "Colisiones 2D",
        desc: "Analiza el choque entre partículas en 2D, comprobando la conservación del momento lineal P = m·v y el coeficiente e.",
        formula: "📐 Momento: P_total = m₁v₁ + m₂v₂  |  e = (v₂' - v₁') / (v₁ - v₂)"
      };
    } else if (simKey === 'orbits') {
      info = {
        icon: "🪐",
        title: "Gravitación Universal",
        desc: "Visualiza órbitas planetarias elípticas de Kepler derivadas de la atracción gravitatoria proporcional a 1/r².",
        formula: "📐 Ley de Newton: F = G · (m₁ · m₂) / r²"
      };
    } else if (simKey === 'electrostatics') {
      info = {
        icon: "⚡",
        title: "Electrostática",
        desc: "Representa el campo eléctrico E en espacio 2D debido a cargas puntuales y la trayectoria de una partícula de prueba.",
        formula: "📐 Ley de Coulomb: E = k · q / r²  |  F_eléctrica = q · E"
      };
    } else if (simKey === 'thermodynamics') {
      if (sim.mode === 'open_system') {
        info = {
          icon: "🔓",
          title: "Sistema Abierto (Termodinámica)",
          desc: "Intercambia MATERIA (partículas salen libremente) y ENERGÍA (calor Q) con el medio ambiente.",
          formula: "📐 dM/dt ≠ 0  |  dQ/dt ≠ 0  |  Ej: Vaso hirviendo destapado"
        };
      } else if (sim.mode === 'closed_system') {
        info = {
          icon: "🔒",
          title: "Sistema Cerrado (Termodinámica)",
          desc: "Intercambia ENERGÍA (calor/trabajo) con el entorno, pero la MATERIA se mantiene constante (no salen partículas).",
          formula: "📐 Masa = Constante  |  dQ/dt ≠ 0  |  Ej: Olla hermética o pistón sellado"
        };
      } else if (sim.mode === 'isolated_system') {
        info = {
          icon: "🛡️",
          title: "Sistema Aislado (Termodinámica)",
          desc: "NO intercambia MATERIA ni ENERGÍA con el entorno (Paredes adiabáticas y rígidas ideales).",
          formula: "📐 Q = 0  |  W = 0  |  ΔE_interna = 0  |  Ej: Termo ideal / Universo"
        };
      } else {
        info = {
          icon: "🔥",
          title: "Termodinámica & Dilatación",
          desc: "Muestra la expansión térmica lineal de sólidos ΔL = α L₀ ΔT, flexión bimetálica y trabajo de gases ideales en pistón PV=nRT.",
          formula: "📐 Dilatación: ΔL = α · L₀ · (T - T₀)  |  Gas Ideal: P · V = n · R · T"
        };
      }
    }
    
    this.infoIcon.textContent = info.icon;
    this.infoTitle.textContent = info.title;
    this.infoDesc.textContent = info.desc;
    this.infoFormula.innerHTML = `<span>${info.formula}</span>`;
    
    // Personalizar etiquetas de tarjetas de métricas
    if (simKey === 'thermodynamics') {
      this.labelMetricSpeed.textContent = "Temperatura";
      if (sim.mode.includes('system')) {
        this.labelMetricHeight.textContent = "Escapadas";
      } else {
        this.labelMetricHeight.textContent = "Dilatación ΔL";
      }
    } else if (simKey === 'newton') {
      this.labelMetricSpeed.textContent = "Velocidad";
      this.labelMetricHeight.textContent = "Aceleración a";
    } else if (simKey === 'pendulum') {
      this.labelMetricSpeed.textContent = "Velocidad Ang. ω";
      this.labelMetricHeight.textContent = "Ángulo θ";
    } else {
      this.labelMetricSpeed.textContent = "Velocidad";
      this.labelMetricHeight.textContent = "Alt. Máxima";
    }
  }
  
  updateTelemetry() {
    this.metricTime.textContent = `${this.engine.simTime.toFixed(2)} s`;
    
    const history = this.engine.energyHistory;
    if (history.length > 0) {
      const latest = history[history.length - 1];
      this.metricEnergy.textContent = `${latest.et.toFixed(1)} J`;
    }
    
    const sim = this.engine.activeSim;
    if (this.currentSimKey === 'projectile' && sim) {
      this.metricSpeed.textContent = `${Math.hypot(sim.vx, sim.vy).toFixed(1)} m/s`;
      this.metricHeight.textContent = `${sim.maxHeight.toFixed(1)} m`;
    } else if (this.currentSimKey === 'newton' && sim) {
      this.metricSpeed.textContent = `${Math.abs(sim.v).toFixed(2)} m/s`;
      this.metricHeight.textContent = `${sim.a.toFixed(2)} m/s²`;
    } else if (this.currentSimKey === 'pendulum' && sim) {
      this.metricSpeed.textContent = `${sim.v1.toFixed(2)} rad/s`;
      this.metricHeight.textContent = `${(sim.a1 * 180 / Math.PI).toFixed(1)}°`;
    } else if (this.currentSimKey === 'thermodynamics' && sim) {
      this.metricSpeed.textContent = `${sim.T.toFixed(0)} °C`;
      if (sim.mode.includes('system')) {
        this.metricHeight.textContent = `${sim.escapedParticlesCount}`;
      } else {
        const mat = sim.materialsData[sim.material];
        const dL = mat ? (mat.alpha * sim.L0 * (sim.T - sim.T0) * 1000).toFixed(3) : '0';
        this.metricHeight.textContent = `${dL} mm`;
      }
    } else {
      this.metricSpeed.textContent = `--`;
      this.metricHeight.textContent = `--`;
    }
  }
}
