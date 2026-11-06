/**
 * Simulación 6: Termodinámica, Dilatación Térmica y Sistemas Termodinámicos
 */
class ThermodynamicsSimulation {
  constructor() {
    this.name = "Termodinámica & Sistemas";
    
    // Modos: 'rod', 'bimetallic', 'gas', 'open_system', 'closed_system', 'isolated_system'
    this.mode = 'open_system';
    
    // Parámetros de varilla / material
    this.T0 = 20; // °C (Temperatura inicial de referencia)
    this.T = 150; // °C (Temperatura actual)
    this.L0 = 10.0; // m (Longitud inicial)
    this.material = 'copper';
    
    // Coeficientes de dilatación lineal α (1/°C)
    this.materialsData = {
      aluminum: { name: 'Aluminio', alpha: 23e-6, color: '#e2e8f0' },
      copper:   { name: 'Cobre',    alpha: 17e-6, color: '#ff6b35' },
      steel:    { name: 'Acero',    alpha: 12e-6, color: '#94a3b8' },
      glass:    { name: 'Vidrio',   alpha: 9e-6,  color: '#00f3ff' },
      invar:    { name: 'Invar',    alpha: 1.2e-6,color: '#ffd166' }
    };
    
    // Partículas para gas / sistemas
    this.gasParticles = [];
    this.escapedParticlesCount = 0;
    this.initGasParticles();
    
    this.reset();
  }
  
  initGasParticles() {
    this.gasParticles = [];
    this.escapedParticlesCount = 0;
    const count = (this.mode.includes('system')) ? 60 : 40;
    for (let i = 0; i < count; i++) {
      this.gasParticles.push({
        x: 10 + Math.random() * 10,
        y: 6 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        escaped: false
      });
    }
  }
  
  reset() {
    this.T = 150;
    this.initGasParticles();
  }
  
  update(dt) {
    const tempK = Math.max(10, this.T + 273.15);
    const speedFactor = Math.sqrt(tempK / 293.15);
    
    if (this.mode === 'gas') {
      const pistonX = 10 + (this.T / 500) * 12;
      for (let p of this.gasParticles) {
        p.x += p.vx * speedFactor * dt * 2;
        p.y += p.vy * speedFactor * dt * 2;
        if (p.x < 5) { p.x = 5; p.vx *= -1; }
        if (p.x > pistonX) { p.x = pistonX; p.vx *= -1; }
        if (p.y < 5) { p.y = 5; p.vy *= -1; }
        if (p.y > 15) { p.y = 15; p.vy *= -1; }
      }
    } else if (this.mode === 'open_system') {
      // Sistema Abierto: Intercambia Masa (partículas escapan por arriba) y Energía (calor)
      const containerLeft = 10;
      const containerRight = 26;
      const containerBottom = 4;
      const containerTop = 16; // Abertura arriba
      
      for (let p of this.gasParticles) {
        if (p.escaped) {
          p.y += p.vy * speedFactor * dt;
          p.x += p.vx * speedFactor * dt;
          continue;
        }
        
        p.x += p.vx * speedFactor * dt * 2;
        p.y += p.vy * speedFactor * dt * 2;
        
        // Paredes laterales y fondo
        if (p.x < containerLeft) { p.x = containerLeft; p.vx *= -1; }
        if (p.x > containerRight) { p.x = containerRight; p.vx *= -1; }
        if (p.y < containerBottom) { p.y = containerBottom; p.vy *= -1; }
        
        // Abertura superior -> Escapa del sistema abierto
        if (p.y > containerTop) {
          p.escaped = true;
          this.escapedParticlesCount++;
        }
      }
    } else if (this.mode === 'closed_system') {
      // Sistema Cerrado: Intercambia Energía (calor), MASA CONSTANTE (no escapan partículas)
      const containerLeft = 10;
      const containerRight = 26;
      const containerBottom = 4;
      const containerTop = 16;
      
      for (let p of this.gasParticles) {
        p.x += p.vx * speedFactor * dt * 2;
        p.y += p.vy * speedFactor * dt * 2;
        
        if (p.x < containerLeft) { p.x = containerLeft; p.vx *= -1; }
        if (p.x > containerRight) { p.x = containerRight; p.vx *= -1; }
        if (p.y < containerBottom) { p.y = containerBottom; p.vy *= -1; }
        if (p.y > containerTop) { p.y = containerTop; p.vy *= -1; }
      }
    } else if (this.mode === 'isolated_system') {
      // Sistema Aislado: NO intercambia Masa NI Energía (Pared adiabática rígidamente aislada)
      // La temperatura efectiva interna no se ve afectada por el calor externo
      const fixedSpeedFactor = 1.0;
      const containerLeft = 10;
      const containerRight = 26;
      const containerBottom = 4;
      const containerTop = 16;
      
      for (let p of this.gasParticles) {
        p.x += p.vx * fixedSpeedFactor * dt * 2;
        p.y += p.vy * fixedSpeedFactor * dt * 2;
        
        if (p.x < containerLeft) { p.x = containerLeft; p.vx *= -1; }
        if (p.x > containerRight) { p.x = containerRight; p.vx *= -1; }
        if (p.y < containerBottom) { p.y = containerBottom; p.vy *= -1; }
        if (p.y > containerTop) { p.y = containerTop; p.vy *= -1; }
      }
    }
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    const mat = this.materialsData[this.material];
    const deltaT = this.T - this.T0;
    const deltaL = mat.alpha * this.L0 * deltaT;
    const currentL = this.L0 + deltaL;
    
    if (this.mode === 'rod') {
      this.drawRodMode(engine, mat, deltaT, deltaL, currentL);
    } else if (this.mode === 'bimetallic') {
      this.drawBimetallicMode(engine, deltaT);
    } else if (this.mode === 'gas') {
      this.drawGasPistonMode(engine);
    } else if (this.mode.includes('system')) {
      this.drawThermodynamicSystemMode(engine);
    }
    
    // Telemetría de energía térmica
    const ekThermal = (this.T + 273.15) * 1.5;
    engine.recordEnergy(ekThermal, 0);
  }
  
