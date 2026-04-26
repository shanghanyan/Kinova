'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { extractAllAngles } from '@/lib/mediapipe/angles';
import { getAnalyzer } from '@/lib/mediapipe/exercises';
import { detectInjuryRisk } from '@/lib/mediapipe/injuryRiskEngine';
import { stepRepCounter } from '@/lib/mediapipe/repCounter';
import { getPoseLandmarker } from '@/lib/mediapipe/setup';
import { SKELETON_CONNECTIONS } from '@/lib/mediapipe/skeleton';

interface Props {
  exerciseId: string;
  limitationRegions: string[];
  targetReps: number;
  onRepCount: (reps: number) => void;
  onFormScore: (score: number) => void;
  onTip: (tip: string) => void;
  onRisk: (risk: boolean) => void;
  onSetComplete: (payload: { reps: number; avgScore: number }) => void;
  onReady?: () => void;
}

export function PoseCamera({
  exerciseId,
  limitationRegions,
  targetReps,
  onRepCount,
  onFormScore,
  onTip,
  onRisk,
  onSetComplete,
  onReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  // Use a plain string for phase so stepRepCounter's return type is compatible
  const repStateRef = useRef<{ phase: string; reps: number }>({ phase: 'top', reps: 0 });
  const lowScoreStreakRef = useRef(0);
  const repScoresRef = useRef<number[]>([]);
  const tipIdxRef = useRef(0);
  const didCompleteRef = useRef(false);
  const analyzer = useMemo(() => getAnalyzer(exerciseId), [exerciseId]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    repStateRef.current = { phase: 'top', reps: 0 };
    lowScoreStreakRef.current = 0;
    repScoresRef.current = [];
    tipIdxRef.current = 0;
    didCompleteRef.current = false;

    const runDetection = async () => {
      // ── Step 1: attach camera immediately ──────────────────────────────────
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      } catch (err) {
        const msg =
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access and reload.'
            : `Camera unavailable: ${err instanceof Error ? err.message : String(err)}`;
        setCameraError(msg);
        onReady?.();
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
        setCameraError(`Video playback failed: ${err instanceof Error ? err.message : String(err)}`);
        onReady?.();
        return;
      }

      // ── Step 2: load MediaPipe model (camera is already live) ──────────────
      let landmarker: Awaited<ReturnType<typeof getPoseLandmarker>>;
      try {
        landmarker = await getPoseLandmarker();
        setModelLoading(false);
      } catch (err) {
        setCameraError(
          `MediaPipe failed to load: ${err instanceof Error ? err.message : String(err)}. Check your network connection.`
        );
        setModelLoading(false);
        onReady?.();
        return;
      }

      if (!mounted) return;
      onReady?.();

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
        } catch (err) {
          // detectForVideo can throw if the video frame is not ready; skip this frame
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const lm = result.poseLandmarks?.[0];
        if (!lm) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        drawSkeleton(ctx, lm, canvas.width, canvas.height);

        const angles = extractAllAngles(lm as any[]);
        if (!angles) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        const currentPhase = repStateRef.current.phase as 'top' | 'bottom';
        const phase = analyzer.detectPhase(angles, currentPhase);
        const errors = analyzer.analyzeFrame(angles, phase, limitationRegions);
        const formScore = analyzer.scoreRep(errors);

        onFormScore(formScore);
        lowScoreStreakRef.current = formScore < 65 ? lowScoreStreakRef.current + 1 : 0;
        onRisk(detectInjuryRisk(errors, lowScoreStreakRef.current).risk);

        const nextRepState = stepRepCounter(phase, repStateRef.current as any);
        const repCompleted = nextRepState.reps > repStateRef.current.reps;
        // ── FIX: assign the whole object, not just mutate a typed-as-const field ──
        repStateRef.current = { phase: nextRepState.phase, reps: nextRepState.reps };
        onRepCount(nextRepState.reps);

        if (repCompleted) {
          repScoresRef.current.push(formScore);
          tipIdxRef.current = (tipIdxRef.current + 1) % analyzer.rotatingTips.length;
          onTip(analyzer.rotatingTips[tipIdxRef.current]);
        }

        if (!didCompleteRef.current && nextRepState.reps >= targetReps) {
          didCompleteRef.current = true;
          const avgScore = repScoresRef.current.length
            ? repScoresRef.current.reduce((sum, s) => sum + s, 0) / repScoresRef.current.length
            : formScore;
          onSetComplete({ reps: nextRepState.reps, avgScore });
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
    };

    runDetection();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [analyzer, limitationRegions, onFormScore, onReady, onRepCount, onRisk, onSetComplete, onTip, targetReps]);

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

      {/* MediaPipe loading indicator — shown while model downloads but camera is already live */}
      {modelLoading && !cameraError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Loading pose model…
        </div>
      )}

      {/* Visible error overlay instead of a silent blank screen */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center px-6">
          <div>
            <p className="text-lg font-semibold mb-2">Camera Error</p>
            <p className="text-sm text-white/70">{cameraError}</p>
          </div>
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
  ctx.strokeStyle = 'rgba(200,241,53,0.85)';
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

  landmarks.forEach((lm) => {
    if (!lm || lm.visibility < 0.5) return;
    ctx.beginPath();
    ctx.arc((1 - lm.x) * width, lm.y * height, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c8f135';
    ctx.fill();
  });
}