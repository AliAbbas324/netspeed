# Master Prompt: Network Speed Monitor Desktop App
> Copy this entire prompt and paste it to your coding agent at the start of the project.

---

## Project Overview

You are building a **desktop network speed monitor app** called **NetSpeed** using:
- **Wails v2** (Go backend + web frontend)
- **React + TypeScript** (frontend)
- **Tailwind CSS v4**
- **shadcn/ui**

The app shows real-time upload/download speeds in a system tray and/or a floating always-on-top widget. Work through this project **phase by phase**. Do not jump ahead. Complete and verify each phase before moving to the next.

---

## Ground Rules for the Agent

- **One phase at a time.** After each phase, stop and summarize what was built and what the next phase is. Wait for approval before continuing.
- **Verify before proceeding.** At the end of each phase, list what should be manually tested.
- **Never silently skip steps.** If something is blocked or unclear, say so explicitly.
- **Commit-ready code only.** Every phase should leave the codebase in a runnable state.
- **Prefer explicit over magic.** Comment non-obvious Go or Wails-specific code.

---

## Project Structure to Create

```
netspeed/
├── main.go                        # Wails entry point, window config, tray
├── app.go                         # App struct exposed to frontend via Wails
├── internal/
│   ├── netmon/
│   │   └── monitor.go             # Network polling, speed calculation
│   ├── config/
│   │   └── config.go              # Settings persistence (JSON)
│   └── tray/
│       └── icon.go                # Dynamic tray icon bitmap renderer
└── frontend/
    ├── src/
    │   ├── windows/
    │   │   ├── widget/
    │   │   │   └── Widget.tsx     # Floating overlay widget
    │   │   └── settings/
    │   │       └── Settings.tsx   # Main settings window
    │   ├── components/            # Shared UI components
    │   ├── stores/
    │   │   └── useNetStore.ts     # Zustand store for speed + settings state
    │   └── main.tsx
    └── wailsjs/                   # Auto-generated — do not edit manually
```

---

## Phase 1 — Project Bootstrap & Go Backend Foundation

**Goal:** Runnable Wails app with a working network monitor in Go.

### Tasks

1. **Initialize Wails project**
   ```bash
   wails init -n netspeed -t react-ts
   ```

2. **Install Go dependency**
   ```bash
   go get github.com/shirou/gopsutil/v3/net
   ```

3. **Create `internal/netmon/monitor.go`**
   - Define a `Monitor` struct with a polling interval (default 1 second).
   - On each tick, read `net.IOCounters(true)` to get per-interface byte counts.
   - Calculate speed: `speed = (current_bytes - previous_bytes) / interval_seconds`
   - Filter out loopback (`lo`, `Loopback Pseudo-Interface`) and zero-traffic interfaces.
   - Expose a `GetSpeeds() map[string]InterfaceSpeed` method where `InterfaceSpeed` contains `DownloadBps float64` and `UploadBps float64`.
   - Expose a `ListInterfaces() []string` method.
   - Start/stop the polling loop with `Start()` and `Stop()`.

4. **Create `internal/config/config.go`**
   - Define a `Config` struct (see full field list in Phase 4).
   - For now include only: `SelectedInterface string`, `PollIntervalMs int`.
   - Load from / save to `{os.UserConfigDir()}/netspeed/config.json`.
   - Provide `Load()` and `Save()` functions with sensible defaults.

5. **Wire up `app.go`**
   - Create `App` struct holding a `*netmon.Monitor` and `*config.Config`.
   - Expose these methods to the frontend (Wails will generate bindings):
     - `GetSpeeds() map[string]netmon.InterfaceSpeed`
     - `ListInterfaces() []string`
     - `GetConfig() config.Config`
   - Call `monitor.Start()` in the `startup` lifecycle hook.
   - Call `monitor.Stop()` in the `shutdown` lifecycle hook.

6. **Update `main.go`**
   - Create a single main window (settings window for now), 900×600, centered, titled "NetSpeed".

### Verify (manual test checklist)
- [ ] `wails dev` starts without errors
- [ ] Open browser console, call `window.go.main.App.GetSpeeds()` — returns speed data
- [ ] Call `window.go.main.App.ListInterfaces()` — returns interface names
- [ ] Download/upload some data, confirm the numbers change

---

## Phase 2 — Settings Window UI

**Goal:** A working settings page that reads live data and lets the user configure the app.

