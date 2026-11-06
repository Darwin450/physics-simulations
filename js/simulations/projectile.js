/**
 * Simulación 1: Tiro Parabólico (Movimiento de Proyectiles)
 */
class ProjectileSimulation {
  constructor() {
    this.name = "Movimiento Parabólico";
    
    // Parámetros por defecto
    this.v0 = 35; // m/s
    this.angle = 45; // grados
    this.h0 = 5; // m
    this.gravity = 9.81; // m/s^2
    this.mass = 2.0; // kg
    this.drag = 0.05; // Coeficiente de resistencia del aire (0 a 0.5)
    this.targetDist = 100; // m
    
    // Estado actual
    this.reset();
  }
  
  reset() {
    this.x = 0;
    this.y = this.h0;
    const rad = (this.angle * Math.PI) / 180;
    this.vx = this.v0 * Math.cos(rad);
    this.vy = this.v0 * Math.sin(rad);
    
    this.trail = [];
    this.maxHeight = this.h0;
    this.maxDistance = 0;
    this.flightTime = 0;
    this.isLanded = false;
    this.hitTarget = false;
  }
  
  update(dt) {
    if (this.isLanded) return;
    
    this.flightTime += dt;
    
    // Fuerza de gravedad + Resistencia del aire F_d = -0.5 * drag * v * v_vec
    const speed = Math.hypot(this.vx, this.vy);
    const fx = -this.drag * this.vx * speed;
    const fy = -this.mass * this.gravity - this.drag * this.vy * speed;
    
    const ax = fx / this.mass;
    const ay = fy / this.mass;
    
    this.vx += ax * dt;
    this.vy += ay * dt;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    if (this.y > this.maxHeight) this.maxHeight = this.y;
    
    this.trail.push({ x: this.x, y: this.y });
    
    // Comprobar colisión con el suelo (Y = 0)
    if (this.y <= 0) {
      this.y = 0;
      this.isLanded = true;
      this.maxDistance = this.x;
      
      // Comprobar diana
      if (Math.abs(this.x - this.targetDist) < 4) {
        this.hitTarget = true;
      }
    }
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    
    // Dibujar Diana en la distancia
    const targetPx = engine.toScreenX(this.targetDist);
    const groundPy = engine.toScreenY(0);
    
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.beginPath();
    ctx.arc(targetPx, groundPy - 10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(targetPx, groundPy - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Dibujar Rastro (Trail)
    engine.drawTrail(this.trail, '#00f3ff', 2.2, 0.72);
    
    // Dibujar Cañón
    const cannonPx = engine.toScreenX(0);
    const cannonPy = engine.toScreenY(this.h0);
    ctx.save();
    ctx.translate(cannonPx, cannonPy);
    ctx.rotate((-this.angle * Math.PI) / 180);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, -6, 24, 12);
    ctx.restore();
    
    // Dibujar Proyectil
    const px = engine.toScreenX(this.x);
    const py = engine.toScreenY(this.y);
    
    ctx.save();
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Dibujar Vectores
    if (engine.showVectors && !this.isLanded) {
      engine.drawVector(this.x, this.y, this.vx, 0, '#00ff9d', 'Vx', 0.4);
      engine.drawVector(this.x, this.y, 0, this.vy, '#9d4edd', 'Vy', 0.4);
      engine.drawVector(this.x, this.y, this.vx, this.vy, '#00f3ff', 'V', 0.4);
    }
    
    // Calcular Energía Cinética y Potencial
    const speed = Math.hypot(this.vx, this.vy);
    const ek = 0.5 * this.mass * speed * speed;
    const ep = this.mass * this.gravity * Math.max(0, this.y);
    engine.recordEnergy(ek, ep);
  }
}
