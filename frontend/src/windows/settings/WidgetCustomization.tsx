import { Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatTransferRate } from '../../features/speed-meter/formatters';
import { useNetStore, widgetPresets } from '../../stores/useNetStore';

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

// Sub-component to prevent the sliders from re-rendering every 500ms when speeds update
function SpeedValues({ config }: { config: any }) {
  const speeds = useNetStore((state) => state.speeds);
  const selectedSpeed = config.selectedInterface
    ? speeds[config.selectedInterface] ?? getCombinedSpeed(speeds)
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <>
      {config.showDownload && (
        <div className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight">
          <span className="text-blue-400 font-black" aria-hidden="true">↓</span>
          <span style={{ opacity: config.widgetTextOpacity }}>{download.value}{download.unit}</span>
        </div>
      )}
      {config.showUpload && (
        <div className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight">
          <span className="text-emerald-400 font-black" aria-hidden="true">↑</span>
          <span style={{ opacity: config.widgetTextOpacity }}>{upload.value}{upload.unit}</span>
        </div>
      )}
    </>
  );
}

function SpeedValuesLight({ config }: { config: any }) {
  const speeds = useNetStore((state) => state.speeds);
  const selectedSpeed = config.selectedInterface
    ? speeds[config.selectedInterface] ?? getCombinedSpeed(speeds)
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <>
      {config.showDownload && (
        <div className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight">
          <span className="text-blue-500 font-black" aria-hidden="true">↓</span>
          <span style={{ opacity: config.widgetTextOpacity }}>{download.value}{download.unit}</span>
        </div>
      )}
      {config.showUpload && (
        <div className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight">
          <span className="text-emerald-500 font-black" aria-hidden="true">↑</span>
          <span style={{ opacity: config.widgetTextOpacity }}>{upload.value}{upload.unit}</span>
        </div>
      )}
    </>
  );
}

