export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'dot' | 'ghost' | 'powerPellet' | 'score';
  value?: number; // For score particles
}

export class ParticleSystem {
  private particles: Particle[] = [];

  update(deltaTime: number) {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime * 0.001;
      particle.y += particle.vy * deltaTime * 0.001;
      particle.life -= deltaTime;
      
      // Apply gravity for some particle types
      if (particle.type === 'score') {
        particle.vy += 50 * deltaTime * 0.001; // Gravity
      }
      
      return particle.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      
      switch (particle.type) {
        case 'dot':
          ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'ghost':
          ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'powerPellet':
          ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          // Add sparkle effect
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        case 'score':
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`+${particle.value}`, particle.x, particle.y);
          break;
      }
      
      ctx.restore();
    });
  }

  addDotParticles(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 300,
        maxLife: 300,
        color: '#FFFF00',
        size: 2,
        type: 'dot'
      });
    }
  }

  addPowerPelletParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 500,
        maxLife: 500,
        color: '#FFFF00',
        size: 3 + Math.random() * 2,
        type: 'powerPellet'
      });
    }
  }

  addGhostParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        life: 400,
        maxLife: 400,
        color: color,
        size: 2 + Math.random() * 3,
        type: 'ghost'
      });
    }
  }

  addScoreParticle(x: number, y: number, score: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -50, // Float upward
      life: 1000,
      maxLife: 1000,
      color: '#FFFFFF',
      size: 12,
      type: 'score',
      value: score
    });
  }

  clear() {
    this.particles = [];
  }
}
