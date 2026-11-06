/**
 * Simulación 5: Electrostática (Líneas de Campo Eléctrico y Cargas)
 */
class ElectrostaticsSimulation {
  constructor() {
    this.name = "Campo Eléctrico";
    this.k = 100; // Constante de Coulomb simulada
    this.reset();
  }
  
  reset() {
    this.charges = [
      { x: 12, y: 12, q: 5,  color: '#ff007f' },  // Positiva (Rosado)
      { x: 28, y: 12, q: -5, color: '#00f3ff' }, // Negativa (Cian)
      { x: 20, y: 18, q: 3,  color: '#ff007f' }
    ];
    
    // Partícula de prueba
    this.testParticle = {
      x: 5, y: 12, vx: 2, vy: 4, q: 1, m: 0.5, trail: []
    };
  }
  
  update(dt) {
    let Ex = 0, Ey = 0;
    
    for (let c of this.charges) {
      const dx = this.testParticle.x - c.x;
      const dy = this.testParticle.y - c.y;
      const r = Math.hypot(dx, dy);
      if (r > 0.5) {
        const E = (this.k * c.q) / (r * r);
        Ex += E * (dx / r);
        Ey += E * (dy / r);
      }
    }
    
    // Fuerza Coulomb F = q * E -> a = q * E / m
    const ax = (this.testParticle.q * Ex) / this.testParticle.m;
    const ay = (this.testParticle.q * Ey) / this.testParticle.m;
    
    this.testParticle.vx += ax * dt;
    this.testParticle.vy += ay * dt;
    this.testParticle.x += this.testParticle.vx * dt;
    this.testParticle.y += this.testParticle.vy * dt;
    
    this.testParticle.trail.push({ x: this.testParticle.x, y: this.testParticle.y });
    if (this.testParticle.trail.length > 250) this.testParticle.trail.shift();
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    
    // Dibujar Rejilla de Vectores de Campo Eléctrico E(x,y)
    const gridStep = 2.5;
    for (let x = 2; x <= 38; x += gridStep) {
      for (let y = 2; y <= 22; y += gridStep) {
        let Ex = 0, Ey = 0;
        for (let c of this.charges) {
          const dx = x - c.x;
          const dy = y - c.y;
          const r = Math.hypot(dx, dy);
          if (r > 0.4) {
            const E = (this.k * c.q) / (r * r);
            Ex += E * (dx / r);
            Ey += E * (dy / r);
          }
        }
        
        const magnitude = Math.hypot(Ex, Ey);
        if (magnitude > 0.1) {
          const normEx = Ex / magnitude;
          const normEy = Ey / magnitude;
          const alpha = Math.min(1, magnitude / 15);
          engine.drawVector(x, y, normEx * 1.5, normEy * 1.5, `rgba(0, 243, 255, ${alpha})`, '', 0.8);
        }
      }
    }
    
    // Dibujar Cargas Puntuales
    for (let c of this.charges) {
      const px = engine.toScreenX(c.x);
      const py = engine.toScreenY(c.y);
      
      ctx.save();
      const chargeGradient = ctx.createRadialGradient(px - 5, py - 5, 2, px, py, 18);
      chargeGradient.addColorStop(0, '#ffffff');
      chargeGradient.addColorStop(0.3, c.color);
      chargeGradient.addColorStop(1, c.color);
      ctx.fillStyle = chargeGradient;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? `+${c.q}` : `${c.q}`, px, py);
      ctx.restore();
    }
    
    // Dibujar Rastro y Partícula de Prueba
    const tp = this.testParticle;
    if (engine.showTrail && tp.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < tp.trail.length; i++) {
        const px = engine.toScreenX(tp.trail[i].x);
        const py = engine.toScreenY(tp.trail[i].y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }
    
    engine.drawShadow(tp.x, tp.y, 12, 'rgba(0, 255, 157, 0.22)');
    const tPx = engine.toScreenX(tp.x);
    const tPy = engine.toScreenY(tp.y);
    ctx.save();
    const particleGradient = ctx.createRadialGradient(tPx - 2, tPy - 2, 1, tPx, tPy, 10);
    particleGradient.addColorStop(0, '#ffffff');
    particleGradient.addColorStop(0.4, '#00ff9d');
    particleGradient.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = particleGradient;
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(tPx, tPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    const speed = Math.hypot(tp.vx, tp.vy);
    engine.recordEnergy(0.5 * tp.m * speed * speed, 0);
  }
}
