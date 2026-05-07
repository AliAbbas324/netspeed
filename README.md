# Speed Meter

Desktop app for Windows and Linux that shows the device's current network upload and download speed in real time.

## Current Scope

- Read live network interface activity from the local machine
- Show current download speed
- Show current upload speed
- Stream updates from Go to the React UI through Wails events

This app does not run a speed test. It displays the traffic your device is using right now.

## Stack

- Wails v2
- Go
- React
- TypeScript
- Vite

## Project Structure

- `main.go`
  Wails bootstrap and window configuration.
- `app.go`
  Application lifecycle and event wiring.
- `internal/models`
  Shared Go-side domain models.
- `internal/services/networkmonitor`
  Background service that samples network counters and computes live speeds.
- `frontend/src/features`
  Frontend feature modules.
- `frontend/src/components`
  Shared UI components when we add them.
- `frontend/src/lib`
  Shared frontend utilities when we add them.

## Development

Run the desktop app in development mode:

```bash
wails dev
```

On Linux Mint 22 / Ubuntu 24.04 style systems, the project defaults to the `webkit2_41`
Wails build tag through `wails.json`, so you do not need to pass it manually.

Build the frontend only:

```bash
cd frontend
npm run build
```

Run Go checks:

```bash
go test ./...
```

## Architecture Notes

- Go owns network sampling and desktop-aware behavior.
- React owns presentation and interaction.
- The frontend listens to Wails runtime events instead of polling through repeated bridge calls.
- The first monitor implementation aggregates traffic across all active non-loopback interfaces.

## Next Good Steps

- Choose the first product features from your master prompt
- Add unit tests around rate calculation and interface filtering
- Add settings for refresh rate and interface selection
- Add system tray and background monitoring behavior
