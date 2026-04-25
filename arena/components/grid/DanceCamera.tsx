'use client';

import { useEffect, useRef } from 'react';

export function DanceCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        // swallow camera error for demo resilience
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  return <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted />;
}
