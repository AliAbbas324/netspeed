import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNetStore, appPresets } from '../../stores/useNetStore';

function getDisplayMode(showDownload: boolean, showUpload: boolean) {
  if (showDownload && showUpload) return 'both';
  if (showDownload) return 'download';
  if (showUpload) return 'upload';
  return 'both';
}

export function DisplayOptions() {
  const config = useNetStore((state) => state.config);
  const interfaces = useNetStore((state) => state.interfaces);
  const updateConfig = useNetStore((state) => state.updateConfig);

  const displayMode = getDisplayMode(config.showDownload, config.showUpload);
  const selectedInterfaceValue = config.selectedInterface || '__all__';

  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-xl transition-all duration-700 group-hover:opacity-100" />

      <Card className="relative overflow-hidden border-white/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-xl transition-all duration-300">
        <CardHeader className="relative z-10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Display Options
            </p>
          </div>
          <CardTitle className="text-2xl mt-1 font-bold">Phase 1 controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label htmlFor="interface-select" className="text-sm font-semibold">Network interface</Label>
            <Select
              value={selectedInterfaceValue}
              onValueChange={(value) => {
                void updateConfig({
                  selectedInterface: value === '__all__' ? '' : value,
                });
              }}
            >
              <SelectTrigger id="interface-select" className="w-full h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/10 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All active interfaces</SelectItem>
                {interfaces.map((networkInterface) => (
                  <SelectItem key={networkInterface} value={networkInterface}>
                    {networkInterface}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground/80">
              Choose one adapter or keep the combined total across every active interface.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="display-mode" className="text-sm font-semibold">Speed display mode</Label>
            <Select
              value={displayMode}
              onValueChange={(value) => {
                if (value === 'download') {
                  void updateConfig({ showDownload: true, showUpload: false });
                } else if (value === 'upload') {
                  void updateConfig({ showDownload: false, showUpload: true });
                } else {
                  void updateConfig({ showDownload: true, showUpload: true });
                }
              }}
            >
              <SelectTrigger id="display-mode" className="w-full h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/10 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Download and upload</SelectItem>
                <SelectItem value="download">Download only</SelectItem>
                <SelectItem value="upload">Upload only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-border/40" />

          <div className="space-y-3">
            <Label htmlFor="app-preset" className="text-sm font-semibold">App theme preset</Label>
            <Select
              value={config.appPreset}
              onValueChange={(value) => {
                void updateConfig({ appPreset: value });
              }}
            >
              <SelectTrigger id="app-preset" className="w-full h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/10 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="theme-mode" className="text-sm font-semibold">Interface mode</Label>
            <Select
              value={config.theme}
              onValueChange={(value) => {
                void updateConfig({ theme: value as AppThemeMode });
              }}
            >
              <SelectTrigger id="theme-mode" className="w-full h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/10 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System (Match OS)</SelectItem>
                <SelectItem value="light">Light mode</SelectItem>
                <SelectItem value="dark">Dark mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-border/40" />

          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label id="poll-interval-label" className="text-base font-semibold">Poll interval</Label>
                <p className="text-xs text-muted-foreground/80">How often the desktop app samples fresh network counters.</p>
              </div>
              <span className="text-sm font-bold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md ring-1 ring-primary/20">
                {config.pollIntervalMs} ms
              </span>
            </div>
            <Slider
              min={500}
              max={5000}
              step={500}
              value={[config.pollIntervalMs]}
              aria-labelledby="poll-interval-label"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ pollIntervalMs: value });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type AppThemeMode = 'light' | 'dark' | 'system';
