import type { SVGProps } from 'react';

/**
 * Vector mark for NetSpeed (bars). Stroke uses `currentColor` so the parent tile
 * (`text-primary-foreground`, etc.) controls contrast against the gradient frame.
 */
export function AppIconMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        d="M6 22v-6M12 22V10M18 22V14M24 22V6"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
    </svg>
  );
}
