import { HTMLAttributes } from 'react';

export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${className}`} />;
}