  drawRodMode(engine, mat, deltaT, deltaL, currentL) {
    const ctx = engine.ctx;
    const startX = 6;
    const startY = 12;
    
    const pStartX = engine.toScreenX(startX);
    const pStartY = engine.toScreenY(startY);
    const rodHeightPx = 40;
    
    const visualMag = 5000;
    const visualWidthM = this.L0 + deltaL * visualMag;
    const pWidthPx = visualWidthM * engine.scale;
    
    const tempRatio = Math.min(1, Math.max(0, (this.T + 100) / 600));
    const rodGlowColor = tempRatio > 0.5 
      ? `rgba(255, ${Math.floor(255 * (1 - tempRatio))}, 0, 0.4)`
      : `rgba(0, 243, 255, ${Math.floor(0.4 * (1 - tempRatio))})`;
      
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.fillRect(pStartX - 15, pStartY - 40, 15, 80);
    
    ctx.fillStyle = mat.color;
    ctx.shadowColor = rodGlowColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(pStartX, pStartY - rodHeightPx / 2, pWidthPx, rodHeightPx);
    
    const numAtoms = 12;
    const atomSpacing = pWidthPx / numAtoms;
    const jitter = Math.max(0, (this.T + 50) / 100);
    
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i <= numAtoms; i++) {
      const ax = pStartX + i * atomSpacing;
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;
      ctx.beginPath();
      ctx.arc(ax + jx, pStartY + jy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    ctx.save();
    ctx.strokeStyle = '#00f3ff';
    ctx.fillStyle = '#00f3ff';
    ctx.font = '14px Space Grotesk';
    ctx.lineWidth = 1.5;
    
    const pEndL0X = engine.toScreenX(startX + this.L0);
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pEndL0X, pStartY - 60);
    ctx.lineTo(pEndL0X, pStartY + 60);
    ctx.stroke();
    ctx.fillText(`L₀ = ${this.L0.toFixed(2)}m (a 20°C)`, pEndL0X - 60, pStartY - 70);
    
    ctx.setLineDash([]);
    ctx.fillStyle = deltaL >= 0 ? '#00ff9d' : '#ff007f';
    ctx.fillText(`ΔL = ${deltaL >= 0 ? '+' : ''}${(deltaL * 1000).toFixed(3)} mm  (${mat.name})`, pStartX + pWidthPx + 15, pStartY + 5);
    ctx.restore();
  }
  
  drawBimetallicMode(engine, deltaT) {
    const ctx = engine.ctx;
    
    const startX = engine.toScreenX(6);
    const startY = engine.toScreenY(12);
    const len = 300;
    const h = 20;
    
    const alphaDiff = (23e-6 - 1.2e-6);
    const bendAngle = deltaT * alphaDiff * 80;
    
    ctx.save();
    ctx.translate(startX, startY);
    
    const drawLayer = (color, label, offsetY) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, offsetY);
      
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * len;
        const y = offsetY + Math.pow(t, 2) * bendAngle;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(len, offsetY + h + Math.pow(1, 2) * bendAngle);
      for (let i = steps; i >= 0; i--) {
        const t = i / steps;
        const x = t * len;
        const y = offsetY + h + Math.pow(t, 2) * bendAngle;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#050b14';
      ctx.font = 'bold 11px Space Grotesk';
      ctx.fillText(label, len / 2, offsetY + h / 2 + 4 + Math.pow(0.5, 2) * bendAngle);
    };
    
    drawLayer('#e2e8f0', 'Aluminio (α = 23×10⁻⁶)', -h);
    drawLayer('#ffd166', 'Invar (α = 1.2×10⁻⁶)', 0);
    
