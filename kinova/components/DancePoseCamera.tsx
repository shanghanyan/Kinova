"use client";

import { useEffect, useRef, useState } from "react";
import { extractAngles, type BodyAngles } from "@/lib/mediapipe/angles";
import { initPoseLandmarker } from "@/lib/mediapipe/setup";

interface DancePoseCameraProps {
  onMovement: (magnitude: number) => void;
  pulse: boolean;
}

export function DancePoseCamera({ onMovement, pulse }: DancePoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Starting camera...");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let running = true;
    let prev: BodyAngles | null = null;
    let prevTs = performance.now();

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const landmarker = await initPoseLandmarker();
        setStatus("Tracking...");

        const tick = () => {
          if (!running || !videoRef.current || !canvasRef.current) return;
          const result = landmarker.detectForVideo(videoRef.current, performance.now());
          const landmarks = result.landmarks?.[0];
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (landmarks) drawSkeleton(ctx, landmarks, canvas.width, canvas.height);
          }

          if (landmarks) {
            const angles = extractAngles(landmarks);
            if (angles) {
              const now = performance.now();
              const magnitude =
                prev && now - prevTs > 0
                  ? Math.abs((angles.leftShoulder ?? 0) - (prev.leftShoulder ?? 0)) /
                    ((now - prevTs) / 1000)
                  : 0;
              prev = angles;
              prevTs = now;
              onMovement(magnitude);
            }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setStatus("Camera unavailable");
      }
    };

    run();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onMovement]);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
      <video ref={videoRef} className="h-full w-full object-cover -scale-x-100" muted playsInline />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full -scale-x-100 transition-transform ${pulse ? "scale-[1.03]" : "scale-100"}`}
      />
      <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-display text-xs">{status}</div>
    </div>
  );
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>,
  w: number,
  h: number,
) {
  const pairs: Array<[number, number]> = [
    [11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
  ];
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 2.5;
  pairs.forEach(([a, b]) => {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    if (!p1 || !p2) return;
    ctx.beginPath();
    ctx.moveTo(p1.x * w, p1.y * h);
    ctx.lineTo(p2.x * w, p2.y * h);
    ctx.stroke();
  });
}
