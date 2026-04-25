'use client';

import { useEffect, useRef } from 'react';

interface Props {
  onReady?: () => void;
}

export function PoseCamera({ onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onReady?.();
        }
      } catch {
        onReady?.();
      }
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onReady]);

  return <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted />;
}
