import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatTransferRate } from '../../features/speed-meter/formatters';
import { useNetStore } from '../../stores/useNetStore';

function getCombinedSpeed(speeds: Record<string, { downloadBps: number; uploadBps: number }>) {
  return Object.values(speeds).reduce(
    (totals, speed) => ({
      downloadBps: totals.downloadBps + speed.downloadBps,
      uploadBps: totals.uploadBps + speed.uploadBps,
    }),
    { downloadBps: 0, uploadBps: 0 },
  );
}

type SpeedCardProps = {
  label: string;
  value: string;
  unit: string;
  note: string;
  icon: typeof ArrowDown;
  accent: 'download' | 'upload';
};

function SpeedCard({ label, value, unit, note, icon: Icon, accent }: SpeedCardProps) {
  const accentStyles =
    accent === 'download'
      ? {
          ring: 'ring-blue-500/20',
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          unit: 'text-blue-600 dark:text-blue-400',
          glow: 'from-blue-500/10',
        }
      : {
          ring: 'ring-emerald-500/20',
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          unit: 'text-emerald-600 dark:text-emerald-400',
          glow: 'from-emerald-500/10',
        };

  return (
    <Card
      className={`group relative overflow-hidden border-border/80 bg-card/90 shadow-sm ring-1 transition-shadow hover:shadow-md ${accentStyles.ring}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentStyles.glow} to-transparent opacity-60`}
        aria-hidden
      />
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentStyles.iconBg}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
            {value}
          </span>
          <span className={`text-lg font-semibold ${accentStyles.unit}`}>{unit}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
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

  const downloadNote = selectedInterface
    ? `Receive rate for ${selectedInterface}.`
    : 'Combined receive rate across active interfaces.';
  const uploadNote = selectedInterface
    ? `Send rate for ${selectedInterface}.`
    : 'Combined send rate across active interfaces.';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SpeedCard
        label="Download"
        value={download.value}
        unit={download.unit}
        note={downloadNote}
        icon={ArrowDown}
        accent="download"
      />
      <SpeedCard
        label="Upload"
        value={upload.value}
        unit={upload.unit}
        note={uploadNote}
        icon={ArrowUp}
        accent="upload"
      />
    </div>
  );
}
