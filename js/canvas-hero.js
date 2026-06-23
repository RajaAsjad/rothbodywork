/**
 * Organic flowing canvas background for hero banner
 */
(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles, animationId;
  let mouse = { x: -1000, y: -1000 };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const hero = canvas.parentElement;
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    initParticles();
  }

  function initParticles() {
    const count = prefersReducedMotion ? 20 : Math.min(60, Math.floor((width * height) / 18000));
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.35 + 0.1,
        hue: Math.random() > 0.5 ? 155 : 38
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Soft gradient wash — lighter so hero photo shows through
    const grad = ctx.createRadialGradient(
      width * 0.3, height * 0.4, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    grad.addColorStop(0, 'rgba(45, 90, 74, 0.18)');
    grad.addColorStop(0.5, 'rgba(30, 61, 50, 0.1)');
    grad.addColorStop(1, 'rgba(20, 35, 30, 0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Flowing wave lines
    const time = Date.now() * 0.0008;
    for (let w = 0; w < 4; w++) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(196, 165, 116, ${0.06 + w * 0.02})`;
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= width; x += 8) {
        const y = height * (0.3 + w * 0.15) +
          Math.sin(x * 0.008 + time + w) * 40 +
          Math.sin(x * 0.003 + time * 0.7) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Particles with connections
    particles.forEach((p, i) => {
      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          p.x -= dx * 0.002;
          p.y -= dy * 0.002;
        }

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 155
        ? `rgba(120, 180, 150, ${p.opacity})`
        : `rgba(196, 165, 116, ${p.opacity})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196, 165, 116, ${0.08 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onTouchMove(e) {
    if (e.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });

  resize();
  draw();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else draw();
  });
})();
