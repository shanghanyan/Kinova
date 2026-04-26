'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractAngles } from '@/lib/mediapipe/angles';
import { getExerciseAnalyzer } from '@/lib/mediapipe/exercises';
import { InjuryRiskEngine } from '@/lib/mediapipe/injuryRiskEngine';
import { RepCounter } from '@/lib/mediapipe/repCounter';
import { initPoseLandmarker } from '@/lib/mediapipe/setup';
import { cancelSpeech, speak } from '@/lib/voice';

export interface SetData {
  reps: number;
  avgFormScore: number;
  repScores: number[];
}

interface PoseCameraProps {
  exerciseName: string;
  userInjuries: string[];
  onSetComplete: (setData: SetData) => void;
  targetReps: number;
}

export function PoseCamera({
  exerciseName,
  userInjuries,
  onSetComplete,
  targetReps,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const repCounter = useRef(new RepCounter());
  const riskEngine = useRef(new InjuryRiskEngine());
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [currentFeedback, setCurrentFeedback] = useState<string[]>([]);
  const [riskLevel, setRiskLevel] = useState<'none' | 'warning' | 'stop'>('none');
  const [repScoresThisSet, setRepScoresThisSet] = useState<number[]>([]);

  const lastVoiceCue = useRef<Record<string, number>>({});
  const VOICE_DEBOUNCE_MS = 3000;

  const analyzer = getExerciseAnalyzer(exerciseName);

  const voiceCue = useCallback((message: string) => {
    const now = Date.now();
    if (
      !lastVoiceCue.current[message] ||
      now - lastVoiceCue.current[message] > VOICE_DEBOUNCE_MS
    ) {
      speak(message);
      lastVoiceCue.current[message] = now;
    }
  }, []);

  useEffect(() => {
    let poseLandmarker: any;

    async function setup() {
      try {
        poseLandmarker = await initPoseLandmarker();
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
        });

        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
          setIsLoading(false);
          runDetection(poseLandmarker);
        }
      } catch (err) {
        console.error('Camera setup failed:', err);
      }
    }

    function runDetection(lm: any) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(() => runDetection(lm));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(() => runDetection(lm));
        return;
      }

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const result = lm.detectForVideo(video, Date.now());

      if (result.poseLandmarks?.length > 0) {
        const landmarks = result.poseLandmarks[0];
        const angles = extractAngles(landmarks);

        drawSkeleton(ctx, landmarks, canvas.width, canvas.height);

        if (angles && analyzer) {
          const prevPhase = repCounter.current.getPhase();
          const currentPhase = analyzer.detectPhase(angles, prevPhase);

          const feedback = analyzer.analyzeFrame(angles, currentPhase, userInjuries);
          setCurrentFeedback(feedback.map((f) => f.message));

          feedback
            .filter((f) => f.severity === 'high' && f.voiceCue)
            .forEach((f) => voiceCue(f.voiceCue!));

          const newCount = repCounter.current.update(currentPhase, analyzer);
          if (newCount !== null) {
            const repScore = analyzer.scoreRep([], feedback);
            setRepScoresThisSet((prev) => {
              const next = [...prev, repScore];
              if (newCount >= targetReps) {
                handleSetComplete(newCount, next);
              }
              return next;
            });
            setRepCount(newCount);
          }

          const score = analyzer.scoreRep([], feedback);
          setFormScore(score);

          const risk = riskEngine.current.analyze(angles, score, Date.now());
          setRiskLevel(risk.riskLevel);
          if (risk.riskLevel === 'stop') speak('Stop the set - form is breaking down');
        }
      }

      animFrameRef.current = requestAnimationFrame(() => runDetection(lm));
    }

    setup();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelSpeech();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [exerciseName, targetReps, analyzer, userInjuries, voiceCue]);

  function handleSetComplete(reps: number, repScores: number[]) {
    cancelAnimationFrame(animFrameRef.current);
    const avgScore = repScores.length
      ? repScores.reduce((a, b) => a + b, 0) / repScores.length
      : formScore;
    onSetComplete({ reps, avgFormScore: avgScore, repScores });
  }

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-xp border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-text-2 text-sm font-mono">Initializing pose detection...</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 font-mono">
        <div className="text-6xl font-bold text-xp leading-none">{repCount}</div>
        <div className="text-text-2 text-xs mt-1">/ {targetReps} reps</div>
      </div>

      <div className="absolute top-4 right-4 text-right font-mono">
        <div
          className={`text-4xl font-bold ${
            formScore >= 80 ? 'text-xp' : formScore >= 60 ? 'text-yellow-400' : 'text-red-400'
          }`}
        >
          {Math.round(formScore)}
        </div>
        <div className="text-text-2 text-xs">form</div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
        {currentFeedback.slice(0, 2).map((msg, i) => (
          <div
            key={`${msg}-${i}`}
            className="bg-red-500/20 border border-red-500/40 text-white text-sm px-3 py-2 rounded-lg font-mono backdrop-blur-sm"
          >
            {msg}
          </div>
        ))}
      </div>

      {riskLevel === 'stop' && (
        <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
          <div className="bg-black/80 text-red-400 font-mono text-center p-6 rounded-xl">
            <div className="text-3xl font-bold mb-2">STOP</div>
            <div className="text-sm">Form breaking down - rest and reset</div>
          </div>
        </div>
      )}
    </div>
  );
}

function drawSkeleton(ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number) {
  const connections = [
    [11, 12],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [11, 23],
    [12, 24],
    [23, 24],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
    [27, 29],
    [28, 30],
    [29, 31],
    [30, 32],
  ];

  ctx.strokeStyle = 'rgba(200, 241, 53, 0.9)';
  ctx.lineWidth = 2;

  connections.forEach(([i, j]) => {
    const a = landmarks[i];
    const b = landmarks[j];
    if (a.visibility > 0.5 && b.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo((1 - a.x) * w, a.y * h);
      ctx.lineTo((1 - b.x) * w, b.y * h);
      ctx.stroke();
    }
  });

  landmarks.forEach((lm) => {
    if (lm.visibility > 0.5) {
      ctx.beginPath();
      ctx.arc((1 - lm.x) * w, lm.y * h, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#c8f135';
      ctx.fill();
    }
  });
}
