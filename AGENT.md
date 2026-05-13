# AGENT.md — NetSpeed Project Tracker

> This file is the agent's source of truth. Update it after every task, every phase, and every decision made. Never leave it stale.

---

## How to Use This File

- Before starting any work → read this file top to bottom.
- After completing any task → mark it `[x]` and add a short note if relevant.
- After completing a phase → update the phase status and fill in the Phase Log.
- When making a non-obvious decision → record it in the Decisions Log.
- When hitting a blocker → record it in the Blockers section and stop.
- When a phase is approved by the user → mark it approved and move on.

---

## Project Overview

| Field | Value |
|---|---|
| **App name** | NetSpeed |
| **Stack** | Wails v2, Go, React, TypeScript, Tailwind CSS v4, shadcn/ui |
| **State management** | Zustand |
| **Target platforms** | Windows, macOS (Linux best-effort) |
| **Config** | `{os.UserConfigDir()}/netspeed/config.json` |
| **Master prompt** | `netspeed-agent-prompt.md` |

---

## Overall Progress

```
Phase 1  [ ] Bootstrap & Go Backend
Phase 2  [ ] Settings Window UI
Phase 3  [ ] Integration & System Tray (Revised)
Phase 4  [ ] Polish & Distribution
```

**Current phase:** Phase 1: Bootstrap & Go Backend Foundation  
**Last updated:** 2026-05-13  
**Last action taken:** Verified Phase 1 backend/build state, aligned the main window to `900x600` and centered-on-load, and marked completed code tasks.

---

## Phase 1 — Bootstrap & Go Backend Foundation

**Status:** `[ ] Not started` | `[x] In progress` | `[ ] Done` | `[ ] Approved`

### Tasks

- [x] `wails init -n netspeed -t react-ts` — project initialized
- [x] `go get github.com/shirou/gopsutil/v3/net` — dependency installed
- [x] `internal/netmon/monitor.go` created
  - [x] `Monitor` struct with polling interval
  - [x] Per-interface byte counter diff logic
  - [x] Loopback / virtual interface filtering
  - [x] `GetSpeeds() map[string]InterfaceSpeed` method
  - [x] `ListInterfaces() []string` method
  - [x] `Start()` and `Stop()` methods
- [x] `internal/config/config.go` created (initial fields only)
  - [x] `SelectedInterface string`
  - [x] `PollIntervalMs int`
  - [x] `Load()` with defaults
  - [x] `Save()` to `os.UserConfigDir()`
- [x] `app.go` created
  - [x] `GetSpeeds()` exposed to frontend
  - [x] `ListInterfaces()` exposed to frontend
  - [x] `GetConfig()` exposed to frontend
  - [x] `monitor.Start()` in startup hook
  - [x] `monitor.Stop()` in shutdown hook
- [x] `main.go` updated — single settings window, 900×600, centered

### Manual Test Checklist
- [ ] `wails dev` starts without errors
- [ ] `window.go.main.App.GetSpeeds()` returns speed data in browser console
- [ ] `window.go.main.App.ListInterfaces()` returns interface names
- [ ] Numbers change when download/upload activity is generated

### Notes
- Reset baseline re-established on 2026-05-12. Treat all phases as not started for new implementation cycle.
- Automated verification completed on 2026-05-13 with `go test ./internal/...`, `go test -run TestDoesNotExist .`, and `wails build`.
- Phase 1 code tasks are complete. The phase remains in progress until the manual `wails dev` checks above are confirmed in the running app.

---

## Phase 2 — Settings Window UI

**Status:** `[ ] Not started` | `[ ] In progress` | `[x] Done` | `[x] Approved`

### Tasks

- [x] Frontend dependencies installed
  - [x] `zustand`
  - [x] `shadcn/ui` initialized
  - [x] shadcn components added: `slider switch select card label separator`
