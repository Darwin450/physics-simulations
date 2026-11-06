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
    const groundY = engine.toScreenY(0);

    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.fillRect(0, groundY - 6, engine.width, 8);
    ctx.restore();

    // Dibujar Diana en la distancia
    const targetPx = engine.toScreenX(this.targetDist);
    
    ctx.save();
    engine.drawShadow(this.targetDist, 0, 16, 'rgba(255, 0, 127, 0.25)');
    ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.beginPath();
    ctx.arc(targetPx, groundY - 10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(targetPx, groundY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Dibujar Rastro (Trail)
    if (engine.showTrail && this.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      for (let i = 0; i < this.trail.length; i++) {
        const px = engine.toScreenX(this.trail[i].x);
        const py = engine.toScreenY(this.trail[i].y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }
    
    // Dibujar Cañón
    const cannonPx = engine.toScreenX(0);
    const cannonPy = engine.toScreenY(this.h0);
    ctx.save();
    ctx.translate(cannonPx, cannonPy);
    ctx.rotate((-this.angle * Math.PI) / 180);
    const cannonGradient = ctx.createLinearGradient(0, -6, 26, 0);
    cannonGradient.addColorStop(0, '#cbd5e1');
    cannonGradient.addColorStop(1, '#64748b');
    ctx.fillStyle = cannonGradient;
    ctx.fillRect(0, -6, 28, 12);
    ctx.restore();
    
    // Dibujar Proyectil
    const px = engine.toScreenX(this.x);
    const py = engine.toScreenY(this.y);
    engine.drawShadow(this.x, this.y, 10, 'rgba(0, 0, 0, 0.42)');
    engine.drawOrb(this.x, this.y, 9, '#00f3ff', '#7dd3fc');
    
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
