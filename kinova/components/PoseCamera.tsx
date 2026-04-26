"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { extractAngles } from "@/lib/mediapipe/angles";
import { getExerciseAnalyzer } from "@/lib/mediapipe/exercises";
import { InjuryRiskEngine } from "@/lib/mediapipe/injuryRiskEngine";
import { RepCounter } from "@/lib/mediapipe/repCounter";
import { initPoseLandmarker } from "@/lib/mediapipe/setup";
import { cancelSpeech, speak } from "@/lib/voice";
import { Dragon } from "./ui/Dragon";

export interface SetData {
  reps: number;
  avgFormScore: number;
  repScores: number[];
}

interface PoseCameraProps {
  exerciseName: string;
  userInjuries: string[];
  onSetComplete: (setData: SetData) => void;
  onRep?: (payload: { rep: number; score: number }) => void;
  targetReps: number;
  danceMode?: "flow" | "power" | "recovery";
  persona?: string;
}

export function PoseCamera({
  exerciseName,
  userInjuries,
  onSetComplete,
  onRep,
  targetReps,
  danceMode = "flow",
  persona = "cinematic",
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reps, setReps] = useState(0);
  const [status, setStatus] = useState("Initializing camera...");
  const repCounter = useMemo(() => new RepCounter(), []);
  const riskEngine = useMemo(() => new InjuryRiskEngine(), []);
  const repScores = useRef<number[]>([]);
  const setCompletedRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let running = true;

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const landmarker = await initPoseLandmarker();
        const analyzer = getExerciseAnalyzer(exerciseName);
        let phase = "up";
        setStatus("Tracking...");

        setCompletedRef.current = false;
        const tick = () => {
          if (!running || !videoRef.current) return;
          const result = landmarker.detectForVideo(videoRef.current, performance.now());
          const landmarks = result.landmarks?.[0];
          if (landmarks) {
            const angles = extractAngles(landmarks);
            if (angles) {
              phase = analyzer.detectPhase(angles, phase);
              const rep = repCounter.update(phase);
              if (rep) {
                const feedback = analyzer.analyzeFrame(angles, phase, userInjuries);
                const score = analyzer.scoreRep(feedback);
                riskEngine.analyze(score);
                repScores.current.push(score);
                setReps(rep);
                onRep?.({ rep, score });
                const cue = feedback.find((f) => f.voiceCue)?.voiceCue;
                if (cue) speak(cue, true);
                if (rep >= targetReps) {
                  if (!setCompletedRef.current) {
                    setCompletedRef.current = true;
                    const avgFormScore =
                      repScores.current.reduce((a, b) => a + b, 0) / repScores.current.length;
                    onSetComplete({
                      reps: rep,
                      avgFormScore: Number.isFinite(avgFormScore) ? avgFormScore : 0,
                      repScores: repScores.current,
                    });
                  }
                }
              }
            }
          }

          const ctx = canvasRef.current?.getContext("2d");
          if (ctx && canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (landmarks) drawSkeleton(ctx, landmarks, canvasRef.current.width, canvasRef.current.height);
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
      cancelSpeech();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [exerciseName, onRep, onSetComplete, repCounter, riskEngine, targetReps, userInjuries]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
      <video ref={videoRef} className="h-[360px] w-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="absolute inset-0 h-[360px] w-full" />
      <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-display text-xs">
        {status} | {exerciseName} | {danceMode.toUpperCase()} | {persona} | Reps: {reps}/{targetReps}
      </div>
      <div className="absolute bottom-3 right-3">
        <Dragon size={60} state="idle" />
      </div>
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
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
  ];
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 2;
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
