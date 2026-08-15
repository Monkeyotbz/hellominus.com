import { useEffect, useRef } from "react";

// Fondo de "universo" en canvas: estrellas que titilan y derivan, líneas de
// constelación entre partículas cercanas y estrellas fugaces ocasionales.
// Misma estética que KAIROS. Decorativo puro: pointer-events-none, aria-hidden,
// respeta prefers-reduced-motion (un solo frame estático) y pausa el loop
// cuando la pestaña queda oculta.

// Paleta alineada al theme (slate / blanco / neon-cyan / neon-violet)
const STAR_COLORS = [
  { rgb: "148, 163, 184", weight: 0.5 },
  { rgb: "226, 232, 240", weight: 0.22 },
  { rgb: "34, 211, 238", weight: 0.17 },
  { rgb: "167, 139, 250", weight: 0.11 },
];

const LINK_DISTANCE = 120; // px máx. para dibujar línea entre estrellas
const MOUSE_DISTANCE = 170; // px máx. para conectar estrellas al cursor

function pickColor() {
  let r = Math.random();
  for (const c of STAR_COLORS) {
    if (r < c.weight) return c.rgb;
    r -= c.weight;
  }
  return STAR_COLORS[0].rgb;
}

function createStar(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    // Deriva muy lenta, direcciones aleatorias
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    r: 0.4 + Math.random() * 1.3,
    color: pickColor(),
    baseAlpha: 0.35 + Math.random() * 0.5,
    twinkleSpeed: 0.4 + Math.random() * 1.1,
    twinklePhase: Math.random() * Math.PI * 2,
  };
}

function createMeteor(w, h) {
  const fromLeft = Math.random() < 0.5;
  const speed = 6 + Math.random() * 5;
  const angle = (25 + Math.random() * 20) * (Math.PI / 180);
  return {
    x: fromLeft ? -40 : Math.random() * w,
    y: fromLeft ? Math.random() * h * 0.5 : -40,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: 0.008 + Math.random() * 0.008,
  };
}

export default function UniverseBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let stars = [];
    let meteor = null;
    let nextMeteorAt = 0;
    let rafId = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Densidad proporcional al área, con techo para no castigar GPUs lentas
      const count = Math.min(150, Math.round((w * h) / 11000));
      stars = Array.from({ length: count }, () => createStar(w, h));
    }

    function drawFrame(time) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Líneas de constelación (entre estrellas y hacia el cursor)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i];
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const alpha = (1 - dist / LINK_DISTANCE) * 0.14;
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < MOUSE_DISTANCE) {
          const alpha = (1 - mdist / MOUSE_DISTANCE) * 0.25;
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Estrellas
      for (const s of stars) {
        const twinkle =
          0.65 + 0.35 * Math.sin(time * 0.001 * s.twinkleSpeed + s.twinklePhase);
        ctx.fillStyle = `rgba(${s.color}, ${s.baseAlpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        s.x += s.vx;
        s.y += s.vy;
        // Wrap en los bordes para que el campo nunca se vacíe
        if (s.x < -5) s.x = w + 5;
        else if (s.x > w + 5) s.x = -5;
        if (s.y < -5) s.y = h + 5;
        else if (s.y > h + 5) s.y = -5;
      }

      // Estrella fugaz ocasional
      if (!meteor && time > nextMeteorAt) {
        meteor = createMeteor(w, h);
      }
      if (meteor) {
        const tailX = meteor.x - meteor.vx * 8;
        const tailY = meteor.y - meteor.vy * 8;
        const grad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        grad.addColorStop(0, `rgba(226, 232, 240, ${0.8 * meteor.life})`);
        grad.addColorStop(1, "rgba(226, 232, 240, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= meteor.decay;
        if (meteor.life <= 0 || meteor.x > w + 60 || meteor.y > h + 60) {
          meteor = null;
          nextMeteorAt = time + 6000 + Math.random() * 9000;
        }
      }
    }

    function loop(time) {
      if (!running) return;
      drawFrame(time);
      rafId = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onVisibility() {
      running = !document.hidden && !reducedMotion;
      if (running) rafId = requestAnimationFrame(loop);
      else cancelAnimationFrame(rafId);
    }
    function onResize() {
      resize();
      if (reducedMotion) drawFrame(0);
    }

    resize();
    nextMeteorAt = 4000 + Math.random() * 6000;

    if (reducedMotion) {
      // Un solo frame estático: cielo estrellado sin animación
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(loop);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
