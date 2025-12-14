(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.style.display = "none";
    return;
  }

  const settings = {
    boids: 150,
    leaderRatio: 0.05, // ~5% pull directly to anchor
    viewRadius: 140,
    avoidRadius: 72,
    maxSpeed: 0.42,
    accelLeader: 0.015,
    accelFollower: 0.0065,
    alignStrength: 0.028,
    cohesionStrength: 0.01,
    separationStrength: 0.22,
    wanderStrength: 0.011,
  };

  let width = 0;
  let height = 0;
  let dpr = 1;

  let anchors = [];
  let anchorIndex = 0;
  let anchorStart = performance.now();

  const boids = [];

  function rebuildAnchors() {
    anchors = Array.from(document.querySelectorAll("[data-flock-target]"))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;
        const widthEmphasis = Math.min(1.15, Math.max(0.9, rect.width / (window.innerWidth * 0.6)));
        return { x: cx, y: cy, duration: 4300 + rect.height * 0.5, sizeBias: widthEmphasis };
      })
      .filter(Boolean);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildAnchors();
  }

  function initBoids() {
    boids.length = 0;
    for (let i = 0; i < settings.boids; i++) {
      boids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        depth: 0.65 + Math.random() * 0.55, // parallax-ish depth factor
        size: 0.7 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        leader: i < Math.max(1, Math.floor(settings.boids * settings.leaderRatio)),
        wander: Math.random() * Math.PI * 2,
        wanderAmp: 0.0045 + Math.random() * 0.01,
        anchorRadius: 40 + Math.random() * 80,
        anchorAngle: Math.random() * Math.PI * 2,
        anchorSpin: (Math.random() - 0.5) * 0.15,
      });
    }
  }

  function noise(x, y, t) {
    return Math.sin((x * 0.017 + y * 0.013 + t * 0.21)) * Math.sin((x * 0.011 - y * 0.019 + t * 0.37));
  }

  function currentAnchor(now) {
    if (!anchors.length) return { x: width / 2, y: height / 2, duration: 4500, sizeBias: 1 };
    const threshold = window.scrollY + window.innerHeight * 0.72;
    if (now - anchorStart > anchors[anchorIndex].duration) {
      anchorIndex = (anchorIndex + 1) % anchors.length;
      anchorStart = now;
    }
    const target = anchors[anchorIndex];
    // If target is below fold, stage just below viewport until user reaches it
    const isBelowFold = target.y > threshold;
    if (isBelowFold) {
      const stageY = window.scrollY + window.innerHeight - 80;
      return {
        x: width / 2,
        y: stageY,
        duration: target.duration,
        sizeBias: target.sizeBias,
      };
    }
    return target;
  }

  function step(now) {
    const t = now * 0.001;
    const targetBase = currentAnchor(now);
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const targetJitterX = Math.sin(t * 0.8) * 6 + Math.sin(t * 0.23) * 5;
    const targetJitterY = Math.cos(t * 0.6) * 6 + Math.sin(t * 0.31) * 5;
    const localX = targetBase.x - scrollX + targetJitterX;
    const localY = targetBase.y - scrollY + targetJitterY;
    const belowFold = localY > height * 0.85;
    let target = {
      x: belowFold ? width / 2 + Math.sin(t * 0.5) * 40 : localX,
      y: belowFold ? height + 480 : localY,
      sizeBias: targetBase.sizeBias || 1,
    };

    ctx.fillStyle = "rgba(5, 9, 18, 0.2)";
    ctx.fillRect(0, 0, width, height);

    const vr2 = settings.viewRadius * settings.viewRadius;
    const ar2 = settings.avoidRadius * settings.avoidRadius;

    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      let count = 0;
      let avgVx = 0;
      let avgVy = 0;
      let avgX = 0;
      let avgY = 0;
      let sepX = 0;
      let sepY = 0;

      for (let j = 0; j < boids.length; j++) {
        if (i === j) continue;
        const o = boids[j];
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < vr2) {
          count++;
          avgVx += o.vx;
          avgVy += o.vy;
          avgX += o.x;
          avgY += o.y;
          if (dist2 < ar2 && dist2 > 0.0001) {
            const inv = 1 / Math.sqrt(dist2);
            sepX -= dx * inv;
            sepY -= dy * inv;
          }
        }
      }

      if (count > 0) {
        avgVx /= count;
        avgVy /= count;
        avgX /= count;
        avgY /= count;

        b.vx += (avgVx - b.vx) * settings.alignStrength;
        b.vy += (avgVy - b.vy) * settings.alignStrength;

        b.vx += (avgX - b.x) * settings.cohesionStrength;
        b.vy += (avgY - b.y) * settings.cohesionStrength;

        b.vx += sepX * settings.separationStrength;
        b.vy += sepY * settings.separationStrength;
      }

      // attraction to target anchor with personal offset so they never form a perfect ring
      b.anchorAngle += b.anchorSpin * 0.01;
      const offsetX = Math.cos(b.anchorAngle) * b.anchorRadius;
      const offsetY = Math.sin(b.anchorAngle) * b.anchorRadius;
      const towardX = (target.x + offsetX) - b.x;
      const towardY = (target.y + offsetY) - b.y;

      // leaders pull to anchor, followers bias toward leaders/anchor lightly
      const accel = b.leader ? settings.accelLeader : settings.accelFollower;
      b.vx += towardX * accel * b.depth;
      b.vy += towardY * accel * b.depth;

      // followers also tug toward nearby leaders
      if (!b.leader && count > 0) {
        b.vx += (avgX - b.x) * 0.003;
        b.vy += (avgY - b.y) * 0.003;
      }

      // small ambient drift for organic motion + prevent perfect ring
      b.vx += Math.sin(t * 0.7 + b.phase * 1.3) * 0.0025;
      b.vy += Math.cos(t * 0.9 + b.phase * 0.9) * 0.0025;

      // wander / noise field to break symmetry
      b.wander += 0.04 + Math.random() * 0.02;
      const wanderAngle = b.wander + noise(b.x * 0.02, b.y * 0.02, t) * Math.PI * 0.6;
      b.vx += Math.cos(wanderAngle) * (settings.wanderStrength + b.wanderAmp);
      b.vy += Math.sin(wanderAngle) * (settings.wanderStrength + b.wanderAmp);

      // speed clamp
      const speed = Math.hypot(b.vx, b.vy);
      const maxSpeed = settings.maxSpeed * (0.7 + 0.6 * b.depth) * (b.leader ? 1.05 : 0.95);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        b.vx *= scale;
        b.vy *= scale;
      }

      b.x += b.vx;
      b.y += b.vy;

      // reposition softly if far off screen to avoid bouncing at edges
      if (b.x < -200 || b.x > width + 200 || b.y < -200 || b.y > height + 200) {
        const jitter = 60 + Math.random() * 120;
        b.x = target.x + (Math.random() - 0.5) * jitter;
        b.y = target.y + (Math.random() - 0.5) * jitter;
        b.vx *= 0.2;
        b.vy *= 0.2;
      }
    }

    // draw
    ctx.lineWidth = 1;
    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      const trailX = b.x - b.vx * 14;
      const trailY = b.y - b.vy * 14;
      const g = ctx.createLinearGradient(trailX, trailY, b.x, b.y);
      g.addColorStop(0, "rgba(92,223,223,0.0)");
      g.addColorStop(1, `rgba(92,223,223,${0.22 + 0.42 * b.depth})`);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      const pulse = 0.9 + 0.35 * Math.sin(t * 1.8 + b.phase);
      const radius = (b.size + pulse) * b.depth * (b.leader ? 1.2 : 0.9);
      ctx.fillStyle = `rgba(140,123,255,${0.2 + 0.35 * b.depth})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  initBoids();
  setTimeout(rebuildAnchors, 200);
  setTimeout(rebuildAnchors, 800);
  window.addEventListener("resize", () => {
    resize();
    initBoids();
  });
  window.addEventListener("scroll", () => {
    rebuildAnchors();
  }, { passive: true });
  requestAnimationFrame(step);
})();