- [x] `stores/useNetStore.ts` created
  - [x] State: `speeds`, `interfaces`, `config`, `isLoading`
  - [x] Actions: `fetchSpeeds()`, `fetchInterfaces()`, `updateConfig(partial)`
  - [x] Auto-polling every 1000ms via `setInterval`
- [x] `windows/settings/Settings.tsx` created
  - [x] Live speed display (auto-scaled units)
  - [x] Interface selection dropdown
  - [x] Toggle: Show in system tray
  - [x] Toggle: Show widget overlay
  - [x] Select: Download only / Upload only / Both
  - [x] Slider: Poll interval (500ms–5000ms)
  - [x] Slider: Font size (10–32px)
  - [x] Text input: Widget text color (hex)
  - [x] Slider: Background opacity (0–100%)
  - [x] Slider: Overall widget opacity (0–100%)
- [x] `App.SaveConfig(config)` method added to `app.go`
- [x] Settings load from backend on app start
- [x] Settings persist to backend on change

### Manual Test Checklist
- [x] Live speed updates every second in the UI
- [x] Changing interface dropdown filters the speeds shown
- [x] All sliders and toggles render without errors
- [x] Settings survive `wails dev` restart

### Notes
- The settings window is implemented and verified with a frontend production build.
- ~~`shadcn/ui` is still not scaffolded locally, so the current Phase 2 controls use lightweight local inputs instead of shadcn primitives.~~ Resolved: all controls now use shadcn/ui components (Card, Select, Switch, Slider, Label, Separator).
- Go compile checks passed with `env GOCACHE=/tmp/go-build-cache go test ./internal/...` and `env GOCACHE=/tmp/go-build-cache go test -run TestDoesNotExist .`.
- `Settings.css` and `App.css` have been deleted — all styling is now via Tailwind utility classes.
- `index.css` now contains the full shadcn dark theme (CSS custom properties) with a deep navy/slate palette and sky-blue primary accent.
- `main.tsx` now imports `@fontsource-variable/inter` for the Inter variable font.
- `lucide-react` icons (ArrowDown, ArrowUp, Wifi, Settings2, Palette, Info) are used for visual cues in section headers.

---

## Phase 3 — Integration & System Tray (Revised)

**Status:** `[ ] Not started` | `[ ] In progress` | `[x] Done` | `[ ] Approved`

### Tasks

- [x] **System Tray Support**
  - [x] Implement `TrayMenu` in `main.go`
  - [x] Add tray icon (`build/appicon.png`)
  - [x] Handle "Show Settings", "Toggle Widget", and "Exit" in tray
- [x] **Background Operation**
  - [x] Implement "Close to Tray" (hide main window on X)
  - [x] Ensure app only exits via Tray -> Exit
  - [x] Ensure widget stays visible if enabled when main window is hidden
- [x] **Widget Customization**
  - [x] Add `WidgetBgColor` and `WidgetTextOpacity` to `Config`
  - [x] Implement UI controls in `Settings.tsx`
  - [x] Apply new styles in `Widget.tsx`
  - [x] Remove drag functionality from widget (fixed position)
- [x] **Process Management**
  - [x] Ensure tray exit kills both main app and widget process

### Manual Test Checklist
- [ ] Tray icon appears and menu works
- [ ] Main window hides instead of quitting on close
- [ ] Widget is non-draggable and respects all customization settings
- [ ] Exit from tray terminates all processes

### Notes
- This phase merges and revisits previous Phase 3, 4, and 5 goals to provide a polished, background-aware experience.

---

## Phase 4 — System Tray Integration

**Status:** `[ ] Not started` | `[ ] In progress` | `[ ] Done` | `[ ] Approved`

### Tasks

- [ ] `internal/tray/icon.go` created
  - [ ] `RenderTextToIcon(text string) []byte` implemented
  - [ ] Uses `golang.org/x/image/font` for text rendering
  - [ ] Font file embedded via `//go:embed`
  - [ ] Output: 32×32 PNG bytes
  - [ ] Text overflow / abbreviation handled
