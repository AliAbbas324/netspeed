import { create } from 'zustand';
import { GetConfig, GetSpeeds, ListInterfaces, GetWindowMode, UpdateWindowPosition, SetWidgetPositionX11 } from '../../wailsjs/go/main/App';
import { Environment } from '../../wailsjs/runtime/runtime';

let isLinux = false;
Environment().then((env) => {
  isLinux = env.platform === 'linux';
}).catch(() => {});

async function updateWidgetPosition(x: number, y: number) {
  if (isLinux) {
    await SetWidgetPositionX11(x, y);
  } else {
    await UpdateWindowPosition(x, y);
  }
}

export interface InterfaceSpeed {
  downloadBps: number;
  uploadBps: number;
}

export interface AppConfig {
  selectedInterface: string;
  pollIntervalMs: number;
  showDownload: boolean;
  showUpload: boolean;
  showWidget: boolean;
  widgetFontSize: number;
  widgetBgOpacity: number;
  widgetOpacity: number;
  widgetTextOpacity: number;
  widgetX: number;
  widgetY: number;
  hideWidgetOnFocus: boolean;
  theme: 'light' | 'dark' | 'system';
  appPreset: string;
  widgetPreset: string;
}

interface NetStoreState {
  speeds: Record<string, InterfaceSpeed>;
  interfaces: string[];
  config: AppConfig;
  windowMode: 'settings' | 'widget';
  isLoading: boolean;
  errorMessage: string | null;
  initialize: () => Promise<void>;
  fetchSpeeds: () => Promise<void>;
  fetchInterfaces: () => Promise<void>;
  fetchConfig: () => Promise<void>;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  switchToWidget: () => Promise<void>;
  switchToSettings: () => Promise<void>;
  applyTheme: () => void;
}

const defaultConfig: AppConfig = {
  selectedInterface: '',
  pollIntervalMs: 1000,
  showDownload: true,
  showUpload: true,
  showWidget: false,
  widgetFontSize: 18,
  widgetBgOpacity: 0.8,
  widgetOpacity: 1,
  widgetTextOpacity: 1,
  widgetX: 20,
  widgetY: 20,
  theme: 'system',
  appPreset: 'default',
  widgetPreset: 'classic',
  hideWidgetOnFocus: true,
};

export interface AppPreset {
  id: string;
  name: string;
}

export const appPresets: AppPreset[] = [
  { id: 'default', name: 'Default (Space)' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'sunset', name: 'Sunset' },
  { id: 'forest', name: 'Forest' },
];

export interface WidgetPreset {
  id: string;
  name: string;
  dark: { bg: string; text: string };
  light: { bg: string; text: string };
}

export const widgetPresets: WidgetPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    dark: { bg: '#080F1D', text: '#F8FBFF' },
    light: { bg: '#F8FBFF', text: '#080F1D' },
  },
  {
    id: 'neon',
    name: 'Neon',
    dark: { bg: '#0A0A0A', text: '#00F2FF' },
    light: { bg: '#F0FDFF', text: '#0077B6' },
  },
  {
    id: 'amber',
    name: 'Amber',
    dark: { bg: '#1A1108', text: '#FFB000' },
    light: { bg: '#FFFBEB', text: '#92400E' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    dark: { bg: '#06120B', text: '#10B981' },
    light: { bg: '#F0FDF4', text: '#166534' },
  },
];

type SaveConfigBridge = (config: AppConfig) => Promise<void>;

let pollingStarted = false;

function saveConfig(config: AppConfig) {
  const bridge = (window as Window & {
    go?: {
      main?: {
        App?: {
          SaveConfig?: SaveConfigBridge;
        };
      };
    };
  }).go?.main?.App?.SaveConfig;

  if (!bridge) {
    return Promise.reject(new Error('SaveConfig bridge is not available yet.'));
  }

  return bridge(config);
}

function normalizeConfig(value: Partial<AppConfig> | undefined): AppConfig {
  return {
    ...defaultConfig,
    ...value,
  };
}