export function WidgetCustomization() {
  const config = useNetStore((state) => state.config);
  const updateConfig = useNetStore((state) => state.updateConfig);

  return (
    <Card className="relative overflow-hidden border-white/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-xl mt-6">
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
            <Palette className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500 dark:text-purple-400">
            Widget Customization
          </p>
        </div>
        <CardTitle className="text-2xl mt-1 font-bold">
          Appearance preview &amp; controls
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground/80 font-medium">
          Configure the widget visual style while we keep the first release focused
          on a stable main window monitor. These settings are saved now and the
          floating widget behavior will land in the next phase.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dark Preview */}
          <div className="space-y-3 group">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">Dark Desktop Preview</span>
            <div className="relative rounded-xl border border-white/10 bg-slate-900 overflow-hidden flex flex-col min-h-[160px] shadow-inner">
              {/* Fake Window Header */}
              <div className="h-6 w-full bg-black/40 backdrop-blur-md flex items-center px-3 gap-1.5 border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              {/* Faux Wallpaper background */}
              <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />
                <div
                  className="relative z-10 transition-[font-size,color,background-color,border-color,opacity,box-shadow,transform] duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:scale-105"
                  style={{
                    fontSize: `${config.widgetFontSize}px`,
                    color: (widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).dark.text,
                    opacity: config.widgetOpacity,
                    backgroundColor: `rgba(${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).dark.bg.slice(1, 3), 16)}, ${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).dark.bg.slice(3, 5), 16)}, ${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).dark.bg.slice(5, 7), 16)}, ${config.widgetBgOpacity})`,
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-4 px-4 py-1.5">
                    <SpeedValues config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Light Preview */}
          <div className="space-y-3 group">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground ml-1">Light Desktop Preview</span>
            <div className="relative rounded-xl border border-black/10 bg-slate-100 overflow-hidden flex flex-col min-h-[160px] shadow-inner">
              {/* Fake Window Header */}
              <div className="h-6 w-full bg-white/60 backdrop-blur-md flex items-center px-3 gap-1.5 border-b border-black/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              {/* Faux Wallpaper background */}
              <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-white">
                <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:12px_12px]" />
                <div
                  className="relative z-10 transition-[font-size,color,background-color,border-color,opacity,box-shadow,transform] duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.1)] group-hover:scale-105"
                  style={{
                    fontSize: `${config.widgetFontSize}px`,
                    color: (widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).light.text,
                    opacity: config.widgetOpacity,
                    backgroundColor: `rgba(${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).light.bg.slice(1, 3), 16)}, ${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).light.bg.slice(3, 5), 16)}, ${parseInt((widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0]).light.bg.slice(5, 7), 16)}, ${config.widgetBgOpacity})`,
                    borderRadius: '9999px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-4 px-4 py-1.5">
                    <SpeedValuesLight config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardContent className="space-y-6 pt-2 relative z-10">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Widget Preset */}
          <div className="space-y-3 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <Label htmlFor="widget-preset" className="text-base font-semibold">Color Preset</Label>
            <Select
              value={config.widgetPreset}
              onValueChange={(value) => void updateConfig({ widgetPreset: value })}
            >
              <SelectTrigger id="widget-preset" className="w-full h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/10 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-white/10 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {widgetPresets.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Presets automatically adapt to your app's Light/Dark mode.
            </p>
          </div>

          {/* Font size */}
          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <Label id="font-size-label" className="text-base font-semibold">Font size</Label>
              <span className="text-sm font-bold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md ring-1 ring-primary/20">
                {config.widgetFontSize}px
              </span>
            </div>
            <Slider
              min={10}
              max={32}
              step={1}
              value={[config.widgetFontSize]}
              aria-labelledby="font-size-label"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetFontSize: value });
              }}
            />
          </div>

          {/* X Offset */}
          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <Label htmlFor="widget-x" className="text-base font-semibold">Horizontal Position (X)</Label>
              <div className="flex items-center gap-2">
                <input
                  id="widget-x"
                  type="number"
                  className="w-16 h-8 rounded-md border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/40 px-2 text-right text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  value={config.widgetX}
                  onChange={(e) => void updateConfig({ widgetX: parseInt(e.target.value) || 0 })}
                />
                <span className="text-xs text-muted-foreground/80 font-bold uppercase tracking-wider">px</span>
              </div>
            </div>
            <Slider
              min={-500}
              max={5000}
              step={1}
              value={[config.widgetX]}
              aria-label="Horizontal Position (X)"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetX: value });
              }}
            />
          </div>

          {/* Y Offset */}
          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <Label htmlFor="widget-y" className="text-base font-semibold">Vertical Position (Y)</Label>
              <div className="flex items-center gap-2">
                <input
                  id="widget-y"
                  type="number"
                  className="w-16 h-8 rounded-md border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/40 px-2 text-right text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  value={config.widgetY}
                  onChange={(e) => void updateConfig({ widgetY: parseInt(e.target.value) || 0 })}
                />
                <span className="text-xs text-muted-foreground/80 font-bold uppercase tracking-wider">px</span>
              </div>
            </div>
            <Slider
              min={-500}
              max={5000}
              step={1}
              value={[config.widgetY]}
              aria-label="Vertical Position (Y)"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetY: value });
              }}
            />
          </div>

          {/* Background opacity */}
          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <Label id="bg-opacity-label" className="text-base font-semibold">Background opacity</Label>
              <span className="text-sm font-bold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md ring-1 ring-primary/20">
                {Math.round(config.widgetBgOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetBgOpacity * 100)]}
              aria-labelledby="bg-opacity-label"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetBgOpacity: value / 100 });
              }}
            />
          </div>

          {/* Text opacity */}
          <div className="space-y-4 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <Label id="text-opacity-label" className="text-base font-semibold">Text opacity</Label>
              <span className="text-sm font-bold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md ring-1 ring-primary/20">
                {Math.round(config.widgetTextOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetTextOpacity * 100)]}
              aria-labelledby="text-opacity-label"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetTextOpacity: value / 100 });
              }}
            />
          </div>

          {/* Overall widget opacity */}
          <div className="space-y-4 sm:col-span-2 rounded-xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 p-5 shadow-sm transition-all duration-200 hover:bg-white/80 dark:hover:bg-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label id="overall-opacity-label" className="text-base font-semibold">Overall widget visibility</Label>
                <p className="text-xs text-muted-foreground/80">Controls the master opacity of the floating window.</p>
              </div>
              <span className="text-sm font-bold text-primary tabular-nums bg-primary/10 px-2 py-1 rounded-md ring-1 ring-primary/20">
                {Math.round(config.widgetOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetOpacity * 100)]}
              aria-labelledby="overall-opacity-label"
              className="touch-manipulation py-2"
              onValueChange={([value]) => {
                void updateConfig({ widgetOpacity: value / 100 });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
