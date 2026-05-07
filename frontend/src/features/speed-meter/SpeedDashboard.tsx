import { formatTimestamp, formatTransferRate } from './formatters';
import { useNetworkSpeed } from './useNetworkSpeed';

export function SpeedDashboard() {
  const { sample, errorMessage } = useNetworkSpeed();

  const download = formatTransferRate(sample?.downloadBytesPerSecond ?? 0);
  const upload = formatTransferRate(sample?.uploadBytesPerSecond ?? 0);

  const connectionStatus = errorMessage
    ? 'Monitor needs attention'
    : sample
      ? 'Live'
      : 'Connecting';

  const connectionClassName = errorMessage
    ? 'status-error'
    : sample
      ? 'status-live'
      : 'status-idle';

  const activeInterfaces = sample?.interfaceNames.length
    ? sample.interfaceNames.join(', ')
    : 'Detecting active adapters';

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="hero-panel">
          <p className="eyebrow">Desktop Network Meter</p>
          <h1 className="hero-title">Live upload and download speed.</h1>
          <p className="hero-copy">
            This app reads your device&apos;s current network activity and turns it into a simple,
            continuously updating speed display. No speed test is running here, just your real-time traffic.
          </p>
        </header>

        <section className="stats-grid" aria-label="Current network speed">
          <article className="speed-card speed-card-download">
            <p className="speed-card-label">Download</p>
            <div className="speed-card-value">
              <span className="speed-card-number">{download.value}</span>
              <span className="speed-card-unit">{download.unit}</span>
            </div>
            <p className="speed-card-note">Current receive rate across active network interfaces.</p>
          </article>

          <article className="speed-card speed-card-upload">
            <p className="speed-card-label">Upload</p>
            <div className="speed-card-value">
              <span className="speed-card-number">{upload.value}</span>
              <span className="speed-card-unit">{upload.unit}</span>
            </div>
            <p className="speed-card-note">Current send rate across active network interfaces.</p>
          </article>
        </section>

        <section className="status-panel" aria-label="Monitor status">
          <div>
            <p className="status-block-label">Status</p>
            <p className={`status-block-value ${connectionClassName}`}>{connectionStatus}</p>
          </div>

          <div>
            <p className="status-block-label">Last Updated</p>
            <p className="status-block-value">{formatTimestamp(sample?.sampledAt ?? null)}</p>
          </div>

          <div>
            <p className="status-block-label">Interfaces</p>
            <p className="status-block-value">{activeInterfaces}</p>
          </div>
        </section>

        {errorMessage ? (
          <section className="status-panel" aria-label="Monitor error">
            <div>
              <p className="status-block-label">Error</p>
              <p className="status-block-value status-error">{errorMessage}</p>
            </div>
            <div>
              <p className="status-block-label">What It Means</p>
              <p className="status-block-value">
                The app could not read usable interface data. This can happen when no network adapter is active yet.
              </p>
            </div>
            <div>
              <p className="status-block-label">Next Step</p>
              <p className="status-block-value">Connect to a network and the live meter should recover automatically.</p>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
