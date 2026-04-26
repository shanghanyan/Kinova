"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { extractAngles, type BodyAngles } from "@/lib/mediapipe/angles";
import { getExerciseAnalyzer } from "@/lib/mediapipe/exercises";
import { InjuryRiskEngine } from "@/lib/mediapipe/injuryRiskEngine";
import { RepCounter } from "@/lib/mediapipe/repCounter";
import { initPoseLandmarker } from "@/lib/mediapipe/setup";
import { speak } from "@/lib/voice";
import { Dragon } from "./ui/Dragon";

type PoseLandmark = {
  x: number;
  y: number;
  visibility?: number;
  presence?: number;
};

const REQUIRED_KEYPOINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28] as const;
const DEFAULT_VISIBILITY = 0.2;

type TrackingProfile = {
  minVisibility: number;
  minMotionForRep: number;
  minMotionForFeedback: number;
};

const TRACKING_PROFILES: Record<string, TrackingProfile> = {
  SQUAT: { minVisibility: 0.2, minMotionForRep: 4.5, minMotionForFeedback: 3.5 },
  "PUSH-UP": { minVisibility: 0.18, minMotionForRep: 3.2, minMotionForFeedback: 2.4 },
  PUSHUP: { minVisibility: 0.18, minMotionForRep: 3.2, minMotionForFeedback: 2.4 },
  LUNGE: { minVisibility: 0.2, minMotionForRep: 4.0, minMotionForFeedback: 3.0 },
};

function getTrackingProfile(exerciseName: string): TrackingProfile {
  return TRACKING_PROFILES[exerciseName.trim().toUpperCase()] ?? {
    minVisibility: DEFAULT_VISIBILITY,
    minMotionForRep: 4,
    minMotionForFeedback: 3,
  };
}

function hasReliableFullSkeleton(landmarks: PoseLandmark[], minVisibility: number): boolean {
  return REQUIRED_KEYPOINTS.every((idx) => {
    const lm = landmarks[idx];
    if (!lm) return false;
    if (lm.x < 0 || lm.x > 1 || lm.y < 0 || lm.y > 1) return false;
    if (typeof lm.visibility === "number" && lm.visibility < minVisibility) return false;
    if (typeof lm.presence === "number" && lm.presence < minVisibility) return false;
    return true;
  });
}

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
  skeletonColor?: string;
  onFormUpdate?: (payload: { score: number; errors: string[]; phase: string; movement: number }) => void;
  isActive?: boolean;
  autoVoiceCues?: boolean;
}

