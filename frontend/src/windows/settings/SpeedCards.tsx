import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatTransferRate } from '../../features/speed-meter/formatters';
import { useNetStore } from '../../stores/useNetStore';

function getCombinedSpeed(speeds: Record<string, { downloadBps: number; uploadBps: number }>) {
  return Object.values(speeds).reduce(
    (totals, speed) => ({
      downloadBps: totals.downloadBps + speed.downloadBps,
      uploadBps: totals.uploadBps + speed.uploadBps,
    }),
    {
      downloadBps: 0,
      uploadBps: 0,
    },
  );
}

export function SpeedCards() {
  const speeds = useNetStore((state) => state.speeds);
  const selectedInterface = useNetStore((state) => state.config.selectedInterface);

  const selectedSpeed = selectedInterface
    ? speeds[selectedInterface] ?? getCombinedSpeed(speeds)
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="border-border bg-card shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-1 pt-5">
          <ArrowDown className="h-4 w-4 shrink-0 text-blue-500" aria-hidden />
          <span className="text-sm font-medium text-muted-foreground">Download</span>
        </CardHeader>
        <CardContent className="pb-5 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {download.value}
            </span>
            <span className="text-base font-medium text-blue-600 dark:text-blue-400">{download.unit}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {selectedInterface
              ? `Receive rate for ${selectedInterface}.`
              : 'Combined receive rate across active interfaces.'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-1 pt-5">
          <ArrowUp className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <span className="text-sm font-medium text-muted-foreground">Upload</span>
        </CardHeader>
        <CardContent className="pb-5 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {upload.value}
            </span>
            <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">{upload.unit}</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {selectedInterface
              ? `Send rate for ${selectedInterface}.`
              : 'Combined send rate across active interfaces.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
