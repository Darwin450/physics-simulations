/**
 * Simulación 2: Péndulo Simple y Péndulo Doble (Caos y Oscilaciones)
 */
class PendulumSimulation {
  constructor() {
    this.name = "Péndulo y Caos";
    
    this.mode = 'double'; // 'simple' o 'double'
    this.g = 9.81;
    this.damping = 0.002;
    
    // Péndulo 1
    this.l1 = 4.0; // m
    this.m1 = 2.0; // kg
    this.a1 = Math.PI / 2; // ángulo inicial 90 deg
    this.v1 = 0;
    
    // Péndulo 2
    this.l2 = 3.0; // m
    this.m2 = 1.5; // kg
    this.a2 = Math.PI / 2;
    this.v2 = 0;
    
    this.trail = [];
    this.maxTrail = 300;
  }
  
  reset() {
    this.a1 = Math.PI / 2;
    this.v1 = 0;
    this.a2 = Math.PI / 2;
    this.v2 = 0;
    this.trail = [];
  }
  
  update(dt) {
    if (this.mode === 'simple') {
      const alpha = (-this.g / this.l1) * Math.sin(this.a1) - this.damping * this.v1;
      this.v1 += alpha * dt;
      this.a1 += this.v1 * dt;
    } else {
      // Péndulo Doble - Ecuaciones de movimiento Euler-Lagrange
      const g = this.g;
      const m1 = this.m1, m2 = this.m2;
      const l1 = this.l1, l2 = this.l2;
      const a1 = this.a1, a2 = this.a2;
      const v1 = this.v1, v2 = this.v2;
      
      const num1 = -g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2) - 2 * Math.sin(a1 - a2) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(a1 - a2));
      const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const alpha1 = num1 / den1 - this.damping * v1;
      
      const num2 = 2 * Math.sin(a1 - a2) * (v1 * v1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1) + v2 * v2 * l2 * m2 * Math.cos(a1 - a2));
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
      const alpha2 = num2 / den2 - this.damping * v2;
      
      this.v1 += alpha1 * dt;
      this.v2 += alpha2 * dt;
      this.a1 += this.v1 * dt;
      this.a2 += this.v2 * dt;
    }
    
    // Guardar posición de la punta para la estela caótica
    const x1 = this.l1 * Math.sin(this.a1);
    const y1 = -this.l1 * Math.cos(this.a1);
    
    let tipX = x1;
    let tipY = y1;
    if (this.mode === 'double') {
      tipX += this.l2 * Math.sin(this.a2);
      tipY -= this.l2 * Math.cos(this.a2);
    }
    
    this.trail.push({ x: tipX, y: tipY });
    if (this.trail.length > this.maxTrail) this.trail.shift();
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    
    // Punto de pivote en pantalla (centrado en la parte superior)
    const pivotX = engine.width / 2;
    const pivotY = engine.height / 3;
    
    // Péndulo 1
    const x1 = pivotX + this.l1 * engine.scale * Math.sin(this.a1);
    const y1 = pivotY + this.l1 * engine.scale * Math.cos(this.a1);
    
    // Péndulo 2
    const x2 = x1 + this.l2 * engine.scale * Math.sin(this.a2);
    const y2 = y1 + this.l2 * engine.scale * Math.cos(this.a2);
    
    // Dibujar Estela Caótica
    if (engine.showTrail && this.trail.length > 1) {
      ctx.save();
      for (let i = 1; i < this.trail.length; i++) {
        const p1 = this.trail[i - 1];
        const p2 = this.trail[i];
        
        const px1 = pivotX + p1.x * engine.scale;
        const py1 = pivotY - p1.y * engine.scale;
        const px2 = pivotX + p2.x * engine.scale;
        const py2 = pivotY - p2.y * engine.scale;
        
        const alpha = i / this.trail.length;
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    engine.drawShadow(this.l1 * Math.sin(this.a1), -this.l1 * Math.cos(this.a1), 16, 'rgba(0,0,0,0.28)');
    
    // Masa 1
    const mass1Gradient = ctx.createRadialGradient(x1 - 4, y1 - 6, 2, x1, y1, 16);
    mass1Gradient.addColorStop(0, '#f5d0fe');
    mass1Gradient.addColorStop(0.55, '#9d4edd');
    mass1Gradient.addColorStop(1, '#4c1d95');
    ctx.fillStyle = mass1Gradient;
    ctx.shadowColor = '#9d4edd';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x1, y1, 12, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.mode === 'double') {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      const mass2Gradient = ctx.createRadialGradient(x2 - 3, y2 - 4, 2, x2, y2, 14);
      mass2Gradient.addColorStop(0, '#dff9ff');
      mass2Gradient.addColorStop(0.5, '#00f3ff');
      mass2Gradient.addColorStop(1, '#0891b2');
      ctx.fillStyle = mass2Gradient;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x2, y2, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#ff6b35';
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Energía
    const h1 = -this.l1 * Math.cos(this.a1);
    const v1_lin = this.l1 * this.v1;
    const ek1 = 0.5 * this.m1 * v1_lin * v1_lin;
    const ep1 = this.m1 * this.g * (h1 + this.l1);
    
    let ek2 = 0, ep2 = 0;
    if (this.mode === 'double') {
      const h2 = h1 - this.l2 * Math.cos(this.a2);
      const vx2 = this.l1 * this.v1 * Math.cos(this.a1) + this.l2 * this.v2 * Math.cos(this.a2);
      const vy2 = this.l1 * this.v1 * Math.sin(this.a1) + this.l2 * this.v2 * Math.sin(this.a2);
      ek2 = 0.5 * this.m2 * (vx2 * vx2 + vy2 * vy2);
      ep2 = this.m2 * this.g * (h2 + this.l1 + this.l2);
    }
    
    engine.recordEnergy(ek1 + ek2, ep1 + ep2);
  }
}