- [ ] `go get golang.org/x/image` installed
- [ ] Tray wired in `main.go`
  - [ ] Goroutine updating tray every 1 second
  - [ ] Speed string formatted: `↓2.3M ↑1.1M`
  - [ ] macOS/Linux: tray title text set
  - [ ] Windows: tray icon bitmap updated via `RenderTextToIcon`
  - [ ] Tray menu item: "Show Settings"
  - [ ] Tray menu item: "Show Widget" / "Hide Widget" (dynamic label)
  - [ ] Tray menu item: separator
  - [ ] Tray menu item: "Quit"
- [ ] `ShowTray bool` added to `Config`
- [ ] `ShowWidget bool` added to `Config`
- [ ] Startup respects `ShowTray` and `ShowWidget` flags

### Manual Test Checklist
- [ ] Tray icon appears in the system tray
- [ ] Numbers update every second in the tray
- [ ] "Show Settings" opens / focuses the settings window
- [ ] "Show/Hide Widget" toggles the floating widget
- [ ] "Quit" exits the app cleanly
- [ ] App tested on Windows (bitmap icon) OR macOS (text title)

### Notes
<!-- Add any notes, gotchas, or observations from this phase -->

---

## Phase 5 — Full Config Schema & Settings Wiring

**Status:** `[ ] Not started` | `[ ] In progress` | `[ ] Done` | `[ ] Approved`

### Tasks

- [ ] Final `Config` struct fully defined in `config.go`
  - [ ] `SelectedInterface string`
  - [ ] `PollIntervalMs int`
  - [ ] `ShowDownload bool`
  - [ ] `ShowUpload bool`
  - [ ] `ShowTray bool`
  - [ ] `ShowWidget bool`
  - [ ] `WidgetX int`
  - [ ] `WidgetY int`
  - [ ] `WidgetFontSize int`
  - [ ] `WidgetTextColor string`
  - [ ] `WidgetBgOpacity float64`
  - [ ] `WidgetOpacity float64`
  - [ ] `StartOnLogin bool`
  - [ ] `StartMinimized bool`
- [ ] All settings controls wired end-to-end
- [ ] `ShowDownload` / `ShowUpload` change updates widget + tray immediately
- [ ] `PollIntervalMs` change restarts monitor with new interval
- [ ] `ShowWidget` toggle shows/hides widget window via Wails runtime
- [ ] `ShowTray` toggle shows/hides tray icon
- [ ] Start on Login implemented
  - [ ] Windows: registry key at `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\NetSpeed`
  - [ ] macOS: LaunchAgent plist at `~/Library/LaunchAgents/com.netspeed.app.plist`
  - [ ] Abstracted behind `config.SetStartOnLogin(enabled bool) error`
- [ ] Start Minimized: settings window hidden on startup if true

### Manual Test Checklist
- [ ] All sliders and toggles affect the UI in real time
- [ ] All settings survive app restart
- [ ] Show/Hide widget works from both settings page and tray menu
- [ ] Start on Login registers correctly (verified via registry or LaunchAgents)

### Notes
<!-- Add any notes, gotchas, or observations from this phase -->

---

## Phase 6 — Polish & Distribution Prep

**Status:** `[ ] Not started` | `[ ] In progress` | `[ ] Done` | `[ ] Approved`

### Tasks

- [ ] Zero-state handling
  - [ ] Speed 0 B/s displays `—` or `0 B/s` (per config option)
  - [ ] No-interface state shows friendly error in settings
- [ ] `formatSpeed(bps float64) string` utility implemented
  - [ ] Auto-scales: B/s → KB/s → MB/s → GB/s
  - [ ] 2 decimal places for < 10, 1 decimal for ≥ 10
