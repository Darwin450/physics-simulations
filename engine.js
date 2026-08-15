/**
 * Motor Principal de Física y Renderizado 2D (Physics Lab Engine)
 */
class PhysicsEngine {
  constructor(canvasId, chartCanvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.chartCanvas = document.getElementById(chartCanvasId);
    this.chartCtx = this.chartCanvas ? this.chartCanvas.getContext('2d') : null;
    
    this.isRunning = true;
    this.timeScale = 1.0;
    this.simTime = 0;
    this.lastFrameTime = performance.now();
    
    // Configuración de renderizado / Cámara
    this.scale = 20; // 20 píxeles por metro por defecto
    this.originX = 80; // Píxeles desde la izquierda
    this.originY = 0;  // Se recalcula con el alto
    
    // Toggles de visualización
    this.showVectors = true;
    this.showGrid = true;
    this.showTrail = true;
    
    // Telemetría e historial de gráfico
    this.energyHistory = []; // { time, ek, ep, et }
    this.maxHistoryLength = 250;
    
    // Callback de simulación activa
    this.activeSim = null;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    
    this.originY = this.height - 60;
    
    if (this.chartCanvas) {
      const chartRect = this.chartCanvas.parentElement.getBoundingClientRect();
      this.chartCanvas.width = chartRect.width * dpr;
      this.chartCanvas.height = (chartRect.height - 30) * dpr;
      if (this.chartCtx) {
        this.chartCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.chartCtx.scale(dpr, dpr);
      }
      this.chartWidth = chartRect.width;
      this.chartHeight = chartRect.height - 30;
    }
  }
  
  setSimulation(simInstance) {
    this.activeSim = simInstance;
    this.resetTime();
  }
  
  resetTime() {
    this.simTime = 0;
    this.energyHistory = [];
    if (this.activeSim && this.activeSim.reset) {
      this.activeSim.reset();
    }
  }
  
  start() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }
  
  pause() {
    this.isRunning = false;
  }
  
  togglePlay() {
    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      this.lastFrameTime = performance.now();
      this.loop();
    }
  }
  
  step(dt = 0.016) {
    if (this.activeSim) {
      this.activeSim.update(dt * this.timeScale);
      this.simTime += dt * this.timeScale;
    }
  }
  
  loop() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    let dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    
    if (dt > 0.1) dt = 0.1;
    
    const effectiveDt = dt * this.timeScale;
    
    const substeps = 5;
    const subDt = effectiveDt / substeps;
    for (let i = 0; i < substeps; i++) {
      if (this.activeSim && this.activeSim.update) {
        this.activeSim.update(subDt);
      }
    }
    
    this.simTime += effectiveDt;
    
    this.render();
    
    requestAnimationFrame(() => this.loop());
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (this.showGrid) {
      this.drawGrid();
    }
    
    if (this.activeSim && this.activeSim.draw) {
      this.activeSim.draw(this);
    }
    
    this.drawChart();
  }
  
  toScreenX(x) {
    return this.originX + x * this.scale;
  }
  
  toScreenY(y) {
    return this.originY - y * this.scale;
  }
  
  toPhysicsX(px) {
    return (px - this.originX) / this.scale;
  }
  
  toPhysicsY(py) {
    return (this.originY - py) / this.scale;
  }
  
  drawGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const stepMeters = 5;
    const stepPx = stepMeters * this.scale;
    
    for (let x = this.originX % stepPx; x < this.width; x += stepPx) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    for (let y = this.originY % stepPx; y < this.height; y += stepPx) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.originY);
    ctx.lineTo(this.width, this.originY);
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawVector(x, y, vx, vy, color = '#00f3ff', label = '', scaleFactor = 0.5) {
    if (!this.showVectors) return;
    const ctx = this.ctx;
    
    const startX = this.toScreenX(x);
    const startY = this.toScreenY(y);
    const endX = startX + vx * scaleFactor * this.scale;
    const endY = startY - vy * scaleFactor * this.scale;
    
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.hypot(dx, dy);
    
    if (len < 2) return;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    const angle = Math.atan2(dy, dx);
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    
    if (label) {
      ctx.font = '11px Space Grotesk';
      ctx.fillText(label, endX + 6, endY - 6);
    }
    
    ctx.restore();
  }
  
  recordEnergy(ek, ep) {
    const et = ek + ep;
    this.energyHistory.push({ time: this.simTime, ek, ep, et });
    if (this.energyHistory.length > this.maxHistoryLength) {
      this.energyHistory.shift();
    }
  }
  
  drawChart() {
    if (!this.chartCtx) return;
    
    const ctx = this.chartCtx;
    const w = this.chartWidth;
    const h = this.chartHeight;
    
    ctx.clearRect(0, 0, w, h);
    
    if (this.energyHistory.length < 2) return;
    
    let maxE = 10;
    for (let p of this.energyHistory) {
      if (p.et > maxE) maxE = p.et;
      if (p.ek > maxE) maxE = p.ek;
      if (p.ep > maxE) maxE = p.ep;
    }
    maxE *= 1.1;
    
    const drawLine = (key, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = 0; i < this.energyHistory.length; i++) {
        const p = this.energyHistory[i];
        const x = (i / (this.maxHistoryLength - 1)) * w;
        const y = h - (p[key] / maxE) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    
    drawLine('ep', '#9d4edd');
    drawLine('ek', '#00ff9d');
    drawLine('et', '#00f3ff');
  }
}
