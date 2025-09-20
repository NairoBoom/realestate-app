import { useEffect, useRef } from "react";


export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; 
    startedRef.current = true;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let raf = 0;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width  = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Blob = {
      r: number; hue: number; sat: number; light: number;
      ampX: number; ampY: number; speed: number; phase: number; drift: number;
    };

    const N = 14;
    const blobs: Blob[] = Array.from({ length: N }, (_, i) => ({
      r: 220 + Math.random() * 300,
      hue: [278, 195, 155][i % 3],    
      sat: 75 + Math.random() * 20,
      light: 62 + Math.random() * 14,
      ampX: 0.25 + Math.random() * 0.30,
      ampY: 0.28 + Math.random() * 0.32,
      speed: 0.0020 + Math.random() * 0.0022, 
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() * 0.08 - 0.04),   
    }));

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const now = performance.now();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(8, 10, 18, 0.14)";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      for (const b of blobs) {
        const t = now * b.speed + b.phase * 1000;
        const px = (0.5 + Math.sin(t * 0.0012) * b.ampX) * W;
        const py = (0.5 + Math.cos(t * 0.0014) * b.ampY) * H;

        b.hue = (b.hue + b.drift) % 360;

        const g = ctx.createRadialGradient(px, py, 0, px, py, b.r);
        g.addColorStop(0.00, `hsla(${b.hue} ${b.sat}% ${b.light}% / 0.40)`);
        g.addColorStop(0.35, `hsla(${b.hue} ${b.sat}% ${Math.max(b.light - 10, 40)}% / 0.24)`);
        g.addColorStop(1.00, "hsla(0 0% 0% / 0)");
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.arc(px, py, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      startedRef.current = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        filter: "blur(26px) saturate(120%)",
        opacity: 0.95
      }}
    />
  );
}