### Tasks

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install zustand
   npx shadcn@latest init   # choose default style, use CSS variables
   npx shadcn@latest add slider switch select card label separator
   ```

2. **Create `stores/useNetStore.ts`** (Zustand)
   - State: `speeds`, `interfaces`, `config`, `isLoading`
   - Actions: `fetchSpeeds()`, `fetchInterfaces()`, `updateConfig(partial)`
   - Poll `fetchSpeeds()` every 1000ms using `setInterval` in a `useEffect` inside the store initializer.

3. **Create `windows/settings/Settings.tsx`**
   Include these sections:

   **Live Speed Display**
   - Shows current download ↓ and upload ↑ speed in auto-scaled units (B/s, KB/s, MB/s, GB/s).

   **Interface Selection**
   - Dropdown listing available interfaces + "All (combined)" option.
   - On change, call `updateConfig({ selectedInterface })`.

   **Display Options** (UI only for now, wired up in Phase 5)
   - Toggle: Show in system tray
   - Toggle: Show widget overlay
   - Select: Show download only / upload only / both
   - Slider: Poll interval (500ms – 5000ms, step 500ms)

   **Widget Customization** (UI only for now, wired up in Phase 3)
   - Slider: Font size (10–32px)
   - Color picker or shadcn input: Text color (hex)
   - Slider: Background opacity (0–100%)
   - Slider: Overall widget opacity (0–100%)

4. **Wire settings to backend**
   - On settings change, call `window.go.main.App.SaveConfig(config)` (add this method to `app.go`).
   - On app load, call `GetConfig()` to restore persisted settings.

### Verify
- [ ] Live speed updates every second in the UI
- [ ] Changing interface dropdown filters the speeds shown
- [ ] Sliders move without errors
- [ ] Settings persist after restarting the app (`wails dev`)

---

## Phase 3 — Floating Widget Window

**Goal:** An always-on-top, frameless, transparent, draggable speed overlay.

### Tasks

1. **Add widget window in `main.go`**
   ```go
   widgetWindow := app.NewWebviewWindowWithOptions(options.WebviewWindow{
       Title:           "NetSpeed Widget",
       Width:           200,
       Height:          80,
       AlwaysOnTop:     true,
       Frameless:       true,
       BackgroundType:  options.BackgroundTypeTransparent,
       URL:             "/widget",   // see step 2
       DisableResize:   false,
       Hidden:          false,
   })
   ```
   > **Note for agent:** Wails v2 does not support multiple HTML URLs per binary natively. Use one of these two approaches and pick the simpler one:
   > - **Option A (Recommended):** Serve the widget as a query param (`/?window=widget`) and render different components based on `window.location.search`.
   > - **Option B:** Use Wails window name/ID to emit events and conditionally render.
   > Document which approach you chose and why.

2. **Create `windows/widget/Widget.tsx`**
   - Polls speed from the Zustand store (shared state).
   - Renders download ↓ and/or upload ↑ based on config's display mode.
   - Applies: font size, text color, background color + opacity, overall opacity from config.
   - Shows a drag handle region using `--wails-draggable: drag` CSS property on the outer div.
   - Shows a subtle close/hide button on hover (calls Wails to hide the window, not close it).

3. **Implement drag-to-reposition persistence**
   - After the user stops dragging, capture the window's new X/Y position.
   - Call a new backend method `App.SaveWidgetPosition(x, y int)` which stores it in config.
   - On widget window startup, call `App.GetWidgetPosition()` and restore position using `runtime.WindowSetPosition`.

4. **Widget styling rules**
   - Outer container: `background: rgba(0,0,0,{opacity})` driven by config.
   - Text: configurable color and font size.
   - Minimum width: auto-sized to content, no fixed width.
   - Border radius: 8px.
   - Padding: 8px 12px.

### Verify
- [ ] Widget window appears on screen as a small floating overlay
- [ ] Widget is always on top of other windows
- [ ] Widget is draggable and position saves on next launch
- [ ] Speed values update every second in the widget
- [ ] Widget background opacity slider in settings affects the widget live

---

## Phase 4 — System Tray Integration

**Goal:** Show live speed in the system tray. Handle the cross-platform tray text problem.

### Tasks

1. **Understand the platform constraint before coding**
   - **macOS**: Supports tray title text — use `systray.SetTitle(text)`.
   - **Windows**: Does NOT support text in the tray label natively. You must render the speed text onto a small PNG bitmap (16×16 or 32×32) and set it as the tray icon dynamically.
   - **Linux**: Use `systray.SetTitle(text)` — works on most DEs, may vary.

2. **Create `internal/tray/icon.go`**
   - Implement `RenderTextToIcon(text string) []byte`:
     - Create an `image.RGBA` (32×32).
     - Use `golang.org/x/image/font` + embedded truetype font (embed a small `.ttf` using `//go:embed`) to draw the text.
     - Encode to PNG bytes.
     - Return the bytes.
   - Keep the font file small (subset if possible). A free monospace font works best for numbers.
   - Install: `go get golang.org/x/image`

3. **Wire tray in `main.go`**
   - Use Wails' built-in tray support (`options.SystemTray`).
   - Start a goroutine that every 1 second:
     - Gets current speeds from the monitor.
     - Formats a string like `↓2.3M ↑1.1M` (abbreviated to fit).
     - On macOS/Linux: calls `runtime.MenuSetLabel` or tray title API.
     - On Windows: calls `RenderTextToIcon(text)` and updates the tray icon.
   - Add a tray menu with items:
     - "Show Settings" — focuses/shows the settings window
     - "Show Widget" / "Hide Widget" — toggles widget window visibility
     - Separator
     - "Quit"

4. **Add `ShowTray` and `ShowWidget` booleans to `Config`**
   - On startup, respect these flags when deciding whether to show the tray and widget.

