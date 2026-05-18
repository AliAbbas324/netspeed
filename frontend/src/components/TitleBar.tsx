import { useState, useEffect, useCallback, type CSSProperties, type SVGProps } from 'react';
import { X, Minus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  WindowMinimise,
  WindowToggleMaximise,
  EventsOn,
  WindowIsMaximised,
  Quit,
  WindowSetTitle,
} from '../../wailsjs/runtime/runtime';
import { AppBrandingIcon } from '@/components/AppBrandingIcon';
import { useNetStore } from '../stores/useNetStore';

/** “Expand to full window” glyph (custom SVG, strokes follow `currentColor`). */
function MaximizeToFullWindowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        opacity={0.5}
        d="M12.9999 21.9994C17.055 21.9921 19.1784 21.8926 20.5354 20.5355C21.9999 19.0711 21.9999 16.714 21.9999 12C21.9999 7.28595 21.9999 4.92893 20.5354 3.46447C19.071 2 16.714 2 11.9999 2C7.28587 2 4.92884 2 3.46438 3.46447C2.10734 4.8215 2.00779 6.94493 2.00049 11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M12 12L17 7M17 7H13.25M17 7V10.75"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 18C2 16.1144 2 15.1716 2.58579 14.5858C3.17157 14 4.11438 14 6 14C7.88562 14 8.82843 14 9.41421 14.5858C10 15.1716 10 16.1144 10 18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18Z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}

/** “Shrink to smaller / restore” glyph (paired with maximize; strokes follow `currentColor`). */
function ShrinkToSmallerWindowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden {...props}>
      <path
        opacity={0.5}
        d="M12.9999 21.9994C17.055 21.9921 19.1784 21.8926 20.5354 20.5355C21.9999 19.0711 21.9999 16.714 21.9999 12C21.9999 7.28595 21.9999 4.92893 20.5354 3.46447C19.071 2 16.714 2 11.9999 2C7.28587 2 4.92884 2 3.46438 3.46447C2.10734 4.8215 2.00779 6.94493 2.00049 11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M17 7L12 12M12 12H15.75M12 12V8.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 18C2 16.1144 2 15.1716 2.58579 14.5858C3.17157 14 4.11438 14 6 14C7.88562 14 8.82843 14 9.41421 14.5858C10 15.1716 10 16.1144 10 18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18Z"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const { config, updateConfig } = useNetStore();

  const syncMaximizedFromRuntime = useCallback(() => {
    if (typeof WindowIsMaximised !== 'function') return;
    void WindowIsMaximised()
      .then(setIsMaximized)
      .catch(() => setIsMaximized(false));
  }, []);

  const handleToggleMaximize = useCallback(() => {
    try {
      WindowToggleMaximise();
    } catch {
      return;
    }
    setIsMaximized((prev) => !prev);
    window.setTimeout(syncMaximizedFromRuntime, 0);
    window.setTimeout(syncMaximizedFromRuntime, 120);
  }, [syncMaximizedFromRuntime]);

  useEffect(() => {
    try {
      WindowSetTitle('NetSpeed — Settings');
    } catch {
      // Browser / no runtime
    }
  }, []);

  useEffect(() => {
    const hasRuntime = !!(window as Window & { runtime?: unknown }).runtime;
    if (!hasRuntime) {
      setIsMaximized(false);
      return;
    }

    const safeEventsOn = typeof EventsOn === 'function' ? EventsOn : () => () => {};
    const safeWindowIsMaximised =
      typeof WindowIsMaximised === 'function' ? WindowIsMaximised : async () => false;

    try {
      void safeWindowIsMaximised().then(setIsMaximized).catch(() => setIsMaximized(false));
    } catch {
      setIsMaximized(false);
    }

    let unsubMax = () => {};
    let unsubUnmax = () => {};
    try {
      unsubMax = safeEventsOn('wails:window-maximized', () => setIsMaximized(true));
      unsubUnmax = safeEventsOn('wails:window-unmaximized', () => setIsMaximized(false));
    } catch {
      // Runtime events unavailable
    }

    const onResize = () => {
      void safeWindowIsMaximised().then(setIsMaximized).catch(() => {});
    };
    window.addEventListener('resize', onResize);

    return () => {
      unsubMax();
      unsubUnmax();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = config.theme === 'dark' ? 'light' : 'dark';
    void updateConfig({ theme: nextTheme });
  };

  return (
    <div className="grid h-11 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-card/90 shadow-sm backdrop-blur-md select-none">
      <div
        className="flex min-w-0 items-center gap-3 pl-4"
        style={{ '--wails-draggable': 'drag' } as CSSProperties}
        onDoubleClick={handleToggleMaximize}
      >
        <AppBrandingIcon rounded={config.titleBarLogoRoundedCorners} size={40} />
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <span className="truncate text-sm font-bold tracking-tight text-foreground">
            NetSpeed
          </span>
          <span className="truncate text-[11px] font-medium leading-none text-muted-foreground">
            Network monitor
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-center px-6"
        style={{ '--wails-draggable': 'drag' } as CSSProperties}
        onDoubleClick={handleToggleMaximize}
      >
        <span className="text-xs font-semibold tracking-wide text-muted-foreground/90">
          Settings
        </span>
      </div>

      <div
        className="flex items-center justify-end gap-0.5 pr-2"
        style={{ '--wails-draggable': 'no-drag' } as CSSProperties}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground"
          title={`Switch to ${config.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {config.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => WindowMinimise()}
          className="h-8 w-8 text-muted-foreground"
          title="Minimize"
        >
          <Minus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleMaximize}
          className="h-8 w-8 text-muted-foreground"
          title={isMaximized ? 'Restore' : 'Maximize'}
          aria-pressed={isMaximized}
        >
          {isMaximized ? (
            <ShrinkToSmallerWindowIcon className="h-4 w-4 shrink-0" />
          ) : (
            <MaximizeToFullWindowIcon className="h-4 w-4 shrink-0" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => Quit()}
          className="h-8 w-8 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          title="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </Button>
      </div>
    </div>
  );
}
