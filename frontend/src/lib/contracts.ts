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
  /** When true, the settings window title bar logo uses rounded corners; when false, square corners. */
  titleBarLogoRoundedCorners: boolean;
  theme: 'light' | 'dark' | 'system';
  appPreset: string;
  widgetPreset: string;
}

export interface BackendState {
  speeds: Record<string, InterfaceSpeed>;
  interfaces: string[];
  errorMessage: string;
  sampledAt: string;
  interfaceCount: number;
  downloadBytesPerSecond: number;
  uploadBytesPerSecond: number;
}
