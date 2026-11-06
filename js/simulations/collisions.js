/**
 * Choque elastico unidimensional entre dos vehiculos.
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
    const equalMasses = Math.abs(this.mass1 - this.mass2) < 1e-6;
    this.particles = [
      {
        x: -5.5,
        vx: this.velocity1,
        m: this.mass1,
        type: 'car',
        color: '#e53935',
        trail: []
      },
      {
        x: 5.5,
        vx: this.velocity2,
        m: this.mass2,
        type: equalMasses ? 'car' : 'motorcycle',
        color: equalMasses ? '#2563eb' : '#f59e0b',
        trail: []
      }
    ];
    this.collided = false;
    this.momentumBeforeCollision = null;
    this.momentumAfterCollision = null;
  }

  halfLength(vehicle) {
    return vehicle.type === 'motorcycle' ? 0.9 : 1.6;
  }

  update(dt) {
    const [ball1, ball2] = this.particles;
    ball1.x += ball1.vx * dt;
    ball2.x += ball2.vx * dt;

    const separation = ball2.x - ball1.x;
    const collisionDistance = this.halfLength(ball1) + this.halfLength(ball2);

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
    const initialScale = Math.max(18, Math.min(54, (engine.width * 0.48) / 16));
    const centerOfMass = (ball1.m * ball1.x + ball2.m * ball2.x) / (ball1.m + ball2.m);
    const furthestExtent = Math.max(
      Math.abs(ball1.x - centerOfMass) + this.halfLength(ball1),
      Math.abs(ball2.x - centerOfMass) + this.halfLength(ball2)
    );
    const requiredWidth = furthestExtent * 2 + 2;
    const pixelsPerMeter = this.collided
      ? Math.max(8, Math.min(initialScale, (engine.width * 0.82) / requiredWidth))
      : initialScale;
    const toX = (x) => centerX + (x - centerOfMass) * pixelsPerMeter;
    const floorY = centerY + 36;

    this.drawTrack(ctx, engine.width, floorY);
    for (const ball of this.particles) {
      this.drawTrail(ctx, ball, toX, floorY, pixelsPerMeter);
    }

    for (const ball of this.particles) {
      const x = toX(ball.x);
      const facing = ball.vx === 0 ? (ball === ball1 ? 1 : -1) : Math.sign(ball.vx);
      this.drawVehicle(ctx, ball, x, floorY, pixelsPerMeter, facing);
      this.drawVelocityVector(ctx, ball, x, floorY - pixelsPerMeter * 1.7 - 24, pixelsPerMeter);
      const labelOffset = ball.type === 'motorcycle' ? 1.95 : 1.15;
      this.drawMassBadge(ctx, ball, x, floorY - pixelsPerMeter * labelOffset);
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

  drawVehicle(ctx, vehicle, x, floorY, scale, facing) {
    if (vehicle.type === 'motorcycle') {
      this.drawMotorcycle(ctx, vehicle, x, floorY, scale, facing);
    } else {
      this.drawCar(ctx, vehicle, x, floorY, scale, facing);
    }
  }

  drawCar(ctx, car, x, floorY, scale, facing) {
    const length = 3.2 * scale;
    const wheelRadius = 0.27 * scale;
    const bodyY = floorY - 0.92 * scale;
    const bodyHeight = 0.56 * scale;
    const wheelOffset = 0.92 * scale;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x, floorY + 3, length * 0.56, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(x, 0);
    ctx.scale(facing, 1);
    const paint = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyHeight);
    paint.addColorStop(0, '#ff817d');
    paint.addColorStop(0.22, car.color);
    paint.addColorStop(1, this.shadeColor(car.color));
    ctx.fillStyle = paint;
    ctx.shadowColor = car.color;
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.moveTo(-length / 2, bodyY + bodyHeight * 0.88);
    ctx.lineTo(-length / 2 + 4, bodyY + bodyHeight * 0.58);
    ctx.lineTo(-length * 0.25, bodyY + bodyHeight * 0.46);
    ctx.lineTo(-length * 0.03, bodyY + bodyHeight * 0.08);
    ctx.quadraticCurveTo(length * 0.04, bodyY - bodyHeight * 0.08, length * 0.23, bodyY - bodyHeight * 0.08);
    ctx.quadraticCurveTo(length * 0.45, bodyY - bodyHeight * 0.08, length * 0.48, bodyY + bodyHeight * 0.38);
    ctx.lineTo(length / 2, bodyY + bodyHeight * 0.68);
    ctx.lineTo(length / 2, bodyY + bodyHeight);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(8, 20, 32, 0.88)';
    ctx.beginPath();
    ctx.moveTo(-length * 0.18, bodyY + bodyHeight * 0.42);
    ctx.lineTo(-length * 0.02, bodyY + bodyHeight * 0.04);
    ctx.quadraticCurveTo(length * 0.01, bodyY + bodyHeight * 0.01, length * 0.12, bodyY + bodyHeight * 0.03);
    ctx.lineTo(length * 0.1, bodyY + bodyHeight * 0.42);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(length * 0.16, bodyY + bodyHeight * 0.03);
    ctx.quadraticCurveTo(length * 0.39, bodyY + bodyHeight * 0.02, length * 0.43, bodyY + bodyHeight * 0.42);
    ctx.lineTo(length * 0.15, bodyY + bodyHeight * 0.42);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(length * 0.12, bodyY + bodyHeight * 0.48);
    ctx.lineTo(length * 0.12, bodyY + bodyHeight * 0.92);
    ctx.moveTo(length * 0.15, bodyY + bodyHeight * 0.73);
    ctx.lineTo(length * 0.28, bodyY + bodyHeight * 0.73);
    ctx.stroke();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(-length * 0.2, bodyY + bodyHeight * 0.47, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    for (const wheelX of [-wheelOffset, wheelOffset]) {
      ctx.beginPath();
      ctx.arc(wheelX, floorY - wheelRadius, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(wheelX, floorY - wheelRadius, wheelRadius * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
    }

    ctx.fillStyle = '#fff7cc';
    ctx.beginPath();
    ctx.ellipse(length / 2 - 3, bodyY + bodyHeight * 0.68, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-length / 2 + 2, bodyY + bodyHeight * 0.64, 5, 6);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-length / 2 - 3, bodyY + bodyHeight * 0.91, length + 6, 6);
    ctx.restore();

  }

  drawMotorcycle(ctx, motorcycle, x, floorY, scale, facing) {
    const wheelRadius = 0.27 * scale;
    const wheelOffset = 0.77 * scale;
    const seatY = floorY - 0.92 * scale;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x, floorY + 3, scale * 1.05, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(x, 0);
    ctx.scale(facing, 1);

    ctx.fillStyle = '#111827';
    for (const wheelX of [-wheelOffset, wheelOffset]) {
      ctx.beginPath();
      ctx.arc(wheelX, floorY - wheelRadius, wheelRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(wheelX, floorY - wheelRadius, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
    }

    ctx.strokeStyle = motorcycle.color;
    ctx.lineWidth = Math.max(5, scale * 0.12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-wheelOffset, floorY - wheelRadius);
    ctx.lineTo(-scale * 0.15, seatY + scale * 0.26);
    ctx.lineTo(wheelOffset * 0.65, floorY - wheelRadius);
    ctx.lineTo(wheelOffset * 0.25, seatY + scale * 0.12);
    ctx.lineTo(-wheelOffset, floorY - wheelRadius);
    ctx.stroke();

    const tank = ctx.createLinearGradient(0, seatY, 0, seatY + scale * 0.4);
    tank.addColorStop(0, '#fff');
    tank.addColorStop(0.25, motorcycle.color);
    tank.addColorStop(1, this.shadeColor(motorcycle.color));
    ctx.fillStyle = tank;
    ctx.beginPath();
    ctx.ellipse(scale * 0.12, seatY + scale * 0.22, scale * 0.36, scale * 0.2, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(-scale * 0.42, seatY - scale * 0.02, scale * 0.55, scale * 0.12, 5);
    ctx.fill();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wheelOffset * 0.65, floorY - wheelRadius);
    ctx.lineTo(wheelOffset * 0.82, seatY - scale * 0.12);
    ctx.lineTo(wheelOffset * 0.98, seatY - scale * 0.14);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-scale * 0.24, seatY - scale * 0.06);
    ctx.lineTo(-scale * 0.02, seatY - scale * 0.53);
    ctx.lineTo(scale * 0.32, seatY - scale * 0.12);
    ctx.lineTo(scale * 0.18, seatY + scale * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-scale * 0.02, seatY - scale * 0.63, scale * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff7cc';
    ctx.beginPath();
    ctx.arc(wheelOffset, seatY - scale * 0.12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  }

  drawMassBadge(ctx, vehicle, x, y) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 14px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${vehicle.type === 'car' ? 'Carrito' : 'Motocicleta'} · ${vehicle.m.toFixed(1)} kg`, x, y);
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

  shadeColor(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    const red = Math.floor(((value >> 16) & 255) * 0.48);
    const green = Math.floor(((value >> 8) & 255) * 0.48);
    const blue = Math.floor((value & 255) * 0.48);
    return `rgb(${red}, ${green}, ${blue})`;
  }
}
