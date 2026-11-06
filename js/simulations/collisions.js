/**
 * Simulación 4: Colisiones 2D
 */
class CollisionsSimulation {
  constructor() {
    this.name = 'Colisiones 2D';
    this.restitution = 0.9;
    this.reset();
  }

  reset() {
    this.particles = [
      { x: 9, y: 9, vx: 5.5, vy: 1.2, r: 1.1, m: 3, color: '#00f3ff', trail: [] },
      { x: 17, y: 12, vx: -3.2, vy: 2.6, r: 1.5, m: 5, color: '#ff6b35', trail: [] },
      { x: 24, y: 10, vx: 1.6, vy: -4.5, r: 0.9, m: 1.2, color: '#9d4edd', trail: [] }
    ];
  }

  update(dt) {
    const bounds = { minX: 1, maxX: 38, minY: 2, maxY: 22 };

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x - p.r < bounds.minX) {
        p.x = bounds.minX + p.r;
        p.vx = Math.abs(p.vx) * this.restitution;
      }
      if (p.x + p.r > bounds.maxX) {
        p.x = bounds.maxX - p.r;
        p.vx = -Math.abs(p.vx) * this.restitution;
      }
      if (p.y - p.r < bounds.minY) {
        p.y = bounds.minY + p.r;
        p.vy = Math.abs(p.vy) * this.restitution;
      }
      if (p.y + p.r > bounds.maxY) {
        p.y = bounds.maxY - p.r;
        p.vy = -Math.abs(p.vy) * this.restitution;
      }

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 90) p.trail.shift();
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.r + b.r;

        if (distSq <= minDist * minDist && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = (minDist - dist) / 2;

          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal < 0) {
            const impulse = (-(1 + this.restitution) * velAlongNormal) / ((1 / a.m) + (1 / b.m));
            const ix = impulse * nx;
            const iy = impulse * ny;

            a.vx -= ix / a.m;
            a.vy -= iy / a.m;
            b.vx += ix / b.m;
            b.vy += iy / b.m;
          }
        }
      }
    }
  }

  draw(engine) {
    const ctx = engine.ctx;

    for (const p of this.particles) {
      engine.drawTrail(p.trail, p.color, 1.7, 0.65);

      const px = engine.toScreenX(p.x);
      const py = engine.toScreenY(p.y);
      const radius = p.r * engine.scale;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (engine.showVectors) {
        engine.drawVector(p.x, p.y, p.vx, p.vy, p.color, 'v', 0.7);
      }
    }

    let totalEk = 0;
    for (const p of this.particles) {
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      totalEk += 0.5 * p.m * speedSq;
    }

    engine.recordEnergy(totalEk, 0);
  }
}
