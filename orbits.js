/**
 * Simulación 4: Gravitación Universal y Órbitas de Kepler
 */
class OrbitsSimulation {
  constructor() {
    this.name = "Gravitación y Órbitas";
    this.G = 100; // Constante gravitacional simulada
    this.reset();
  }
  
  reset() {
    // Estrella central
    this.star = { x: 20, y: 12, m: 1000, r: 1.5, color: '#ffd166' };
    
    // Planetas
    this.planets = [
      { x: 20, y: 18, vx: 4.0, vy: 0, m: 5, r: 0.5, color: '#00f3ff', trail: [] },
      { x: 20, y: 22, vx: 3.1, vy: 0, m: 10, r: 0.7, color: '#9d4edd', trail: [] },
      { x: 20, y: 5,  vx: -3.8, vy: 0, m: 3, r: 0.4, color: '#00ff9d', trail: [] }
    ];
  }
  
  update(dt) {
    for (let p of this.planets) {
      // Fuerza gravitacional hacia la estrella central F = G * M * m / r^2
      const dx = this.star.x - p.x;
      const dy = this.star.y - p.y;
      const r = Math.hypot(dx, dy);
      
      if (r > 0.5) {
        const F = (this.G * this.star.m * p.m) / (r * r);
        const ax = (F / p.m) * (dx / r);
        const ay = (F / p.m) * (dy / r);
        
        p.vx += ax * dt;
        p.vy += ay * dt;
      }
      
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 200) p.trail.shift();
    }
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    
    // Dibujar Estrella Central (Sol)
    const starPx = engine.toScreenX(this.star.x);
    const starPy = engine.toScreenY(this.star.y);
    const starPr = this.star.r * engine.scale;
    
    ctx.save();
    ctx.fillStyle = this.star.color;
    ctx.shadowColor = this.star.color;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(starPx, starPy, starPr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    let totalEk = 0, totalEp = 0;
    
    // Dibujar Planetas y Rastro Orbitatorio
    for (let p of this.planets) {
      if (engine.showTrail && p.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < p.trail.length; i++) {
          const px = engine.toScreenX(p.trail[i].x);
          const py = engine.toScreenY(p.trail[i].y);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }
      
      const px = engine.toScreenX(p.x);
      const py = engine.toScreenY(p.y);
      const pr = p.r * engine.scale;
      
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      if (engine.showVectors) {
        engine.drawVector(p.x, p.y, p.vx, p.vy, p.color, 'v', 0.8);
      }
      
      const speed = Math.hypot(p.vx, p.vy);
      const dist = Math.hypot(this.star.x - p.x, this.star.y - p.y);
      totalEk += 0.5 * p.m * speed * speed;
      totalEp -= (this.G * this.star.m * p.m) / Math.max(0.1, dist);
    }
    
    engine.recordEnergy(totalEk, Math.abs(totalEp));
  }
}
