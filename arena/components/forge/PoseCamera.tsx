'use client';

import { useEffect, useMemo, useRef } from 'react';
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
  const repStateRef = useRef({ phase: 'top' as const, reps: 0 });
  const lowScoreStreakRef = useRef(0);
  const repScoresRef = useRef<number[]>([]);
  const tipIdxRef = useRef(0);
  const didCompleteRef = useRef(false);
  const analyzer = useMemo(() => getAnalyzer(exerciseId), [exerciseId]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;
    repStateRef.current = { phase: 'top', reps: 0 };
    lowScoreStreakRef.current = 0;
    repScoresRef.current = [];
    tipIdxRef.current = 0;
    didCompleteRef.current = false;

    const runDetection = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        const landmarker = await getPoseLandmarker();

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        onReady?.();

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

          const phase = analyzer.detectPhase(angles, repStateRef.current.phase);
          const errors = analyzer.analyzeFrame(angles, phase, limitationRegions);
          const formScore = analyzer.scoreRep(errors);

          onFormScore(formScore);
          lowScoreStreakRef.current = formScore < 65 ? lowScoreStreakRef.current + 1 : 0;
          onRisk(detectInjuryRisk(errors, lowScoreStreakRef.current).risk);

          const nextRepState = stepRepCounter(phase, repStateRef.current);
          const repCompleted = nextRepState.reps > repStateRef.current.reps;
          repStateRef.current = nextRepState;
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
      } catch {
        onReady?.();
      }
    };

    runDetection();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [analyzer, limitationRegions, onFormScore, onReady, onRepCount, onRisk, onSetComplete, onTip, targetReps]);

  return (
    <>
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none" />
    </>
  );
}

function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) {
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
