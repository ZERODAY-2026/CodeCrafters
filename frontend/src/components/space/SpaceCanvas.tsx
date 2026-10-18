import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface SpaceCanvasProps {
  showSatellite?: boolean;
}

export const SpaceCanvas: React.FC<SpaceCanvasProps> = ({ showSatellite = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, dpr = 1;
    let animId: number;
    let stars: any[] = [];
    const meteors: any[] = [];
    const sparks: any[] = [];
    const COLORS = ['255,255,255', '255,255,255', '190,208,255', '255,233,200', '200,240,225'];
    const LCOLORS = ['60,80,170', '60,80,170', '90,110,200', '170,110,40', '30,130,110'];

    const LAYERS = [
      { share: 0.55, r: [0.5, 0.9], a: [0.25, 0.6], depth: 10, drift: 2, push: 0 },
      { share: 0.33, r: [0.9, 1.4], a: [0.4, 0.85], depth: 26, drift: 5, push: 1 },
      { share: 0.12, r: [1.4, 2.2], a: [0.6, 1.0], depth: 56, drift: 9, push: 1 },
    ];

    const ptr = { x: 0, y: 0, sx: 0, sy: 0, active: false };
    const par = { x: 0, y: 0 };

    function rand(a: number, b: number) {
      return a + Math.random() * (b - a);
    }

    function resize() {
      if (!cv) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const total = Math.max(120, Math.min(520, Math.round((W * H) / 4200)));
      stars = [];
      LAYERS.forEach((L, li) => {
        const n = Math.round(total * L.share);
        for (let i = 0; i < n; i++) {
          stars.push({
            l: li,
            x: Math.random(),
            y: Math.random(),
            r: rand(L.r[0], L.r[1]),
            a: rand(L.a[0], L.a[1]),
            ph: rand(0, 6.28),
            sp: rand(0.6, 2.2),
            ci: (Math.random() * COLORS.length) | 0,
          });
        }
      });
      if (ptr.sx === 0 && ptr.sy === 0) {
        ptr.sx = ptr.x = W / 2;
        ptr.sy = ptr.y = H / 2;
      }
    }

    function wrap(v: number, m: number) {
      return ((v % m) + m) % m;
    }

    function spawnMeteor(o?: { big?: boolean; px?: number; py?: number }) {
      o = o || {};
      const big = o.big != null ? o.big : Math.random() < 0.18;
      const ang = (rand(18, 34) * Math.PI) / 180;
      const sp = (big ? 1500 : 1050) + rand(0, 450);
      const m = {
        vx: -Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        sp: sp,
        cos: Math.cos(ang),
        sin: Math.sin(ang),
        life: 0,
        max: (big ? 1.5 : 1.0) + rand(0, 0.5),
        len: (big ? 360 : 210) + rand(0, 120),
        w: big ? 2.8 : 1.7,
        big: big,
        tint: big ? '255,214,150' : Math.random() < 0.5 ? '190,215,255' : '200,255,230',
        ltint: big ? '205,110,30' : Math.random() < 0.5 ? '60,90,210' : '20,140,110',
        x: 0,
        y: 0,
      };

      if (o.px != null && o.py != null) {
        m.x = o.px + m.cos * sp * 0.45;
        m.y = o.py - m.sin * sp * 0.45;
      } else {
        m.x = W * rand(0.35, 1.0);
        m.y = rand(-20, H * 0.35);
      }
      meteors.push(m);
    }

    let nextMeteor = 1.4;
    function scheduleMeteors(_t: number, dt: number) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        spawnMeteor();
        if (Math.random() < 0.22) {
          setTimeout(() => spawnMeteor({ big: false }), 140);
        }
        nextMeteor = rand(2.2, 5.5);
      }
    }

    function drawStars(t: number, isLight: boolean) {
      if (!ctx) return;
      const R = 150;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const L = LAYERS[s.l];
        let x = wrap(s.x * W - par.x * L.depth - t * L.drift, W);
        let y = wrap(s.y * H - par.y * L.depth - t * L.drift * 0.25, H);
        let a = s.a * (0.72 + 0.28 * Math.sin(t * s.sp + s.ph));

        if (ptr.active && L.push) {
          const dx = x - ptr.sx;
          const dy = y - ptr.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R && d2 > 1) {
            const d = Math.sqrt(d2);
            const k = 1 - d / R;
            x += (dx / d) * k * k * 26;
            y += (dy / d) * k * k * 26;
            a = Math.min(1, a + k * 0.55);
          }
        }

        const col = (isLight ? LCOLORS : COLORS)[s.ci];
        ctx.fillStyle = `rgba(${col},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, 6.2832);
        ctx.fill();

        if (s.l === 2) {
          ctx.fillStyle = `rgba(${col},${(a * (isLight ? 0.09 : 0.14)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 3.6, 0, 6.2832);
          ctx.fill();
        }
      }
    }

    function drawGlow(isLight: boolean) {
      if (!ctx || !ptr.active) return;
      const g = ctx.createRadialGradient(ptr.sx, ptr.sy, 0, ptr.sx, ptr.sy, 230);
      g.addColorStop(0, isLight ? 'rgba(60,100,220,0.13)' : 'rgba(143,211,182,0.11)');
      g.addColorStop(0.5, isLight ? 'rgba(60,100,220,0.04)' : 'rgba(100,140,230,0.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(ptr.sx - 230, ptr.sy - 230, 460, 460);
    }

    function drawMeteors(dt: number, isLight: boolean) {
      if (!ctx) return;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.life > m.max || m.x < -m.len || m.y > H + m.len) {
          meteors.splice(i, 1);
          continue;
        }

        const a = Math.min(1, m.life / 0.12) * Math.min(1, (m.max - m.life) / 0.35);
        const tint = isLight ? m.ltint : m.tint;
        const headCol = isLight ? '30,50,140' : '255,255,255';
        const tx = m.x + m.cos * m.len;
        const ty = m.y - m.sin * m.len;

        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(${headCol},${a.toFixed(3)})`);
        g.addColorStop(0.18, `rgba(${tint},${(a * 0.65).toFixed(3)})`);
        g.addColorStop(1, `rgba(${tint},0)`);

        ctx.lineCap = 'round';
        ctx.strokeStyle = g;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = m.w * 5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.lineWidth = m.w;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        const fr = m.big ? 18 : 11;
        const h = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, fr);
        h.addColorStop(0, `rgba(${headCol},${a.toFixed(3)})`);
        h.addColorStop(0.4, `rgba(${tint},${(a * 0.45).toFixed(3)})`);
        h.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = h;
        ctx.fillRect(m.x - fr, m.y - fr, fr * 2, fr * 2);

        if (m.big && Math.random() < 0.9) {
          sparks.push({
            x: m.x,
            y: m.y,
            vx: rand(-40, 140),
            vy: rand(-60, 90),
            life: 0,
            max: rand(0.4, 0.9),
            tint: tint,
          });
        }
      }

      for (let j = sparks.length - 1; j >= 0; j--) {
        const p = sparks[j];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 60 * dt;
        if (p.life > p.max) {
          sparks.splice(j, 1);
          continue;
        }
        const pa = 1 - p.life / p.max;
        ctx.fillStyle = `rgba(${p.tint},${(pa * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 * pa + 0.3, 0, 6.2832);
        ctx.fill();
      }
    }

    let last = 0, t0 = 0;
    function frame(ms: number) {
      if (!ctx) return;
      if (!t0) {
        t0 = ms;
        last = ms;
      }
      const t = (ms - t0) / 1000;
      const dt = Math.min(0.05, (ms - last) / 1000);
      last = ms;

      let tx: number, ty: number;
      if (ptr.active) {
        tx = (ptr.x / W - 0.5) * 2;
        ty = (ptr.y / H - 0.5) * 2;
      } else {
        tx = Math.sin(t * 0.13) * 0.6;
        ty = Math.cos(t * 0.1) * 0.4;
      }
      const k = 1 - Math.exp(-dt * 4.5);
      par.x += (tx - par.x) * k;
      par.y += (ty - par.y) * k;

      const kp = 1 - Math.exp(-dt * 12);
      ptr.sx += (ptr.x - ptr.sx) * kp;
      ptr.sy += (ptr.y - ptr.sy) * kp;

      ctx.clearRect(0, 0, W, H);
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'lighter';
      drawGlow(isLightMode);
      drawStars(t, isLightMode);
      scheduleMeteors(t, dt);
      drawMeteors(dt, isLightMode);
      ctx.globalCompositeOperation = 'source-over';
      animId = requestAnimationFrame(frame);
    }

    const onPointerMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.active = true;
    };

    const onMouseLeave = () => {
      ptr.active = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reduce) return;
      spawnMeteor({ big: true, px: e.clientX, py: e.clientY });
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    resize();

    if (reduce) {
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.clearRect(0, 0, W, H);
      drawStars(0, isLightMode);
    } else {
      animId = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [theme]);

  return (
    <>
      <canvas id="space-canvas" ref={canvasRef} aria-hidden="true" />
      {showSatellite && (
        <>
          {/* Drifting Satellite */}
          <svg
            className="sat"
            width="72"
            height="44"
            viewBox="0 0 72 44"
            fill="none"
            aria-hidden="true"
          >
            <rect x="1" y="14" width="23" height="16" rx="1" fill="#1D3A7A" stroke="#6F93E6" strokeWidth="1" />
            <path d="M9 14v16M17 14v16M1 22h23" stroke="#6F93E6" strokeWidth="0.7" />
            <rect x="48" y="14" width="23" height="16" rx="1" fill="#1D3A7A" stroke="#6F93E6" strokeWidth="1" />
            <path d="M56 14v16M64 14v16M48 22h23" stroke="#6F93E6" strokeWidth="0.7" />
            <path d="M24 22h4M44 22h4" stroke="#9CA3AF" strokeWidth="1.5" />
            <rect x="28" y="12" width="16" height="20" rx="3" fill="#B8BEC8" stroke="#E3E6EB" strokeWidth="1" />
            <circle cx="36" cy="22" r="3.2" fill="#0B0C0E" stroke="#8FD3B6" strokeWidth="1" />
            <path d="M36 12V5M33 5h6" stroke="#9CA3AF" strokeWidth="1.2" />
            <circle cx="36" cy="3.6" r="1.4" fill="#E8B86D" />
          </svg>
          {/* Shooting Star */}
          <div className="shoot" aria-hidden="true" />
        </>
      )}
    </>
  );
};
