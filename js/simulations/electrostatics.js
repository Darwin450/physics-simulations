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
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 18;
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
    engine.drawTrail(tp.trail, '#00ff9d', 2.2, 0.72);
    
    const tPx = engine.toScreenX(tp.x);
    const tPy = engine.toScreenY(tp.y);
    ctx.save();
    ctx.fillStyle = '#00ff9d';
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(tPx, tPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    const speed = Math.hypot(tp.vx, tp.vy);
    engine.recordEnergy(0.5 * tp.m * speed * speed, 0);
  }
}