- [ ] Widget minimum size doesn't collapse when one metric is hidden
- [ ] Tray icon (Windows) handles long strings without overflow
- [ ] "Reset to Defaults" button added to settings
- [ ] Tooltips added to non-obvious settings controls
- [ ] `wails.json` updated: app name, version, icon paths
- [ ] App icons created
  - [ ] Windows: `.ico` (256×256)
  - [ ] macOS: `.icns`
  - [ ] Linux: `.png` (512×512)
- [ ] `wails build` succeeds and produces working binary
- [ ] `README.md` written: prerequisites, dev mode, build steps

### Manual Test Checklist
- [ ] `wails build` completes without errors
- [ ] App icon shows correctly in taskbar / dock
- [ ] No console errors in production build
- [ ] App tested end-to-end on target platform(s)

### Notes
<!-- Add any notes, gotchas, or observations from this phase -->

---

## Decisions Log

> Record every significant technical decision here: what was chosen, what was rejected, and why. Future phases depend on these choices.

| # | Phase | Decision | Chosen | Rejected | Reason |
|---|---|---|---|---|---|
| 1 | 2 | Phase 2 control layer | Lightweight local React controls | Blocking the phase on missing shadcn scaffold | The settings flow could be built and verified locally without waiting on component generation. |
| 2 | 2 | shadcn transformation styling | Tailwind utility classes only (delete Settings.css + App.css) | Keep hybrid CSS + Tailwind | Full Tailwind approach is consistent with shadcn conventions and eliminates CSS duplication. |
| 3 | 2 | Font choice | Inter Variable (@fontsource-variable/inter) | Nunito (previous default) | Inter is the standard shadcn/ui font; variable weight provides design flexibility without extra files. |

---

## Blockers

> If you are blocked, stop work, record the blocker here, and report it to the user.

| # | Phase | Blocker | Status |
|---|---|---|---|
| — | — | None currently | — |

---

## File Registry

> Track every file created or modified. Update this as the project grows.

| File | Status | Phase created | Notes |
|---|---|---|---|
| `main.go` | `[x]` | 1 | Wails entry point |
| `app.go` | `[x]` | 1 | App struct + frontend bindings |
| `internal/netmon/monitor.go` | `[x]` | 1 | Network polling |
| `internal/config/config.go` | `[x]` | 1 | Settings persistence |
| `internal/tray/icon.go` | `[ ]` | 4 | Dynamic tray bitmap |
| `frontend/src/stores/useNetStore.ts` | `[x]` | 2 | Zustand store |
| `frontend/src/windows/settings/Settings.tsx` | `[x]` | 2 | Settings UI — fully shadcn/Tailwind |
| `frontend/src/windows/settings/Settings.css` | `[DELETED]` | 2 | Replaced by Tailwind utilities |
| `frontend/src/App.css` | `[DELETED]` | 1 | Unused legacy CSS, removed |
| `frontend/src/index.css` | `[x]` | 2 | shadcn dark theme CSS variables |
| `frontend/src/main.tsx` | `[x]` | 2 | Added Inter font import |
| `frontend/src/components/TitleBar.tsx` | `[x]` | 3 | Custom chrome for frameless window |
| `frontend/src/windows/widget/Widget.tsx` | `[x]` | 3 | Floating overlay |
| `README.md` | `[ ]` | 6 | Project docs |
| `AGENT.md` | `[x]` | — | This file |

---

## Agent Behavior Rules

1. Read this file before every session.
2. Complete one phase at a time. Do not begin Phase N+1 without user approval.
3. Mark tasks `[x]` as they are completed — not before.
4. Record every non-obvious decision in the Decisions Log before implementing it.
5. If blocked, record the blocker and stop. Do not guess through a blocker.
6. Update "Last updated" and "Last action taken" fields after every work session.
7. If the user changes requirements mid-phase, add a note under that phase and update affected tasks.
8. Never delete a completed task entry — cross it out with a note if it was reversed.
