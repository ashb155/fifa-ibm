import { useEffect, useRef } from "react";

/**
 * SoccerBall — a classic black & white panelled football rendered with
 * particles on a unit sphere. Sits on the right side of its container,
 * rotates slowly, parallax-tilts to the cursor, and only begins to
 * shatter outward after the user has scrolled past a delay threshold.
 */
export function SoccerBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // anchor to the right side, vertically centered
      const isWide = w > 760;
      cx = isWide ? w * 0.74 : w * 0.5;
      cy = h * 0.5;
      radius = Math.min(w * (isWide ? 0.22 : 0.34), h * 0.36);
    };
    resize();
    window.addEventListener("resize", resize);

    // Truncated icosahedron centers — 12 pentagons + 20 hexagons.
    // We seed pentagon centers on an icosahedron, hex centers on a dodecahedron.
    const PHI = (1 + Math.sqrt(5)) / 2;
    const norm = (v: number[]) => {
      const l = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / l, v[1] / l, v[2] / l] as [number, number, number];
    };

    const icoVerts: [number, number, number][] = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ].map(norm);

    const dodecaVerts: [number, number, number][] = (() => {
      const t = 1 / PHI;
      const raw: [number, number, number][] = [];
      const s = [-1, 1];
      for (const a of s) for (const b of s) for (const c of s) raw.push([a, b, c]);
      for (const a of s) for (const b of s) {
        raw.push([0, a * t, b * PHI]);
        raw.push([a * t, b * PHI, 0]);
        raw.push([a * PHI, 0, b * t]);
      }
      return raw.map(norm);
    })();

    const angle = (a: [number, number, number], b: [number, number, number]) =>
      Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

    // Fibonacci sphere distribution
    const N = 1400;
    type P = {
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      panel: 0 | 1; // 0 white, 1 black
      size: number;
    };
    const particles: P[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));

    // panel radius (geodesic) — small enough to read as pentagons
    const PENT_R = 0.36;
    const HEX_R = 0.30;

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const pos: [number, number, number] = [x, y, z];

      let inPent = false;
      for (const v of icoVerts) {
        if (angle(pos, v) < PENT_R) { inPent = true; break; }
      }

      // Mostly white, with black pentagon caps and thin hex edges
      let panel: 0 | 1 = 0;
      if (inPent) {
        panel = 1;
      } else {
        // mark thin seams between hex centers as edges (slightly darker via density)
        let nearestHex = Infinity;
        for (const v of dodecaVerts) {
          const a = angle(pos, v);
          if (a < nearestHex) nearestHex = a;
        }
        // ring just inside hex boundary = stitch lines
        panel = nearestHex > HEX_R * 1.05 && nearestHex < HEX_R * 1.18 ? 1 : 0;
      }

      particles.push({
        x, y, z,
        vx: x, vy: y, vz: z,
        panel,
        size: 1.05 + Math.random() * 0.9,
      });
    }

    let rotY = 0;
    let rotX = -0.4;
    const mouse = { x: 0, y: 0, active: false };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left - cx;
      const localY = e.clientY - rect.top - cy;
      mouse.x = localX / Math.max(1, cx);
      mouse.y = localY / Math.max(1, cy);
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    // explosion starts immediately and completes at 60% of viewport height
    let scrollProgress = 0;
    const onScroll = () => {
      const start = 0;
      const end = Math.max(100, window.innerHeight * 1.5);
      const y = window.scrollY;
      const p = y / end;
      scrollProgress = Math.min(1, Math.max(0, p));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      rotY += 0.0028;
      if (mouse.active) {
        rotX += (-0.4 + mouse.y * 0.35 - rotX) * 0.04;
      } else {
        rotX += (-0.3 - rotX) * 0.02;
      }

      const burst = easeOutCubic(scrollProgress);
      const fade = 1 - burst * 0.95;
      const explodeDist = burst * radius * 4.2;
      const ballScale = 1 + burst * 0.1;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      type Pt = { sx: number; sy: number; depth: number; size: number; alpha: number; panel: 0 | 1 };
      const points: Pt[] = [];

      for (const p of particles) {
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        let y1 = p.y * cosX - z1 * sinX;
        z1 = p.y * sinX + z1 * cosX;

        let dx = p.vx * cosY - p.vz * sinY;
        let dz1 = p.vx * sinY + p.vz * cosY;
        let dy = p.vy * cosX - dz1 * sinX;
        dz1 = p.vy * sinX + dz1 * cosX;

        const ex = x1 * radius * ballScale + dx * explodeDist;
        const ey = y1 * radius * ballScale + dy * explodeDist;
        const ez = z1 * radius * ballScale + dz1 * explodeDist;

        const persp = 600 / Math.max(50, 600 - ez);
        const sx = cx + ex * persp;
        const sy = cy + ey * persp;

        const depth = (z1 + 1) / 2;
        const alpha = fade * (0.45 + depth * 0.55);
        if (alpha < 0.02) continue;

        const rawSize = p.size * persp * (1 - burst * 0.35);
        const size = Math.max(0.3, rawSize);

        points.push({ sx, sy, depth, size, alpha, panel: p.panel });
      }

      points.sort((a, b) => a.depth - b.depth);

      for (const pt of points) {
        const lit = pt.depth;
        if (pt.panel === 1) {
          // black panels & stitch
          const v = Math.round(12 + lit * 18);
          ctx.fillStyle = `rgba(${v},${v},${v + 2},${pt.alpha})`;
        } else {
          // white panels with subtle warm rim light
          const base = Math.round(225 + lit * 25);
          const r = base;
          const g = Math.round(base * 0.99);
          const b = Math.round(base * 0.96);
          ctx.fillStyle = `rgba(${r},${g},${b},${pt.alpha})`;
        }
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
