const SPEED_UNITS = ['B/s', 'KB/s', 'MB/s', 'GB/s'];

export function formatTransferRate(bytesPerSecond: number) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) {
    return {
      value: '0.00',
      unit: 'B/s',
    };
  }

  let size = bytesPerSecond;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < SPEED_UNITS.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return {
    value: size >= 100 ? size.toFixed(0) : size.toFixed(2),
    unit: SPEED_UNITS[unitIndex],
  };
}

export function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return 'Waiting for data';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Waiting for data';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
