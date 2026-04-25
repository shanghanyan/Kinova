import Link from 'next/link';

interface Props {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
  variant: 'forge' | 'grid';
  cta: string;
  preview?: string;
}

export function ZoneCard({ href, icon, title, subtitle, variant, cta, preview }: Props) {
  const isForge = variant === 'forge';
  return (
    <div className={`card border ${isForge ? 'hover:glow-forge' : 'hover:glow-grid'} transition-all`} style={{ borderColor: isForge ? 'var(--forge-border)' : 'var(--grid-border)' }}>
      <div className="text-4xl">{icon}</div>
      <div className={`font-display text-3xl ${isForge ? 'text-forge-gradient' : 'text-grid-gradient'}`}>{title}</div>
      <div className="text-text-2">{subtitle}</div>
      {preview && <div className="text-sm mt-2">{preview}</div>}
      <Link href={href} className={`inline-block mt-4 ${isForge ? 'bg-forge glow-forge' : 'bg-grid glow-grid'} text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px]`}>
        {cta}
      </Link>
    </div>
  );
}
