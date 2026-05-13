import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
      <div
        role="alert"
        className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="font-medium text-destructive">Monitor</p>
          <p className="mt-1 text-destructive/90">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/25 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2 sm:items-center">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground sm:mt-0" aria-hidden />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{interfaces.length || 0}</span>
          {' '}
          active interface{interfaces.length === 1 ? '' : 's'}
          <span className="mx-2 text-border">·</span>
          Last sample
          {' '}
          <span className="font-medium tabular-nums text-foreground">{formatLastUpdated(sampledAt)}</span>
        </p>
      </div>
    </div>
  );
}
