/**
 * Simulación 7: Leyes de Newton (Dinámica, Plano Inclinado y Máquina de Atwood)
 */
class NewtonSimulation {
  constructor() {
    this.name = "Leyes de Newton";
    
    this.mode = 'incline'; // 'incline', 'atwood', 'inertia'
    
    // Parámetros plano inclinado / 2da Ley F = m*a
    this.mass = 5.0; // kg
    this.angle = 30; // grados
    this.mu = 0.15;  // Coeficiente de fricción μk
    this.gravity = 9.81; // m/s²
    this.appliedForce = 0; // N (Fuerza aplicada externa)
    
    // Parámetros máquina de atwood
    this.m1 = 6.0; // kg
    this.m2 = 3.0; // kg
    
    this.reset();
  }
  
  reset() {
    // Posición inicial en el plano inclinado (distancia s a lo largo del plano)
    this.s = 2.0; // m
    this.v = 0;   // m/s
    this.a = 0;   // m/s²
    
    // Posiciones máquina de Atwood
    this.y1 = 10;
    this.y2 = 10;
    this.vy1 = 0;
    this.vy2 = 0;
  }
  
  update(dt) {
    if (this.mode === 'incline') {
      const rad = (this.angle * Math.PI) / 180;
      
      // Componentes de gravedad
      const Fg_par = this.mass * this.gravity * Math.sin(rad); // Paralela al plano (hacia abajo)
      const Fg_perp = this.mass * this.gravity * Math.cos(rad); // Normal N
      
      // Normal N
      const N = Fg_perp;
      
      // Fuerza de fricción f_k = μ * N
      const fk_max = this.mu * N;
      
      // Fuerza neta a lo largo del plano (hacia abajo del plano)
      let Fnet = Fg_par - this.appliedForce;
      let fk = 0;
      
      if (Math.abs(this.v) > 0.001) {
        // Si hay movimiento, la fricción se opone a la velocidad
        fk = Math.sign(this.v) * fk_max;
        Fnet -= fk;
      } else {
        // Estático
        if (Math.abs(Fnet) > fk_max) {
          Fnet -= Math.sign(Fnet) * fk_max;
        } else {
          Fnet = 0; // Se mantiene en reposo (1ra Ley)
        }
      }
      
      this.a = Fnet / this.mass;
      this.v += this.a * dt;
      this.s += this.v * dt;
      
      // Límites del plano
      if (this.s < 0) { this.s = 0; this.v = 0; }
      if (this.s > 25) { this.s = 25; this.v = 0; }
      
    } else if (this.mode === 'atwood') {
      // Aceleración de la máquina de Atwood a = g * (m1 - m2) / (m1 + m2)
      const accel = this.gravity * (this.m1 - this.m2) / (this.m1 + this.m2);
      this.vy1 += accel * dt;
      this.vy2 -= accel * dt;
      
      this.y1 -= this.vy1 * dt;
      this.y2 -= this.vy2 * dt;
      
      if (this.y1 < 2) { this.y1 = 2; this.vy1 = 0; }
      if (this.y2 < 2) { this.y2 = 2; this.vy2 = 0; }
      if (this.y1 > 18) { this.y1 = 18; this.vy1 = 0; }
      if (this.y2 > 18) { this.y2 = 18; this.vy2 = 0; }
    }
  }
  
  draw(engine) {
    const ctx = engine.ctx;
    
    if (this.mode === 'incline') {
      this.drawInclineMode(engine);
    } else if (this.mode === 'atwood') {
      this.drawAtwoodMode(engine);
    }
    
    // Telemetría de Energía
    const ek = 0.5 * this.mass * this.v * this.v;
    const ep = this.mass * this.gravity * (this.s * Math.sin((this.angle * Math.PI) / 180));
    engine.recordEnergy(ek, ep);
  }
  
