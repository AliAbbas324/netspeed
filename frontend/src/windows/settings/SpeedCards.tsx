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
    ? speeds[selectedInterface] ?? { downloadBps: 0, uploadBps: 0 }
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Download */}
      <div className="group relative">
        {/* Glow behind card on hover */}
        <div className="absolute -inset-0.5 rounded-2xl bg-blue-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:bg-blue-500/20 group-hover:opacity-100" />
        
        <Card className="relative overflow-hidden border-white/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] group-hover:border-blue-500/30">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
          
          {/* Accent top border */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500 dark:text-blue-400">
                  Download
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm transition-all duration-300">
                {download.value}
              </span>
              <span className="pb-1 text-lg font-bold text-blue-500/80">
                {download.unit}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground/70 dark:text-muted-foreground transition-colors group-hover:text-muted-foreground">
              {selectedInterface
                ? `Receive rate for ${selectedInterface}.`
                : 'Combined receive rate across active interfaces.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload */}
      <div className="group relative">
        {/* Glow behind card on hover */}
        <div className="absolute -inset-0.5 rounded-2xl bg-emerald-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:bg-emerald-500/20 group-hover:opacity-100" />

        <Card className="relative overflow-hidden border-white/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
          
          {/* Accent top border */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-400">
                  Upload
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl font-black tracking-tighter text-foreground drop-shadow-sm transition-all duration-300">
                {upload.value}
              </span>
              <span className="pb-1 text-lg font-bold text-emerald-500/80">
                {upload.unit}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground/70 dark:text-muted-foreground transition-colors group-hover:text-muted-foreground">
              {selectedInterface
                ? `Send rate for ${selectedInterface}.`
                : 'Combined send rate across active interfaces.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
