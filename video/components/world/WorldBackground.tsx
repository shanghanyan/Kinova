'use client';
import { useEffect, useState } from 'react';
import { WORLDS } from '@/lib/worlds';

interface Props { worldId: string; beatBPM?: number; intensity?: number; mouseParallax?: boolean }

export function WorldBackground({ worldId, beatBPM, intensity = 0, mouseParallax = false }: Props) {
  const world = WORLDS.find(w => w.id === worldId) || WORLDS[0];
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [beatActive, setBeatActive] = useState(false);

  useEffect(() => {
    if (!mouseParallax) return;
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseParallax]);

  useEffect(() => {
    if (!beatBPM) return;
    const interval = setInterval(() => { setBeatActive(true); setTimeout(() => setBeatActive(false), 150); }, (60 / beatBPM) * 1000);
    return () => clearInterval(interval);
  }, [beatBPM]);

  const parallaxStyle = mouseParallax ? { transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -10}px)` } : {};

  return (
    <div className={`fixed inset-0 overflow-hidden ${world.bgClass} ${beatActive ? 'animate-beat-pulse' : ''}`} style={{ transition: 'filter 0.1s' }}>
      <div className="world-layer-back absolute inset-0" style={{ transform: mouseParallax ? `translate(${(mousePos.x-0.5)*-25}px, ${(mousePos.y-0.5)*-15}px)` : undefined }}>
        {renderWorldLayers(world.id, 'back')}
      </div>
      <div className="world-layer-mid absolute inset-0" style={parallaxStyle}>{renderWorldLayers(world.id, 'mid')}</div>
      <div className="world-layer-front absolute inset-0" style={{ transform: mouseParallax ? `translate(${(mousePos.x-0.5)*-5}px, ${(mousePos.y-0.5)*-3}px)` : undefined }}>{renderWorldLayers(world.id, 'front')}</div>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,${intensity * 0.04}), transparent)`, pointerEvents: 'none' }} />
    </div>
  );
}

function renderWorldLayers(worldId: string, layer: 'back'|'mid'|'front') {
  switch (worldId) {
    case 'pixel_park': return <PixelParkLayer layer={layer} />;
    case 'neon_arcade': return <NeonArcadeLayer layer={layer} />;
    default: return <GenericLayer worldId={worldId} layer={layer} />;
  }
}

function PixelParkLayer({ layer }: { layer: string }) {
  if (layer === 'back') return (
    <div className="absolute inset-0">{Array.from({length: 30}).map((_, i) => (
      <div key={i} className="absolute rounded-full bg-white" style={{ width: 2, height: 2, left: `${Math.random()*100}%`, top: `${Math.random()*60}%`, opacity: 0.4 + Math.random()*0.6, animation: `star-twinkle ${2+Math.random()*3}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s` }} />
    ))}</div>
  );
  if (layer === 'mid') return (
    <div className="absolute inset-0">{Array.from({length: 15}).map((_, i) => (
      <div key={i} className="firefly absolute" style={{ left: `${10+Math.random()*80}%`, top: `${20+Math.random()*60}%`, animationDelay: `${Math.random()*5}s`, animationDuration: `${6+Math.random()*8}s` }} />
    ))}</div>
  );
  if (layer === 'front') return (
    <div className="absolute bottom-0 left-0 right-0"><div className="world-layer-ground" />
      <div className="absolute bottom-[20%] left-[3%] w-16 h-24" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#0d2b0d' }} />
      <div className="absolute bottom-[20%] left-[8%] w-12 h-32" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#0a220a' }} />
      <div className="absolute bottom-[20%] right-[5%] w-20 h-28" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#0d2b0d' }} />
    </div>
  );
  return null;
}

function NeonArcadeLayer({ layer }: { layer: string }) {
  if (layer === 'back') return <div className="world-layer-grid absolute inset-0" />;
  if (layer === 'mid') return (
    <div className="absolute inset-0">
      <div className="neon-sign neon-sign-1 absolute" style={{top:'12%'}}>ARENA</div>
      <div className="neon-sign neon-sign-2 absolute" style={{top:'18%'}}>PLAY</div>
      <div className="neon-sign neon-sign-3 absolute">GO!</div>
    </div>
  );
  if (layer === 'front') return <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{ background: 'linear-gradient(180deg, transparent, rgba(56,189,248,0.05))', borderTop: '1px solid rgba(56,189,248,0.15)' }} />;
  return null;
}

function GenericLayer({ worldId, layer }: { worldId: string; layer: string }) { return <div className="absolute inset-0" />; }
