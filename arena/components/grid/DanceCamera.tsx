'use client';

import { useEffect, useRef } from 'react';
import { getPoseLandmarker } from '@/lib/mediapipe/setup';
import { SKELETON_CONNECTIONS } from '@/lib/mediapipe/skeleton';

export function DanceCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const landmarker = await getPoseLandmarker();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          const loop = () => {
            if (!mounted) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2) {
              rafRef.current = requestAnimationFrame(loop);
              return;
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              rafRef.current = requestAnimationFrame(loop);
              return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const result = landmarker.detectForVideo(video, Date.now());
            const landmarks = result.poseLandmarks?.[0];
            if (landmarks) drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
            rafRef.current = requestAnimationFrame(loop);
          };
          loop();
        }
      } catch {
        // swallow camera error for demo resilience
      }
    })();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <>
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none" />
    </>
  );
}

function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) {
  ctx.strokeStyle = 'rgba(0,229,255,0.85)';
  ctx.lineWidth = 2;
  SKELETON_CONNECTIONS.forEach(([aIdx, bIdx]) => {
    const a = landmarks[aIdx];
    const b = landmarks[bIdx];
    if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) return;
    ctx.beginPath();
    ctx.moveTo((1 - a.x) * width, a.y * height);
    ctx.lineTo((1 - b.x) * width, b.y * height);
    ctx.stroke();
  });
}
