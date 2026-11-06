/**
 * Choque elastico unidimensional entre dos esferas.
 */
class CollisionsSimulation {
  constructor() {
    this.name = 'Choque Elástico 1D';
    this.useFrameTrails = true;
    this.mass1 = 2;
    this.velocity1 = 4;
    this.mass2 = 3;
    this.velocity2 = -2;
    this.reset();
  }

  reset() {
    this.particles = [
      { x: -5.5, vx: this.velocity1, m: this.mass1, r: this.radiusForMass(this.mass1), color: '#00f3ff', trail: [] },
      { x: 5.5, vx: this.velocity2, m: this.mass2, r: this.radiusForMass(this.mass2), color: '#ff6b35', trail: [] }
    ];
    this.collided = false;
    this.momentumBeforeCollision = null;
    this.momentumAfterCollision = null;
  }

  radiusForMass(mass) {
    return 0.62 + Math.sqrt(mass) * 0.12;
  }

  update(dt) {
    const [ball1, ball2] = this.particles;
    ball1.x += ball1.vx * dt;
    ball2.x += ball2.vx * dt;

    const separation = ball2.x - ball1.x;
    const collisionDistance = ball1.r + ball2.r;

    if (!this.collided && separation <= collisionDistance && ball1.vx > ball2.vx) {
      const totalMass = ball1.m + ball2.m;
      const incomingMomentum = ball1.m * ball1.vx + ball2.m * ball2.vx;
      const incomingKineticEnergy = 0.5 * ball1.m * ball1.vx ** 2 + 0.5 * ball2.m * ball2.vx ** 2;
      const oldVelocity1 = ball1.vx;
      const oldVelocity2 = ball2.vx;

      ball1.vx = ((ball1.m - ball2.m) * oldVelocity1 + 2 * ball2.m * oldVelocity2) / totalMass;
      ball2.vx = (2 * ball1.m * oldVelocity1 + (ball2.m - ball1.m) * oldVelocity2) / totalMass;

      const overlap = collisionDistance - separation;
      ball1.x -= overlap / 2;
      ball2.x += overlap / 2;
      this.collided = true;
      this.momentumBeforeCollision = incomingMomentum;
      this.momentumAfterCollision = ball1.m * ball1.vx + ball2.m * ball2.vx;

      const outgoingKineticEnergy = 0.5 * ball1.m * ball1.vx ** 2 + 0.5 * ball2.m * ball2.vx ** 2;
      this.energyError = Math.abs(outgoingKineticEnergy - incomingKineticEnergy);
    }

    for (const ball of this.particles) {
      ball.trail.push({ x: ball.x, y: 0 });
      if (ball.trail.length > 100) ball.trail.shift();
    }
  }

  draw(engine) {
    const ctx = engine.ctx;
    const [ball1, ball2] = this.particles;
    const centerX = engine.width / 2;
    const centerY = engine.height * 0.58;
    const separation = Math.abs(ball2.x - ball1.x);
    const worldWidth = separation + ball1.r + ball2.r + 4;
    const pixelsPerMeter = Math.max(12, Math.min(60, (engine.width * 0.72) / worldWidth));
    const centerOfMass = (ball1.m * ball1.x + ball2.m * ball2.x) / (ball1.m + ball2.m);
    const toX = (x) => centerX + (x - centerOfMass) * pixelsPerMeter;
    const floorY = centerY + 36;

    this.drawTrack(ctx, engine.width, floorY);
    for (const ball of this.particles) {
      this.drawTrail(ctx, ball, toX, floorY, pixelsPerMeter);
    }

    for (const ball of this.particles) {
      const x = toX(ball.x);
      const radius = ball.r * pixelsPerMeter;
      this.drawSphere(ctx, ball, x, floorY, radius);
      this.drawVelocityVector(ctx, ball, x, floorY - radius - 18, pixelsPerMeter);
      this.drawBallLabel(ctx, ball, x, floorY + radius + 24);
    }

    const kineticEnergy = this.particles.reduce((sum, ball) => sum + 0.5 * ball.m * ball.vx ** 2, 0);
    engine.recordEnergy(kineticEnergy, 0);
  }

  drawTrack(ctx, width, floorY) {
    const trackGradient = ctx.createLinearGradient(0, floorY, 0, floorY + 54);
    trackGradient.addColorStop(0, '#64748b');
    trackGradient.addColorStop(0.18, '#334155');
    trackGradient.addColorStop(1, '#111827');

    ctx.save();
    ctx.fillStyle = trackGradient;
    ctx.fillRect(0, floorY, width, 54);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(0, floorY, width, 3);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    for (let x = 20; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, floorY + 8);
      ctx.lineTo(x - 12, floorY + 48);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTrail(ctx, ball, toX, floorY, pixelsPerMeter) {
    if (ball.trail.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < ball.trail.length; i++) {
      ctx.globalAlpha = 0.65 * (i / ball.trail.length) ** 2;
      ctx.strokeStyle = ball.color;
      ctx.lineWidth = Math.max(2, pixelsPerMeter * 0.06);
      ctx.beginPath();
      ctx.moveTo(toX(ball.trail[i - 1].x), floorY - 5);
      ctx.lineTo(toX(ball.trail[i].x), floorY - 5);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSphere(ctx, ball, x, floorY, radius) {
    const y = floorY - radius - 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x + radius * 0.12, floorY + 2, radius * 1.15, radius * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.42,
      radius * 0.08,
      x,
      y,
      radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.18, ball.color);
    gradient.addColorStop(1, this.shadeColor(ball.color));
    ctx.fillStyle = gradient;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  drawVelocityVector(ctx, ball, x, y, pixelsPerMeter) {
    const magnitude = Math.abs(ball.vx);
    if (magnitude < 0.05) return;

    const length = Math.min(150, 18 + magnitude * pixelsPerMeter * 0.45);
    const direction = Math.sign(ball.vx);
    const endX = x + direction * length;
    const color = ball.color;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    const head = 12;
    ctx.beginPath();
    ctx.moveTo(endX, y);
    ctx.lineTo(endX - direction * head, y - head * 0.65);
    ctx.lineTo(endX - direction * head, y + head * 0.65);
    ctx.closePath();
    ctx.fill();

    ctx.font = '600 15px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`v = ${ball.vx.toFixed(2)} m/s`, (x + endX) / 2, y - 12);
    ctx.restore();
  }

  drawBallLabel(ctx, ball, x, y) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 15px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`m = ${ball.m.toFixed(1)} kg`, x, y);
    ctx.restore();
  }

  shadeColor(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    const red = Math.floor(((value >> 16) & 255) * 0.48);
    const green = Math.floor(((value >> 8) & 255) * 0.48);
    const blue = Math.floor((value & 255) * 0.48);
    return `rgb(${red}, ${green}, ${blue})`;
  }
}