export function PoseCamera({
  exerciseName,
  userInjuries,
  onSetComplete,
  onRep,
  targetReps,
  danceMode = "flow",
  persona = "cinematic",
  skeletonColor = "#00e5ff",
  onFormUpdate,
  isActive = true,
  autoVoiceCues = true,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reps, setReps] = useState(0);
  const [status, setStatus] = useState("Initializing camera...");
  const [warning, setWarning] = useState<string | null>(null);
  const repCounter = useMemo(() => new RepCounter(), []);
  const riskEngine = useMemo(() => new InjuryRiskEngine(), []);
  const repScores = useRef<number[]>([]);
  const setCompletedRef = useRef(false);
  const lastLandmarkAtRef = useRef<number>(0);
  const exerciseRef = useRef(exerciseName);
  const targetRepsRef = useRef(targetReps);
  const injuriesRef = useRef(userInjuries);
  const onRepRef = useRef(onRep);
  const onSetCompleteRef = useRef(onSetComplete);
  const onFormUpdateRef = useRef(onFormUpdate);
  const skeletonColorRef = useRef(skeletonColor);
  const autoVoiceCuesRef = useRef(autoVoiceCues);

  useEffect(() => {
    exerciseRef.current = exerciseName;
    targetRepsRef.current = targetReps;
    injuriesRef.current = userInjuries;
    onRepRef.current = onRep;
    onSetCompleteRef.current = onSetComplete;
    onFormUpdateRef.current = onFormUpdate;
    skeletonColorRef.current = skeletonColor;
  }, [exerciseName, onFormUpdate, onRep, onSetComplete, skeletonColor, targetReps, userInjuries]);

  useEffect(() => {
    autoVoiceCuesRef.current = autoVoiceCues;
  }, [autoVoiceCues]);

  useEffect(() => {
    if (!isActive) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let running = true;

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!videoRef.current) return;
        const handleVideoProblem = () => {
          setWarning("Camera stream interrupted. Check permissions or reload stream.");
        };
        videoRef.current.onstalled = handleVideoProblem;
        videoRef.current.onerror = handleVideoProblem;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        stream.getTracks().forEach((track) => {
          track.onended = () => {
            setWarning("Camera stream ended unexpectedly. Please re-enable camera.");
          };
        });
        const landmarker = await initPoseLandmarker();
        let analyzer = getExerciseAnalyzer(exerciseRef.current);
        let trackingProfile = getTrackingProfile(exerciseRef.current);
        let currentExercise = exerciseRef.current;
        let phase = "up";
        let prevAngles: BodyAngles | null = null;
        let prevTs = performance.now();
        setStatus("Tracking...");

        setCompletedRef.current = false;
        setWarning(null);
        lastLandmarkAtRef.current = performance.now();
        const tick = () => {
          if (!running || !videoRef.current) return;
          if (exerciseRef.current !== currentExercise) {
            currentExercise = exerciseRef.current;
            analyzer = getExerciseAnalyzer(currentExercise);
            trackingProfile = getTrackingProfile(currentExercise);
            phase = "up";
            prevAngles = null;
            prevTs = performance.now();
            repCounter.reset();
            repScores.current = [];
            setCompletedRef.current = false;
            setReps(0);
          }
          const result = landmarker.detectForVideo(videoRef.current, performance.now());
          const landmarks = result.landmarks?.[0] as PoseLandmark[] | undefined;
          if (landmarks) {
            lastLandmarkAtRef.current = performance.now();
            setWarning((prev) => (prev ? null : prev));
            const fullSkeletonVisible = hasReliableFullSkeleton(landmarks, trackingProfile.minVisibility);
            if (!fullSkeletonVisible) {
              setWarning("Full body not visible. Step back so head-to-ankles are in frame.");
              prevAngles = null;
              prevTs = performance.now();
              onFormUpdateRef.current?.({
                score: 100,
                errors: [],
                phase,
                movement: 0,
              });
            } else {
            const angles = extractAngles(landmarks);
            if (angles) {
              const movement =
                prevAngles && performance.now() - prevTs > 0
                  ? Math.abs((angles.leftKnee ?? 0) - (prevAngles.leftKnee ?? 0)) /
                    ((performance.now() - prevTs) / 1000)
                  : 0;
              const enoughMotionForRep = movement >= trackingProfile.minMotionForRep;
              const enoughMotionForFeedback = movement >= trackingProfile.minMotionForFeedback;
              if (enoughMotionForRep) {
                phase = analyzer.detectPhase(angles, phase);
              }
              const rep = enoughMotionForRep ? repCounter.update(phase) : null;
              const feedback = enoughMotionForFeedback ? analyzer.analyzeFrame(angles, phase, injuriesRef.current) : [];
              const frameScore = enoughMotionForFeedback ? analyzer.scoreRep(feedback) : 100;
              onFormUpdateRef.current?.({
                score: frameScore,
                errors: feedback.map((f) => f.message),
                phase,
                movement,
              });
              prevAngles = angles;
              prevTs = performance.now();
              if (rep) {
                const score = frameScore;
                riskEngine.analyze(score);
                repScores.current.push(score);
                setReps(rep);
                onRepRef.current?.({ rep, score });
                const cue = feedback.find((f) => f.voiceCue)?.voiceCue;
                if (cue && autoVoiceCuesRef.current) speak(cue, false);
                if (rep >= targetRepsRef.current) {
                  if (!setCompletedRef.current) {
                    setCompletedRef.current = true;
                    const avgFormScore =
                      repScores.current.reduce((a, b) => a + b, 0) / repScores.current.length;
                    onSetCompleteRef.current({
                      reps: rep,
                      avgFormScore: Number.isFinite(avgFormScore) ? avgFormScore : 0,
                      repScores: repScores.current,
                    });
                  }
                }
              }
            }
            }
          } else if (performance.now() - lastLandmarkAtRef.current > 2500) {
            setWarning("Tracking lost: move into frame and ensure good lighting.");
          }

          const ctx = canvasRef.current?.getContext("2d");
          if (ctx && canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (landmarks) {
              drawSkeleton(
                ctx,
                landmarks,
                canvasRef.current.width,
                canvasRef.current.height,
                skeletonColorRef.current,
              );
            }
          }
          raf = requestAnimationFrame(tick);
        };

        tick();
      } catch {
        setStatus("Camera unavailable");
        setWarning("Camera unavailable. Allow camera access to continue.");
      }
    };

    run();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isActive, repCounter, riskEngine]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)]">
      <video ref={videoRef} className="h-full w-full object-cover -scale-x-100" muted playsInline />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />
      <div className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-display text-xs">
        {isActive ? status : "Paused"} | {exerciseName} | {danceMode.toUpperCase()} | {persona} | Reps: {reps}/{targetReps}
      </div>
      {warning && (
        <div className="absolute left-3 right-3 top-11 rounded-md border border-amber-400/60 bg-amber-500/20 px-3 py-2 text-xs text-amber-100">
          ALERT: {warning}
        </div>
      )}
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
  color = "#00e5ff",
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
  ctx.strokeStyle = color;
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