export const useNetStore = create<NetStoreState>((set, get) => ({
  speeds: {},
  interfaces: [],
  config: defaultConfig,
  windowMode: 'settings',
  isLoading: true,
  errorMessage: null,

  async initialize() {
    console.log('[NetStore] Initialize called');
    
    // Start polling in background - don't wait for it
    if (!pollingStarted) {
      pollingStarted = true;
      console.log('[NetStore] Starting polling interval');
      window.setInterval(() => {
        void get().fetchSpeeds();
        void get().fetchInterfaces();
        void get().fetchConfig();
      }, 1000);
    }

    set({ isLoading: true, errorMessage: null });

    // Detect mode from URL (Wails v3 multi-window)
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    console.log('[NetStore] URL mode param:', modeParam);
    
    if (modeParam === 'settings' || modeParam === 'widget') {
      set({ windowMode: modeParam });
    }

    // Debug: check if Wails bridge exists
    const hasBridge = !!(window as any).go?.main?.App;
    const hasRuntime = !!(window as any).runtime;
    console.log('[NetStore] Wails bridge state:', { hasBridge, hasRuntime });

    if (!hasBridge) {
      console.warn('[NetStore] Wails bridge not available yet - using fallback');
      set({
        isLoading: false,
        errorMessage: null,
      });
      get().applyTheme();
      return;
    }

    // Try to get backend data with timeout
    let completed = false;
    
    const initPromise = Promise.all([
      GetConfig(),
      ListInterfaces(),
      GetSpeeds(),
      GetWindowMode(),
    ]).then((result) => {
      console.log('[NetStore] Backend initialization successful:', result);
      completed = true;
      return result;
    }).catch((error) => {
      console.error('[NetStore] Backend initialization failed:', error);
      completed = true;
      return null;
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      window.setTimeout(() => {
        console.warn('[NetStore] Initialization timeout after 3 seconds, completed=' + completed);
        resolve(null);
      }, 3000);
    });

    const result = await Promise.race([initPromise, timeoutPromise]);

    if (!result) {
      console.log('[NetStore] Using fallback configuration');
      set({
        isLoading: false,
        errorMessage: null,
      });
      get().applyTheme();
      return;
    }

    const [configValue, interfaces, speeds, mode] = result;
    const normalizedConfig = normalizeConfig(configValue as Partial<AppConfig>);
    console.log('[NetStore] Setting state with:', { 
      configInterfaces: interfaces.length, 
      windowMode: (modeParam as any) || (mode as 'settings' | 'widget')
    });
    
    set({
      config: normalizedConfig,
      interfaces,
      speeds: speeds as Record<string, InterfaceSpeed>,
      // Only use GetWindowMode() if no URL param was found (fallback for v2)
      windowMode: (modeParam as any) || (mode as 'settings' | 'widget'),
      isLoading: false,
      errorMessage: null,
    });

    // Listen for window mode from Go
    const bridge = (window as any).runtime?.EventsOn;
    if (bridge) {
      console.log('[NetStore] Setting up runtime event listeners');
      bridge('mode:set', (mode: 'settings' | 'widget') => {
        console.log('[NetStore] Received mode:set event:', mode);
        set({ windowMode: mode });
      });

      bridge('config:updated', (newConfig: AppConfig) => {
        console.log('[NetStore] Received config:updated event');
        set({ config: newConfig });
        get().applyTheme();
        
        if (get().windowMode === 'widget') {
          void updateWidgetPosition(newConfig.widgetX, newConfig.widgetY);
        }
      });
    }

    // Initial theme application
    console.log('[NetStore] Applying initial theme');
    get().applyTheme();
  },

  async fetchSpeeds() {
    try {
      const speeds = await GetSpeeds();
      set({
        speeds: speeds as Record<string, InterfaceSpeed>,
        errorMessage: null,
      });
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Unable to refresh network speeds.',
      });
    }
  },

  async fetchInterfaces() {
    try {
      const interfaces = await ListInterfaces();
      set({
        interfaces,
        errorMessage: null,
      });
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Unable to refresh interfaces.',
      });
    }
  },

  async fetchConfig() {
    try {
      const configValue = await GetConfig();
      const normalizedConfig = normalizeConfig(configValue as Partial<AppConfig>);
      set({
        config: normalizedConfig,
      });

      // If we are the widget, we might need to update our own window position
      if (get().windowMode === 'widget') {
        void updateWidgetPosition(normalizedConfig.widgetX, normalizedConfig.widgetY);
      }
    } catch (error) {
      // Ignore silent errors for background polling
    }
    get().applyTheme();
  },

  applyTheme() {
    const { theme, appPreset } = get().config;
    const root = window.document.documentElement;

    // Clear previous themes
    root.classList.remove('light', 'dark');
    appPresets.forEach((preset) => {
      root.classList.remove(`theme-${preset.id}`);
    });

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Add preset class
    root.classList.add(`theme-${appPreset}`);
  },

  async updateConfig(partial) {
    const nextConfig = normalizeConfig({
      ...get().config,
      ...partial,
    });

    set({
      config: nextConfig,
      errorMessage: null,
    });

    try {
      await saveConfig(nextConfig);
      
      // If widget is currently active, refresh its position if the position changed
      if (get().windowMode === 'widget' && (partial.widgetX !== undefined || partial.widgetY !== undefined)) {
        void get().switchToWidget();
      }
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Unable to save settings.',
      });
    }
  },
  async switchToWidget() {
    const bridge = (window as any).go?.main?.App?.ShowWidget;
    if (bridge) {
      await bridge();
      set({ windowMode: 'widget' });
    }
  },
  async switchToSettings() {
    const bridge = (window as any).go?.main?.App?.ShowSettings;
    if (bridge) {
      await bridge();
      set({ windowMode: 'settings' });
    }
  },
}));