  drawInclineMode(engine) {
    const ctx = engine.ctx;
    const rad = (this.angle * Math.PI) / 180;
    
    // Coordenadas base de la rampa
    const rampLength = 28; // metros en plano
    const originX = 5;
    const originY = 3;
    
    const pBaseX = engine.toScreenX(originX);
    const pBaseY = engine.toScreenY(originY);
    const pTopX = engine.toScreenX(originX + rampLength * Math.cos(rad));
    const pTopY = engine.toScreenY(originY + rampLength * Math.sin(rad));
    const pBottomCornerX = pTopX;
    const pBottomCornerY = pBaseY;
    
    // Dibujar Triángulo de Rampa
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pBaseX, pBaseY);
    ctx.lineTo(pTopX, pTopY);
    ctx.lineTo(pBottomCornerX, pBottomCornerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Dibujar Ángulo θ
    ctx.fillStyle = '#00f3ff';
    ctx.font = '13px Space Grotesk';
    ctx.fillText(`θ = ${this.angle}°`, pBaseX + 45, pBaseY - 10);
    
    // Posición del bloque en la rampa
    const blockDist = this.s;
    const blockX = originX + blockDist * Math.cos(rad);
    const blockY = originY + blockDist * Math.sin(rad);
    
    const pBlockX = engine.toScreenX(blockX);
    const pBlockY = engine.toScreenY(blockY);
    
    // Bloque rotado en el plano
    const blockW = 40;
    const blockH = 26;
    
    ctx.save();
    ctx.translate(pBlockX, pBlockY);
    ctx.rotate(-rad);
    ctx.fillStyle = '#ff6b35';
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = 12;
    ctx.fillRect(-blockW / 2, -blockH, blockW, blockH);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.mass}kg`, 0, -blockH / 2 + 4);
    ctx.restore();
    
    // Diagrama de Cuerpo Libre (DCL Vectors)
    if (engine.showVectors) {
      // Normal N (Perpendicular al plano)
      const N_mag = this.mass * this.gravity * Math.cos(rad);
      engine.drawVector(blockX, blockY, -N_mag * Math.sin(rad) * 0.1, N_mag * Math.cos(rad) * 0.1, '#00ff9d', 'N', 1.0);
      
      // Peso W = m*g (Hacia abajo vertical)
      engine.drawVector(blockX, blockY, 0, -this.mass * this.gravity * 0.1, '#9d4edd', 'W=mg', 1.0);
      
      // Aceleración neta a lo largo del plano
      if (Math.abs(this.a) > 0.01) {
        engine.drawVector(blockX, blockY, -this.a * Math.cos(rad) * 0.3, -this.a * Math.sin(rad) * 0.3, '#00f3ff', 'a', 1.0);
      }
    }
    
    ctx.restore();
  }
  
  drawAtwoodMode(engine) {
    const ctx = engine.ctx;
    
    const pulleyX = engine.width / 2;
    const pulleyY = 100;
    const radius = 24;
    
    // Polea
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(pulleyX, pulleyY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Cuerdas
    const p1X = pulleyX - radius;
    const p1Y = pulleyY + this.y1 * engine.scale;
    const p2X = pulleyX + radius;
    const p2Y = pulleyY + this.y2 * engine.scale;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1X, pulleyY);
    ctx.lineTo(p1X, p1Y);
    ctx.moveTo(p2X, pulleyY);
    ctx.lineTo(p2X, p2Y);
    ctx.stroke();
    
    // Masa 1
    ctx.fillStyle = '#00ff9d';
    ctx.fillRect(p1X - 20, p1Y, 40, 40);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Space Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(`m₁=${this.m1}kg`, p1X, p1Y + 24);
    
    // Masa 2
    ctx.fillStyle = '#9d4edd';
    ctx.fillRect(p2X - 20, p2Y, 40, 40);
    ctx.fillStyle = '#000';
    ctx.fillText(`m₂=${this.m2}kg`, p2X, p2Y + 24);
    
    ctx.restore();
  }
}
