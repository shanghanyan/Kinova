'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

const LINKS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
];

export function PoseSkeleton({ points, color = '#38bdf8' }: { points: Point[]; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    LINKS.forEach(([a, b]) => {
      const p1 = points[a];
      const p2 = points[b];
      if (!p1 || !p2) return;
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    });

    points.forEach((p) => {
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, color]);

  return <canvas ref={canvasRef} width={960} height={540} className="absolute inset-0 w-full h-full" />;
}
