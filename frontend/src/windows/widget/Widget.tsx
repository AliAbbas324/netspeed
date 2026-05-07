import { useEffect, useRef } from 'react';
import { formatTransferRate } from '../../features/speed-meter/formatters';
import { useNetStore, widgetPresets } from '../../stores/useNetStore';
import { UpdateWindowSize } from '../../../wailsjs/go/main/App';
import { ScreenGetAll } from '../../../wailsjs/runtime/runtime';

function getCombinedSpeed(speeds: Record<string, { downloadBps: number; uploadBps: number }>) {
  return Object.values(speeds).reduce(
    (totals, speed) => ({
      downloadBps: totals.downloadBps + speed.downloadBps,
      uploadBps: totals.uploadBps + speed.uploadBps,
    }),
    { downloadBps: 0, uploadBps: 0 }
  );
}

// Sub-component to only re-render the numbers on speed change
function SpeedValues({ config }: { config: any }) {
  const speeds = useNetStore((state) => state.speeds);

  const selectedSpeed = config.selectedInterface
    ? speeds[config.selectedInterface] ?? { downloadBps: 0, uploadBps: 0 }
    : getCombinedSpeed(speeds);

  const download = formatTransferRate(selectedSpeed.downloadBps);
  const upload = formatTransferRate(selectedSpeed.uploadBps);

  return (
    <>
      {config.showDownload && (
        <div
          className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight"
          style={{ opacity: config.widgetTextOpacity }}
        >
          <span className="text-blue-400 font-black" aria-hidden="true">↓</span>
          <span>{download.value}{download.unit}</span>
        </div>
      )}
      {config.showUpload && (
        <div
          className="flex items-center gap-1.5 font-bold tabular-nums tracking-tight"
          style={{ opacity: config.widgetTextOpacity }}
        >
          <span className="text-emerald-400 font-black" aria-hidden="true">↑</span>
          <span>{upload.value}{upload.unit}</span>
        </div>
      )}
    </>
  );
}

export function Widget() {
  const config = useNetStore((state) => state.config);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Add a small buffer for the border
        const finalWidth = Math.ceil(width) + 2;
        const finalHeight = Math.ceil(height) + 2;

        void UpdateWindowSize(finalWidth, finalHeight);

        // Check if position is uninitialized
        const currentConfig = useNetStore.getState().config;
        if (currentConfig.widgetX === -1 || currentConfig.widgetY === -1) {
          void ScreenGetAll().then((screens) => {
            if (screens && screens.length > 0) {
              const primary = screens.find((s) => s.isCurrent) || screens[0];
              const TaskbarHeightEstimate = 48;

              const newX = primary.width - finalWidth - 16;
              const newY = primary.height - finalHeight - TaskbarHeightEstimate - 8;

              void useNetStore.getState().updateConfig({ widgetX: newX, widgetY: newY });
            }
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Get current preset colors
  const isDark = config.theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : config.theme === 'dark';

  const preset = widgetPresets.find(p => p.id === config.widgetPreset) || widgetPresets[0];
  const themeColors = isDark ? preset.dark : preset.light;

  const parseHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) || 8;
    const g = parseInt(hex.slice(3, 5), 16) || 15;
    const b = parseInt(hex.slice(5, 7), 16) || 29;
    return `${r}, ${g}, ${b}`;
  };

  const bgColor = `rgba(${parseHex(themeColors.bg)}, ${config.widgetBgOpacity})`;

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-transparent pointer-events-none">
      <div
        ref={containerRef}
        className="flex items-center gap-4 px-4 py-1.5 transition-[font-size,color,background-color,border-color,opacity,box-shadow] duration-300 select-none w-fit"
        style={{
          opacity: config.widgetOpacity,
          backgroundColor: bgColor,
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: `${config.widgetFontSize}px`,
          color: themeColors.text,
        } as any}
      >
        <SpeedValues config={config} />
      </div>
    </div>
  );
}
