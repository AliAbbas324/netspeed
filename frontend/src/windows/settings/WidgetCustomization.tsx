import { ArrowDown, ArrowUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SettingsPanel } from '@/components/SettingsPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatTransferRate } from '../../features/speed-meter/formatters';
import { useNetStore, widgetPresets } from '../../stores/useNetStore';
import type { AppConfig, InterfaceSpeed } from '../../lib/contracts';
import { SettingsSection } from './SettingsSection';

const selectTriggerClass =
  'h-10 w-full border-border bg-background text-sm font-normal shadow-none focus:ring-2 focus:ring-ring';

function getCombinedSpeed(speeds: Record<string, InterfaceSpeed>) {
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

function resolvePreset(widgetPresetId: string) {
  return widgetPresets.find((entry) => entry.id === widgetPresetId) ?? widgetPresets[0];
}

function rgbFromHex(hex: string) {
  const h = hex.slice(1);
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
}

function SpeedValues({ config }: { config: AppConfig }) {
  const speeds = useNetStore((state) => state.speeds);
  const selectedSpeed = config.selectedInterface
    ? speeds[config.selectedInterface] ?? getCombinedSpeed(speeds)
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <>
      {config.showDownload && (
        <div className="flex items-center gap-1.5 font-semibold tabular-nums tracking-tight">
          <ArrowDown className="h-3.5 w-3.5 text-blue-400" aria-hidden />
          <span style={{ opacity: config.widgetTextOpacity }}>
            {download.value}
            {download.unit}
          </span>
        </div>
      )}
      {config.showUpload && (
        <div className="flex items-center gap-1.5 font-semibold tabular-nums tracking-tight">
          <ArrowUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          <span style={{ opacity: config.widgetTextOpacity }}>
            {upload.value}
            {upload.unit}
          </span>
        </div>
      )}
    </>
  );
}

function SpeedValuesLight({ config }: { config: AppConfig }) {
  const speeds = useNetStore((state) => state.speeds);
  const selectedSpeed = config.selectedInterface
    ? speeds[config.selectedInterface] ?? getCombinedSpeed(speeds)
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <>
      {config.showDownload && (
        <div className="flex items-center gap-1.5 font-semibold tabular-nums tracking-tight">
          <ArrowDown className="h-3.5 w-3.5 text-blue-600" aria-hidden />
          <span style={{ opacity: config.widgetTextOpacity }}>
            {download.value}
            {download.unit}
          </span>
        </div>
      )}
      {config.showUpload && (
        <div className="flex items-center gap-1.5 font-semibold tabular-nums tracking-tight">
          <ArrowUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          <span style={{ opacity: config.widgetTextOpacity }}>
            {upload.value}
            {upload.unit}
          </span>
        </div>
      )}
    </>
  );
}

export function WidgetCustomization() {
  const config = useNetStore((state) => state.config);
  const updateConfig = useNetStore((state) => state.updateConfig);
  const preset = resolvePreset(config.widgetPreset);

  const darkBg = `rgba(${rgbFromHex(preset.dark.bg)}, ${config.widgetBgOpacity})`;
  const lightBg = `rgba(${rgbFromHex(preset.light.bg)}, ${config.widgetBgOpacity})`;

  return (
    <SettingsPanel
      title="Floating widget"
      description="Customize the overlay that shows live speeds on your desktop."
      contentClassName="space-y-0"
    >
      <SettingsSection
        title="Preview"
        description="Approximate look of the floating widget on dark and light desktops."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Dark</p>
            <div className="flex min-h-[140px] flex-col overflow-hidden rounded-lg border border-border bg-zinc-950">
              <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-white/10 px-2.5">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
              <div className="flex flex-1 items-center justify-center bg-zinc-900/90 p-4">
                <div
                  className="rounded-full border border-white/10 px-4 py-1.5 shadow-lg transition-[font-size,opacity,background-color,color] duration-200"
                  style={{
                    fontSize: `${config.widgetFontSize}px`,
                    color: preset.dark.text,
                    opacity: config.widgetOpacity,
                    backgroundColor: darkBg,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <SpeedValues config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Light</p>
            <div className="flex min-h-[140px] flex-col overflow-hidden rounded-lg border border-border bg-zinc-100">
              <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-black/10 px-2.5">
                <span className="h-2 w-2 rounded-full bg-black/15" />
                <span className="h-2 w-2 rounded-full bg-black/15" />
                <span className="h-2 w-2 rounded-full bg-black/15" />
              </div>
              <div className="flex flex-1 items-center justify-center bg-white p-4">
                <div
                  className="rounded-full border border-black/10 px-4 py-1.5 shadow-md transition-[font-size,opacity,background-color,color] duration-200"
                  style={{
                    fontSize: `${config.widgetFontSize}px`,
                    color: preset.light.text,
                    opacity: config.widgetOpacity,
                    backgroundColor: lightBg,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <SpeedValuesLight config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Style" description="Color preset and type size for the widget.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="widget-preset" className="text-sm font-medium text-foreground">
              Color preset
            </Label>
            <Select
              value={config.widgetPreset}
              onValueChange={(value) => void updateConfig({ widgetPreset: value })}
            >
              <SelectTrigger id="widget-preset" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {widgetPresets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Pairs with your app light/dark mode.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label id="font-size-label" className="text-sm font-medium text-foreground">
                Font size
              </Label>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                {config.widgetFontSize}px
              </span>
            </div>
            <Slider
              min={10}
              max={32}
              step={1}
              value={[config.widgetFontSize]}
              aria-labelledby="font-size-label"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetFontSize: value });
              }}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Position" description="Widget offset from the top-left of the screen (pixels).">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="widget-x" className="text-sm font-medium text-foreground">
                Horizontal (X)
              </Label>
              <Input
                id="widget-x"
                type="number"
                className="h-9 w-[4.5rem] px-2 text-right tabular-nums"
                value={config.widgetX}
                onChange={(e) => void updateConfig({ widgetX: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <Slider
              min={-500}
              max={5000}
              step={1}
              value={[config.widgetX]}
              aria-label="Horizontal position"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetX: value });
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="widget-y" className="text-sm font-medium text-foreground">
                Vertical (Y)
              </Label>
              <Input
                id="widget-y"
                type="number"
                className="h-9 w-[4.5rem] px-2 text-right tabular-nums"
                value={config.widgetY}
                onChange={(e) => void updateConfig({ widgetY: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <Slider
              min={-500}
              max={5000}
              step={1}
              value={[config.widgetY]}
              aria-label="Vertical position"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetY: value });
              }}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Opacity" description="Layering for background, text, and the widget as a whole.">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label id="bg-opacity-label" className="text-sm font-medium text-foreground">
                Widget background
              </Label>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                {Math.round(config.widgetBgOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetBgOpacity * 100)]}
              aria-labelledby="bg-opacity-label"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetBgOpacity: value / 100 });
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label id="text-opacity-label" className="text-sm font-medium text-foreground">
                Text
              </Label>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                {Math.round(config.widgetTextOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetTextOpacity * 100)]}
              aria-labelledby="text-opacity-label"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetTextOpacity: value / 100 });
              }}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label id="overall-opacity-label" className="text-sm font-medium text-foreground">
                Whole widget
              </Label>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                {Math.round(config.widgetOpacity * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(config.widgetOpacity * 100)]}
              aria-labelledby="overall-opacity-label"
              className="touch-manipulation"
              onValueChange={([value]) => {
                void updateConfig({ widgetOpacity: value / 100 });
              }}
            />
          </div>
        </div>
      </SettingsSection>
    </SettingsPanel>
  );
}
