export function BeatVisualizer({ active }: { active: boolean }) {
  return <div className={`w-3 h-3 rounded-full transition-all ${active ? 'bg-grid scale-125' : 'bg-white/30 scale-100'}`} />;
}
