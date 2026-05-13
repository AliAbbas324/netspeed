import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNetStore } from '../../stores/useNetStore';

function formatLastUpdated(sampledAt: string | null) {
  if (!sampledAt) {
    return 'Waiting for first sample';
  }

  const date = new Date(sampledAt);
  if (Number.isNaN(date.getTime())) {
    return 'Waiting for first sample';
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
      <Card className="border-destructive/40 bg-destructive/5 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-destructive" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-destructive">
              Monitor
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/30 bg-card/60">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Phase 1 Status
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <p className="text-sm text-muted-foreground">
          Tracking:
          {' '}
          <span className="font-semibold text-foreground">{interfaces.length || 0}</span>
          {' '}
          active interface{interfaces.length === 1 ? '' : 's'}.
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated:
          {' '}
          <span className="font-semibold text-foreground">{formatLastUpdated(sampledAt)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Widget controls are preview-only in Phase 1 while we stabilize the live monitor.
        </p>
      </CardContent>
    </Card>
  );
}
