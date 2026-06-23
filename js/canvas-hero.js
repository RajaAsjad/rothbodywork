/**
 * Advanced canvas hero — image + aurora mesh + particle field
 */
(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const heroImg = new Image();
  heroImg.src = 'assets/hero-bg.jpg';

  let width, height, particles, blobs, animationId, time = 0;
  let mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let imgReady = false;
  let imgPan = 0;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  heroImg.onload = () => { imgReady = true; };

  function resize() {
    const hero = canvas.parentElement;
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
    initBlobs();
  }

  function initParticles() {
    const count = prefersReducedMotion ? 25 : Math.min(90, Math.floor((width * height) / 12000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        a: Math.random() * 0.45 + 0.15,
        gold: Math.random() > 0.45
      });
    }
  }

  function initBlobs() {
    blobs = [
      { x: 0.25, y: 0.35, r: 0.35, hue: 155, speed: 0.0004, phase: 0 },
      { x: 0.75, y: 0.55, r: 0.3, hue: 38, speed: 0.00035, phase: 2 },
      { x: 0.5, y: 0.75, r: 0.28, hue: 165, speed: 0.0003, phase: 4 }
    ];
  }

  function drawHeroImage() {
    if (!imgReady) return;

    const iw = heroImg.naturalWidth;
    const ih = heroImg.naturalHeight;
    const scale = Math.max(width / iw, height / ih) * (prefersReducedMotion ? 1.08 : 1.08 + Math.sin(imgPan) * 0.04);
    const sw = iw * scale;
    const sh = ih * scale;
    const ox = (width - sw) / 2 + (mouse.tx - 0.5) * 30;
    const oy = (height - sh) / 2 + (mouse.ty - 0.5) * 20;

    ctx.drawImage(heroImg, ox, oy, sw, sh);

    if (!prefersReducedMotion) imgPan += 0.003;
  }

  function drawAurora() {
    blobs.forEach((b, i) => {
      const t = time * b.speed + b.phase;
      const cx = (b.x + Math.sin(t) * 0.08 + (mouse.tx - 0.5) * 0.06) * width;
      const cy = (b.y + Math.cos(t * 0.8) * 0.06 + (mouse.ty - 0.5) * 0.05) * height;
      const radius = b.r * Math.max(width, height);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      if (b.hue === 38) {
        g.addColorStop(0, 'rgba(196, 165, 116, 0.22)');
        g.addColorStop(0.5, 'rgba(196, 165, 116, 0.08)');
        g.addColorStop(1, 'rgba(196, 165, 116, 0)');
      } else {
        g.addColorStop(0, 'rgba(72, 140, 110, 0.28)');
        g.addColorStop(0.5, 'rgba(45, 90, 74, 0.12)');
        g.addColorStop(1, 'rgba(45, 90, 74, 0)');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function drawWaves() {
    const t = time * 0.001;
    for (let w = 0; w < 5; w++) {
      ctx.beginPath();
      const alpha = 0.04 + w * 0.015;
      ctx.strokeStyle = w % 2 === 0
        ? `rgba(196, 165, 116, ${alpha})`
        : `rgba(140, 200, 170, ${alpha})`;
      ctx.lineWidth = 1.2 + w * 0.3;
      for (let x = 0; x <= width + 10; x += 6) {
        const y = height * (0.25 + w * 0.12) +
          Math.sin(x * 0.006 + t + w * 1.2) * 35 +
          Math.cos(x * 0.002 + t * 0.6) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawParticles() {
    const mx = mouse.tx * width;
    const my = mouse.ty * height;

    particles.forEach((p, i) => {
      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 1) {
          p.x -= dx * 0.0015;
          p.y -= dy * 0.0015;
        }
        if (p.x < -10 || p.x > width + 10) p.vx *= -1;
        if (p.y < -10 || p.y > height + 10) p.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(232, 213, 181, ${p.a})`
        : `rgba(130, 200, 165, ${p.a})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196, 165, 116, ${0.12 * (1 - d / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(
      width * 0.5, height * 0.45, height * 0.1,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.75
    );
    g.addColorStop(0, 'rgba(20, 35, 30, 0)');
    g.addColorStop(0.6, 'rgba(20, 35, 30, 0.35)');
    g.addColorStop(1, 'rgba(15, 28, 24, 0.75)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.35);
    topGrad.addColorStop(0, 'rgba(20, 35, 30, 0.55)');
    topGrad.addColorStop(1, 'rgba(20, 35, 30, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, width, height * 0.35);
  }

  function drawGrain() {
    if (prefersReducedMotion) return;
    ctx.save();
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
  }

  function draw() {
    time++;
    mouse.tx += (mouse.x - mouse.tx) * 0.06;
    mouse.ty += (mouse.y - mouse.ty) * 0.06;

    ctx.clearRect(0, 0, width, height);
    drawHeroImage();
    drawAurora();
    drawWaves();
    drawParticles();
    drawVignette();
    drawGrain();

    animationId = requestAnimationFrame(draw);
  }

  function setMouse(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (clientX - rect.left) / rect.width;
    mouse.y = (clientY - rect.top) / rect.height;
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY));
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  resize();
  draw();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else draw();
  });
})();
