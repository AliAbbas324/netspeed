export interface NetworkSpeedSample {
  downloadBytesPerSecond: number;
  uploadBytesPerSecond: number;
  totalBytesReceived: number;
  totalBytesSent: number;
  interfaceCount: number;
  interfaceNames: string[];
  sampledAt: string;
}

export interface SpeedState {
  sample: NetworkSpeedSample | null;
  errorMessage: string | null;
}
