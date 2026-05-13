import { useState, useEffect } from 'react';
import { X, Minus, Activity, Maximize2, Copy, Sun, Moon } from 'lucide-react';
import { WindowMinimise, WindowToggleMaximise, WindowHide, EventsOn, WindowIsMaximised } from '../../wailsjs/runtime/runtime';
import { useNetStore } from '../stores/useNetStore';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const { config, updateConfig } = useNetStore();

  useEffect(() => {
    const hasRuntime = !!(window as Window & { runtime?: unknown }).runtime;
    if (!hasRuntime) {
      setIsMaximized(false);
      return;
    }

    const safeEventsOn = typeof EventsOn === 'function' ? EventsOn : () => () => {};
    const safeWindowIsMaximised = typeof WindowIsMaximised === 'function' ? WindowIsMaximised : async () => false;

    // Check initial state
    try {
      void safeWindowIsMaximised().then(setIsMaximized).catch(() => setIsMaximized(false));
    } catch {
      setIsMaximized(false);
    }

    // Listen for window state changes
    let unsubMax = () => {};
    let unsubUnmax = () => {};
    try {
      unsubMax = safeEventsOn('wails:window-maximized', () => setIsMaximized(true));
      unsubUnmax = safeEventsOn('wails:window-unmaximized', () => setIsMaximized(false));
    } catch {
      // Runtime events unavailable; skip listeners.
    }

    return () => {
      unsubMax();
      unsubUnmax();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = config.theme === 'dark' ? 'light' : 'dark';
    void updateConfig({ theme: nextTheme });
  };

  return (
    <div 
      className="flex h-10 w-full items-center justify-between border-b border-border/40 bg-card/90 px-4 backdrop-blur-xl select-none"
      style={{ '--wails-draggable': 'drag' } as any}
      onDoubleClick={() => WindowToggleMaximise()}
    >
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold tracking-tight text-foreground/80">NetSpeed</span>
      </div>
      
      <div className="flex items-center gap-1 no-drag" style={{ '--wails-draggable': 'no-drag' } as any}>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mr-2"
          title={`Switch to ${config.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {config.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="h-4 w-[1px] bg-border/40 mx-1" />
        <button
          onClick={() => WindowMinimise()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => WindowToggleMaximise()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Copy className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button
          onClick={() => WindowHide()}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
