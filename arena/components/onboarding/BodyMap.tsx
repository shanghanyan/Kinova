'use client';

const REGIONS = [
  'head_neck', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'upper_back', 'lower_back', 'left_hip',
  'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
] as const;

interface Props {
  selected: string[];
  onToggle: (region: string) => void;
}

function label(region: string) {
  return region.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function BodyMap({ selected, onToggle }: Props) {
  return (
    <div className="card">
      <div className="font-display text-lg mb-3">Tap body regions</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {REGIONS.map((region) => {
          const active = selected.includes(region);
          return (
            <button
              key={region}
              onClick={() => onToggle(region)}
              className="px-3 py-2 rounded-[12px] text-sm font-bold text-left transition-all"
              style={{
                background: active ? 'rgba(251,191,36,0.16)' : 'var(--bg-raised)',
                border: `1px solid ${active ? 'var(--warning)' : 'var(--border-2)'}`,
                color: active ? 'var(--warning)' : 'var(--text-2)',
              }}
            >
              {label(region)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
