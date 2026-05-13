export interface BackendSpeed {
  downloadBps: number;
  uploadBps: number;
}

export interface BackendState {
  speeds: Record<string, BackendSpeed>;
  interfaces: string[];
  errorMessage: string;
  sampledAt: string;
  interfaceCount: number;
  downloadBytesPerSecond: number;
  uploadBytesPerSecond: number;
}

type GoAppBridge = {
  GetConfig?: () => Promise<unknown>;
  SaveConfig?: (config: unknown) => Promise<unknown>;
  GetState?: () => Promise<BackendState>;
  UpdateWindowSize?: (width: number, height: number) => Promise<unknown>;
};

function getBridge(): GoAppBridge | null {
  const root = window as Window & {
    go?: {
      main?: {
        App?: GoAppBridge;
      };
    };
  };

  return root.go?.main?.App ?? null;
}

function requireMethod<T extends keyof GoAppBridge>(name: T): NonNullable<GoAppBridge[T]> {
  const bridge = getBridge();
  const method = bridge?.[name];
  if (!method) {
    throw new Error(`Wails bridge method '${String(name)}' is not available.`);
  }
  return method as NonNullable<GoAppBridge[T]>;
}

export async function GetConfig(): Promise<unknown> {
  return requireMethod('GetConfig')();
}

export async function SaveConfig(config: unknown): Promise<unknown> {
  return requireMethod('SaveConfig')(config);
}

export async function GetState(): Promise<BackendState> {
  return requireMethod('GetState')();
}

export async function UpdateWindowSize(width: number, height: number): Promise<unknown> {
  const bridge = getBridge();
  const method = bridge?.UpdateWindowSize;
  if (!method) {
    return null;
  }
  return method(width, height);
}
