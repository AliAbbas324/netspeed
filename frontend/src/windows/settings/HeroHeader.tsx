import { Activity } from 'lucide-react';
import { AppBrandingIcon } from '@/components/AppBrandingIcon';
import { Badge } from '@/components/ui/badge';
import { useNetStore } from '@/stores/useNetStore';

export function HeroHeader() {
  const rounded = useNetStore((s) => s.config.titleBarLogoRoundedCorners);
  const errorMessage = useNetStore((s) => s.errorMessage);
  const sampledAt = useNetStore((s) => s.sampledAt);

  const isLive = !errorMessage && Boolean(sampledAt);

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      <AppBrandingIcon
        rounded={rounded}
        size={56}
        className="shrink-0 shadow-lg ring-1 ring-border/60"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            NetSpeed
          </p>
          {isLive ? (
            <Badge variant="success" className="gap-1.5 pl-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live
            </Badge>
          ) : errorMessage ? (
            <Badge variant="destructive">Offline</Badge>
          ) : (
            <Badge variant="secondary">
              <Activity className="mr-1 h-3 w-3" aria-hidden />
              Connecting
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Network monitor
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Real-time upload and download rates from your active adapters. Adjust monitoring,
          appearance, and the floating widget below.
        </p>
      </div>
    </header>
  );
}