    ctx.restore();
  }
  
  drawGasPistonMode(engine) {
    const ctx = engine.ctx;
    
    const pLeftX = engine.toScreenX(5);
    const pTopY = engine.toScreenY(15);
    const pBottomY = engine.toScreenY(5);
    const pistonX = 10 + (this.T / 500) * 12;
    const pPistonX = engine.toScreenX(pistonX);
    
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(pLeftX, pTopY, pPistonX - pLeftX, pBottomY - pTopY);
    
    ctx.fillStyle = '#ff6b35';
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 10;
    ctx.fillRect(pPistonX, pTopY, 15, pBottomY - pTopY);
    
    for (let p of this.gasParticles) {
      const px = engine.toScreenX(p.x);
      const py = engine.toScreenY(p.y);
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // RENDERIZADO DE SISTEMAS TERMODINÁMICOS (ABIERTO, CERRADO Y AISLADO)
  drawThermodynamicSystemMode(engine) {
    const ctx = engine.ctx;
    
    const pLeft = engine.toScreenX(10);
    const pRight = engine.toScreenX(26);
    const pBottom = engine.toScreenY(4);
    const pTop = engine.toScreenY(16);
    const w = pRight - pLeft;
    const h = pBottom - pTop;
    
    ctx.save();
    
    // 1. Dibujar Contenedor / Paredes según tipo de sistema
    if (this.mode === 'open_system') {
      // Sistema Abierto: Destapado arriba (Sin tapa)
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(pLeft, pTop);
      ctx.lineTo(pLeft, pBottom);
      ctx.lineTo(pRight, pBottom);
      ctx.lineTo(pRight, pTop);
      ctx.stroke();
      
      // Etiqueta de Abertura
      ctx.fillStyle = '#ff007f';
      ctx.font = 'bold 12px Space Grotesk';
      ctx.fillText('⬆ ABERTURA: Intercambio de Materia (Escapan Partículas)', pLeft + 10, pTop - 15);
      
    } else if (this.mode === 'closed_system') {
      // Sistema Cerrado: Totalmente Sellado (Tapa hermética), transmite calor
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#00ff9d';
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 10;
      ctx.strokeRect(pLeft, pTop, w, h);
      
      // Tapa sellada
      ctx.fillStyle = '#00ff9d';
      ctx.fillRect(pLeft, pTop - 6, w, 8);
      
      ctx.fillStyle = '#00ff9d';
      ctx.font = 'bold 12px Space Grotesk';
      ctx.fillText('🔒 PARED DIATÉRMICA SELLADA: Intercambio de Calor (Masa Constante)', pLeft, pTop - 15);
      
    } else if (this.mode === 'isolated_system') {
      // Sistema Aislado: Doble Pared Adiabática (Aislamiento térmico + Sellado)
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#ffd166';
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 15;
      ctx.strokeRect(pLeft - 8, pTop - 8, w + 16, h + 16);
      
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#07090e';
      ctx.strokeRect(pLeft, pTop, w, h);
      
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 12px Space Grotesk';
      ctx.fillText('🛡️ PARED ADIABÁTICA AISLADA: Sin Intercambio de Materia ni Energía', pLeft - 10, pTop - 22);
    }
    
    // 2. Fuego / Fuente de Calor inferior (si no es aislado o si T > 20)
    if (this.T > 20 && this.mode !== 'isolated_system') {
      ctx.fillStyle = 'rgba(255, 107, 53, 0.4)';
      ctx.beginPath();
      ctx.arc(pLeft + w / 2, pBottom + 20, 60, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ff6b35';
      ctx.font = '12px Space Grotesk';
      ctx.fillText('🔥 Calor Entrante (Q)', pLeft + w / 2 - 50, pBottom + 35);
    } else if (this.mode === 'isolated_system') {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Space Grotesk';
      ctx.fillText('🚫 Aislamiento Adiabático (Q = 0, W = 0)', pLeft + w / 2 - 80, pBottom + 30);
    }
    
    // 3. Renderizar Partículas de Gas
    let activeParticles = 0;
    for (let p of this.gasParticles) {
      const px = engine.toScreenX(p.x);
      const py = engine.toScreenY(p.y);
      
      if (p.escaped) {
        ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        activeParticles++;
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Badges informativas dentro del contenedor
    ctx.fillStyle = 'rgba(7, 9, 14, 0.8)';
    ctx.fillRect(pLeft + 15, pTop + 15, 200, 65);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.strokeRect(pLeft + 15, pTop + 15, 200, 65);
    
    ctx.fillStyle = '#00ff9d';
    ctx.font = '12px Space Grotesk';
    ctx.fillText(`Partículas Internas: ${activeParticles}`, pLeft + 25, pTop + 35);
    ctx.fillStyle = '#ff007f';
    ctx.fillText(`Materia Escapada: ${this.escapedParticlesCount}`, pLeft + 25, pTop + 55);
    
    ctx.restore();
  }
}
