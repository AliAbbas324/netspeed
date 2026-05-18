import { AlertCircle, CheckCircle2, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNetStore } from '../../stores/useNetStore';

function formatLastUpdated(sampledAt: string | null) {
  if (!sampledAt) {
    return '—';
  }

  const date = new Date(sampledAt);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function StatusBanner() {
  const errorMessage = useNetStore((state) => state.errorMessage);
  const interfaces = useNetStore((state) => state.interfaces);
  const sampledAt = useNetStore((state) => state.sampledAt);

  if (errorMessage) {
    return (
      <Card className="border-destructive/40 bg-destructive/5" role="alert">
        <CardContent className="flex gap-3 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-destructive">Monitor unavailable</p>
              <Badge variant="destructive">Error</Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-destructive/90">{errorMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-muted/20">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wifi className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Connection healthy</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monitoring {interfaces.length || 0} active interface
              {interfaces.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            Live
          </Badge>
          <span className="text-xs text-muted-foreground">
            Last sample{' '}
            <span className="font-medium tabular-nums text-foreground">
              {formatLastUpdated(sampledAt)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
