import { ButtonHTMLAttributes } from 'react';

type Variant = 'forge' | 'grid' | 'xp' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'forge', className = '', ...props }: Props) {
  const variantClass = {
    forge: 'bg-forge text-bg glow-forge',
    grid: 'bg-grid text-bg glow-grid',
    xp: 'bg-xp text-bg',
    ghost: 'border border-border-2 text-text-2 hover:bg-bg-hover',
  }[variant];

  return (
    <button
      {...props}
      className={`font-body font-extrabold text-sm px-6 py-3 rounded-[12px] hover:brightness-110 active:scale-95 transition-all duration-150 ${variantClass} ${className}`}
    />
  );
}