### Verify
- [ ] Tray icon appears in the system tray
- [ ] Numbers update every second in the tray
- [ ] "Show Settings" tray menu item opens/focuses the settings window
- [ ] "Show/Hide Widget" toggles the floating widget
- [ ] "Quit" exits the app cleanly

---

## Phase 5 — Full Config Schema & Settings Wiring

**Goal:** All settings are fully functional end-to-end.

### Final `Config` struct in `config.go`

```go
type Config struct {
    // Interface
    SelectedInterface string `json:"selectedInterface"`
    PollIntervalMs    int    `json:"pollIntervalMs"`

    // Display mode
    ShowDownload bool `json:"showDownload"`
    ShowUpload   bool `json:"showUpload"`

    // Tray
    ShowTray bool `json:"showTray"`

    // Widget
    ShowWidget      bool    `json:"showWidget"`
    WidgetX         int     `json:"widgetX"`
    WidgetY         int     `json:"widgetY"`
    WidgetFontSize  int     `json:"widgetFontSize"`
    WidgetTextColor string  `json:"widgetTextColor"`
    WidgetBgOpacity float64 `json:"widgetBgOpacity"`
    WidgetOpacity   float64 `json:"widgetOpacity"`

    // Startup
    StartOnLogin    bool `json:"startOnLogin"`
    StartMinimized  bool `json:"startMinimized"`
}
```

### Tasks

1. Wire every settings control from Phase 2 to the config store and backend.
2. When `showDownload` / `showUpload` changes, update both the widget and the tray display immediately.
3. When `pollIntervalMs` changes, restart the monitor with the new interval.
4. When `showWidget` toggles, show/hide the widget window via Wails runtime.
5. When `showTray` toggles, show/hide the tray icon.
6. Implement **"Start on Login"** toggle:
   - **Windows**: Write/delete a registry key at `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\NetSpeed`.
   - **macOS**: Write/delete a LaunchAgent plist at `~/Library/LaunchAgents/com.netspeed.app.plist`.
   - Abstract behind `config.SetStartOnLogin(enabled bool) error` in `config.go`.
7. Implement **"Start Minimized"**: if true, hide the settings window on startup (widget and tray still show).

### Verify
- [ ] All sliders and toggles affect the UI in real time
- [ ] Settings survive app restart
- [ ] Show/hide widget toggle works from settings AND from tray menu
- [ ] Start on login registers correctly (test by restarting the machine or checking registry/LaunchAgents)

---

## Phase 6 — Polish, Edge Cases & Distribution Prep

**Goal:** Production-quality finish. Handle edge cases. Prepare for building a distributable.

### Tasks

1. **Zero-state handling**
   - When speed is 0 B/s, display `—` or `0 B/s` (make this a config option).
   - When no network interface is found, show a friendly error in the settings window.

2. **Unit scaling**
   - Implement a shared `formatSpeed(bps float64) string` utility (frontend and tray format separately).
   - Auto-scale: B/s → KB/s → MB/s → GB/s at appropriate thresholds.
   - Show 1 decimal place for values ≥ 10, 2 decimal places for values < 10.

3. **Widget minimum size**
   - Ensure widget doesn't shrink to zero when "show both" is disabled for one metric.

4. **Tray icon on Windows — font edge cases**
   - Handle text overflow: if speed string is too long (e.g., "↓100.0M"), abbreviate to fit 32×32.
   - Test with speeds in the GB/s range.

5. **Settings window UX**
   - Add a "Reset to Defaults" button that resets config to defaults and reloads the UI.
   - Add tooltips (shadcn `Tooltip`) on non-obvious settings.

6. **Build configuration**
   - Update `wails.json` with correct app name, version, and icon.
   - Create a `build/` directory with platform-specific app icons:
     - Windows: `.ico` (256×256)
     - macOS: `.icns`
     - Linux: `.png` (512×512)
   - Test production build: `wails build`

7. **README**
   - Write a brief `README.md` with: prerequisites, how to run in dev mode, how to build.

### Verify
- [ ] `wails build` produces a working binary
- [ ] App icon appears correctly in taskbar/dock
- [ ] No console errors in production build
- [ ] Test on target OS(es)

---

## Key Technical Reminders for the Agent

| Topic | Guidance |
|---|---|
| Wails bindings | Run `wails dev` after adding new Go methods — bindings in `wailsjs/` are auto-regenerated |
| Multi-window in Wails v2 | Use `runtime.WindowShow`, `runtime.WindowHide`, `runtime.WindowSetPosition` from Go side |
| Transparent window on Windows | Requires `BackgroundType: options.BackgroundTypeTransparent` — test early |
| Tray icon text (Windows) | Must be a bitmap — do NOT attempt to set text as title on Windows |
| Config file location | Always use `os.UserConfigDir()` — never hardcode paths |
| Cross-platform build | Use `runtime.GOOS` checks for OS-specific code (tray text, start-on-login) |
| Wails events | Use `runtime.EventsEmit(ctx, "speed:update", data)` to push from Go → frontend instead of polling when latency matters |

---

## Start Here

Begin with **Phase 1**. Initialize the project, build the Go network monitor, confirm speeds are readable from the frontend console, then report back with results before proceeding to Phase 2.