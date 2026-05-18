import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsPanel } from '@/components/SettingsPanel';
import { SettingsSection } from './SettingsSection';
import { useNetStore, appPresets } from '../../stores/useNetStore';

const selectTriggerClass =
  'h-10 w-full border-border bg-background text-sm font-normal shadow-none focus:ring-2 focus:ring-ring';

function getDisplayMode(showDownload: boolean, showUpload: boolean) {
  if (showDownload && showUpload) return 'both';
  if (showDownload) return 'download';
  if (showUpload) return 'upload';
  return 'both';
}

type AppThemeMode = 'light' | 'dark' | 'system';

type DisplayOptionsProps = {
  section: 'monitoring' | 'appearance';
};

export function DisplayOptions({ section }: DisplayOptionsProps) {
  const config = useNetStore((state) => state.config);
  const interfaces = useNetStore((state) => state.interfaces);
  const updateConfig = useNetStore((state) => state.updateConfig);

  const displayMode = getDisplayMode(config.showDownload, config.showUpload);
  const selectedInterfaceValue = config.selectedInterface || '__all__';

  if (section === 'monitoring') {
    return (
      <SettingsPanel
        title="Monitoring"
        description="Choose what is measured and how often counters refresh."
      >
        <SettingsSection title="Network source" className="first:pt-0">
          <div className="space-y-2">
            <Label htmlFor="interface-select" className="text-sm font-medium">
              Network interface
            </Label>
            <Select
              value={selectedInterfaceValue}
              onValueChange={(value) => {
                void updateConfig({
                  selectedInterface: value === '__all__' ? '' : value,
                });
              }}
            >
              <SelectTrigger id="interface-select" className={selectTriggerClass}>
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
            <p className="text-xs text-muted-foreground">
              One adapter, or totals summed across adapters.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-mode" className="text-sm font-medium">
              Speeds shown
            </Label>
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
              <SelectTrigger id="display-mode" className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Download and upload</SelectItem>
                <SelectItem value="download">Download only</SelectItem>
                <SelectItem value="upload">Upload only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label id="poll-interval-label" className="text-sm font-medium">
                  Poll interval
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sampling period for network counters.
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium tabular-nums">
                {config.pollIntervalMs} ms
              </span>
            </div>
            <Slider
              min={500}
              max={5000}
              step={500}
              value={[config.pollIntervalMs]}
              aria-labelledby="poll-interval-label"
              className="touch-manipulation py-1"
              onValueChange={([value]) => {
                void updateConfig({ pollIntervalMs: value });
              }}
            />
          </div>
        </SettingsSection>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Appearance"
      description="Theme, accent preset, and title bar branding."
    >
      <SettingsSection title="Theme" className="first:pt-0">
        <div className="space-y-2">
          <Label htmlFor="theme-mode" className="text-sm font-medium">
            Color mode
          </Label>
          <Select
            value={config.theme}
            onValueChange={(value) => {
              void updateConfig({ theme: value as AppThemeMode });
            }}
          >
            <SelectTrigger id="theme-mode" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Match system</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="app-preset" className="text-sm font-medium">
            Accent preset
          </Label>
          <Select
            value={config.appPreset}
            onValueChange={(value) => {
              void updateConfig({ appPreset: value });
            }}
          >
            <SelectTrigger id="app-preset" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {appPresets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 px-4 py-3.5">
          <div className="min-w-0 pr-2">
            <Label htmlFor="title-bar-logo-round" className="text-sm font-medium">
              Rounded app icon
            </Label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Applies to the title bar, favicon, and in-app branding marks.
            </p>
          </div>
          <Switch
            id="title-bar-logo-round"
            checked={config.titleBarLogoRoundedCorners}
            onCheckedChange={(checked) => void updateConfig({ titleBarLogoRoundedCorners: checked })}
            className="shrink-0"
          />
        </div>
      </SettingsSection>
    </SettingsPanel>
  );
}
