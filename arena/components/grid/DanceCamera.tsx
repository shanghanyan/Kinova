'use client';

import { useEffect, useRef, useState } from 'react';
import { getPoseLandmarker } from '@/lib/mediapipe/setup';
import { SKELETON_CONNECTIONS } from '@/lib/mediapipe/skeleton';

// Import the dance scorer so camera output can drive GridSession scoring.
// import { scoreDanceFrame } from '@/lib/mediapipe/danceScorer';

interface Props {
  /** Called every frame a pose is detected, with a 0-100 form score. */
  onPoseScore?: (score: number) => void;
  /** Called once the camera stream (and optionally the pose model) is ready. */
  onReady?: () => void;
}

export function DanceCamera({ onPoseScore, onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    (async () => {
      // ── Step 1: attach camera immediately ──────────────────────────────────
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and reload.'
            : `Camera unavailable: ${err instanceof Error ? err.message : String(err)}`;
        setCameraError(msg);
        onReady?.(); // unblock parent loading state even on error
        return;
      }

      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;

      try {
        await video.play();
      } catch (err) {
        setCameraError(
          `Video playback failed: ${err instanceof Error ? err.message : String(err)}`
        );
        onReady?.();
        return;
      }

      // Camera is live — unblock parent now so it hides its loading overlay.
      onReady?.();

      // ── Step 2: load MediaPipe model in the background ─────────────────────
      let landmarker: Awaited<ReturnType<typeof getPoseLandmarker>>;
      try {
        landmarker = await getPoseLandmarker();
        setModelLoading(false);
      } catch (err) {
        // Camera stays live; pose scoring is just unavailable.
        setCameraError(
          `Pose model failed: ${
            err instanceof Error ? err.message : String(err)
          }. Camera-only mode active.`
        );
        setModelLoading(false);
        return;
      }

      if (!mounted) return;

      // ── Step 3: detection loop ─────────────────────────────────────────────
      const loop = () => {
        if (!mounted) return;
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

        let result: ReturnType<typeof landmarker.detectForVideo>;
        try {
          result = landmarker.detectForVideo(video, Date.now());
        } catch {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const landmarks = result?.poseLandmarks?.[0];
        if (landmarks) {
          drawSkeleton(ctx, landmarks, canvas.width, canvas.height);

          // Simple visibility-based score — replace with scoreDanceFrame()
          // once lib/mediapipe/danceScorer.ts is implemented.
          const visibleCount = landmarks.filter((lm: any) => lm?.visibility > 0.5).length;
          const poseScore = Math.round((visibleCount / landmarks.length) * 100);
          onPoseScore?.(poseScore);
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
    })();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onPoseScore, onReady]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
      />

      {/* Model still downloading, camera already live */}
      {modelLoading && !cameraError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Loading pose model…
        </div>
      )}

      {/* Non-fatal error banner — camera may still be working */}
      {cameraError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-black/80 text-white text-center text-xs px-4 py-2 rounded-lg">
          {cameraError}
        </div>
      )}
    </div>
  );
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number
) {
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