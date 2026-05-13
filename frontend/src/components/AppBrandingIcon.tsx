import { cn } from '@/lib/utils';
import { AppIconMark } from '@/branding/AppIconMark';

type AppBrandingIconProps = {
  /** Matches persisted `titleBarLogoRoundedCorners`. */
  rounded: boolean;
  /** Outer tile size in CSS pixels (default matches title bar). */
  size?: number;
  className?: string;
};

/**
 * App mark for the title bar and elsewhere. Inner glyph follows `currentColor`;
 * outer tile uses `primary` tokens so accent presets and light/dark track the shell.
 */
export function AppBrandingIcon({ rounded, size = 40, className }: AppBrandingIconProps) {
  const px = `${size}px`;
  const innerPct = 55;
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-white/15',
        rounded ? 'rounded-2xl' : 'rounded-none',
        className,
      )}
      style={{ width: px, height: px }}
      title="NetSpeed"
    >
      <AppIconMark
        className="pointer-events-none shrink-0 select-none"
        style={{ width: `${innerPct}%`, height: `${innerPct}%` }}
      />
    </div>
  );
}
