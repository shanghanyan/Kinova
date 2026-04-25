'use client';

import { useState } from 'react';

interface Props {
  label: string;
  text: string;
}

export function Tooltip({ label, text }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)} className="text-xs px-2 py-1 rounded-full border border-border-2 text-text-2">
        {label}
      </button>
      {open && <div className="absolute z-30 mt-2 w-64 card text-sm text-text-2">{text}</div>}
    </div>
  );
}
