import type { ReactNode } from 'react';

export function Seal({ children, size = 'md' }: { children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const sizing =
    size === 'lg' ? 'w-24 h-24 text-2xl' : size === 'sm' ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-base';
  return (
    <span
      className={`seal ${sizing} animate-seal-in rotate-[-8deg] leading-none text-center px-1`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
