import { create } from 'zustand';
import { GetConfig, GetState, SaveConfig } from '../lib/backend';
import type { AppConfig, BackendState, InterfaceSpeed } from '../lib/contracts';

interface NetStoreState {
  speeds: Record<string, InterfaceSpeed>;
  interfaces: string[];
  sampledAt: string | null;
  config: AppConfig;
  isLoading: boolean;
  errorMessage: string | null;
  initialize: () => Promise<void>;
  refreshState: () => Promise<void>;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  applyTheme: () => void;
}

let systemColorSchemeListenerAttached = false;

function attachSystemColorSchemeListener(getState: () => NetStoreState) {
  if (typeof window === 'undefined' || systemColorSchemeListenerAttached) {
    return;
  }
  systemColorSchemeListenerAttached = true;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    if (getState().config.theme === 'system') {
      getState().applyTheme();
    }
  });
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
  titleBarLogoRoundedCorners: true,
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

let pollHandle: number | null = null;
let initRetryHandle: number | null = null;

function normalizeConfig(value: Partial<AppConfig> | null | undefined): AppConfig {
  const merged: AppConfig = {
    ...defaultConfig,
    ...value,
  };
  if (typeof merged.titleBarLogoRoundedCorners !== 'boolean') {
    merged.titleBarLogoRoundedCorners = defaultConfig.titleBarLogoRoundedCorners;
  }
  return merged;
}

function startPolling(refreshState: () => Promise<void>, intervalMs: number) {
  if (pollHandle !== null) {
    window.clearInterval(pollHandle);
  }

  const safeInterval = Math.max(500, intervalMs || defaultConfig.pollIntervalMs);
  pollHandle = window.setInterval(() => {
    void refreshState();
  }, safeInterval);
}

function scheduleInitializeRetry(initialize: () => Promise<void>) {
  if (initRetryHandle !== null) {
    return;
  }

  initRetryHandle = window.setTimeout(() => {
    initRetryHandle = null;
    void initialize();
  }, 500);
}

function applyBackendState(
  backendState: BackendState,
  currentConfig: AppConfig,
): Pick<NetStoreState, 'speeds' | 'interfaces' | 'sampledAt' | 'errorMessage'> & {
  config?: AppConfig;
} {
  const interfaces = Array.isArray(backendState.interfaces) ? backendState.interfaces : [];
  const speeds = backendState.speeds ?? {};
  const nextState: Pick<NetStoreState, 'speeds' | 'interfaces' | 'sampledAt' | 'errorMessage'> & {
    config?: AppConfig;
  } = {
    speeds,
    interfaces,
    sampledAt: backendState.sampledAt || null,
    errorMessage: backendState.errorMessage || null,
  };

  if (currentConfig.selectedInterface && !interfaces.includes(currentConfig.selectedInterface)) {
    nextState.config = {
      ...currentConfig,
      selectedInterface: '',
    };
  }

  return nextState;
}

export const useNetStore = create<NetStoreState>((set, get) => ({
  speeds: {},
  interfaces: [],
  sampledAt: null,
  config: defaultConfig,
  isLoading: true,
  errorMessage: null,

  async initialize() {
    try {
      const [configValue, backendState] = await Promise.all([
        GetConfig(),
        GetState(),
      ]);

      const normalizedConfig = normalizeConfig(configValue);
      set({
        config: normalizedConfig,
        isLoading: false,
        ...applyBackendState(backendState, normalizedConfig),
      });

      get().applyTheme();
      attachSystemColorSchemeListener(get);
      startPolling(get().refreshState, normalizedConfig.pollIntervalMs);
    } catch (error) {
      set({
        isLoading: true,
        errorMessage: null,
      });
      scheduleInitializeRetry(get().initialize);
      console.warn('[NetStore] backend not ready yet', error);
    }
  },

  async refreshState() {
    try {
      const backendState = await GetState();
      const currentConfig = get().config;
      set({
        isLoading: false,
        ...applyBackendState(backendState, currentConfig),
      });
    } catch (error) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Unable to refresh network speeds.',
      });
    }
  },

  async updateConfig(partial) {
    const previousConfig = get().config;
    const nextConfig = normalizeConfig({
      ...previousConfig,
      ...partial,
    });

    set({
      config: nextConfig,
      errorMessage: null,
    });
    get().applyTheme();

    if (previousConfig.pollIntervalMs !== nextConfig.pollIntervalMs) {
      startPolling(get().refreshState, nextConfig.pollIntervalMs);
    }

    try {
      const savedConfig = await SaveConfig(nextConfig);
      const normalizedConfig = normalizeConfig(savedConfig);
      set({
        config: normalizedConfig,
      });
      get().applyTheme();

      if (nextConfig.pollIntervalMs !== normalizedConfig.pollIntervalMs) {
        startPolling(get().refreshState, normalizedConfig.pollIntervalMs);
      }
    } catch (error) {
      set({
        config: previousConfig,
        errorMessage: error instanceof Error ? error.message : 'Unable to save settings.',
      });
      get().applyTheme();

      if (previousConfig.pollIntervalMs !== nextConfig.pollIntervalMs) {
        startPolling(get().refreshState, previousConfig.pollIntervalMs);
      }
    }
  },

  applyTheme() {
    const { theme, appPreset } = get().config;
    const root = window.document.documentElement;

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

    root.classList.add(`theme-${appPreset}`);
  },
}));
