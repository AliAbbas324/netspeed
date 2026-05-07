package main

import (
	_ "embed"
	"log/slog"
	"os"
	"time"

	"speed-meter/internal/config"
	"speed-meter/internal/netmon"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed build/appicon.png
var trayIcon []byte

const (
	speedUpdateEvent = "network:speed.updated"
	speedErrorEvent  = "network:speed.error"
	modeSetEvent     = "mode:set"
)

// App exposes the Go backend services to the Wails frontend.
type App struct {
	logger       *slog.Logger
	monitor      *netmon.Monitor
	config       *config.Config
	
	mainWindow   application.Window
	widgetWindow application.Window

	eventLoopStop chan struct{}
	eventLoopDone chan struct{}
}

// NewApp creates the application root and loads the persisted config.
func NewApp() *App {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config, falling back to defaults", "error", err)
		defaults := config.Default()
		cfg = &defaults
	}

	return &App{
		logger:  logger,
		monitor: netmon.NewMonitor(cfg.PollIntervalMs),
		config:  cfg,
	}
}

// SetWindows saves the window references for management.
func (a *App) SetWindows(main, widget application.Window) {
	a.mainWindow = main
	a.widgetWindow = widget
	
	// Start the event loop after windows are set
	a.monitor.Start()
	a.startEventLoop()
}

// ToggleWidget starts or stops the widget window visibility.
func (a *App) ToggleWidget(show bool) {
	if a.widgetWindow == nil {
		return
	}

	if show {
		a.widgetWindow.Show()
		a.config.ShowWidget = true
		go setSkipTaskbar("NetSpeedWidget", true)
	} else {
		a.widgetWindow.Hide()
		a.config.ShowWidget = false
	}

	if err := config.Save(*a.config); err != nil {
		a.logger.Error("failed to save widget visibility", "error", err)
	}
	application.Get().Event.Emit("config:updated", *a.config)
}

// GetSpeeds returns the latest per-interface transfer rates.
func (a *App) GetSpeeds() map[string]netmon.InterfaceSpeed {
	return a.monitor.GetSpeeds()
}

// ListInterfaces returns the available non-loopback interfaces observed by the monitor.
func (a *App) ListInterfaces() []string {
	return a.monitor.ListInterfaces()
}

// GetConfig returns the latest configuration from disk.
func (a *App) GetConfig() config.Config {
	cfg, err := config.Load()
	if err == nil {
		a.config = cfg
	}
	return *a.config
}

// SaveConfig persists frontend-driven settings updates.
func (a *App) SaveConfig(next config.Config) error {
	if next.ShowWidget != a.config.ShowWidget {
		a.ToggleWidget(next.ShowWidget)
	}

	if err := config.Save(next); err != nil {
		a.logger.Error("failed to save config", "error", err)
		return err
	}

	*a.config = next
	application.Get().Event.Emit("config:updated", next)
	return nil
}

// SetMainWindowFocus allows the settings window to notify Go when it gains or loses focus.
func (a *App) SetMainWindowFocus(focused bool) {
	if focused {
		if a.mainWindow != nil {
			a.mainWindow.Focus()
		}
		if a.config.HideWidgetOnFocus && a.config.ShowWidget && a.widgetWindow != nil {
			a.widgetWindow.Hide()
		}
		return
	}

	if a.config.HideWidgetOnFocus && a.config.ShowWidget && a.widgetWindow != nil {
		a.widgetWindow.Show()
		go setSkipTaskbar("NetSpeedWidget", true)
	}
}

// GetWindowMode returns whether the current window should be a widget or settings.
func (a *App) GetWindowMode() string {
	return "settings"
}

// ShowSettings brings the settings window to the foreground.
func (a *App) ShowSettings() {
	if a.mainWindow == nil {
		return
	}
	if a.mainWindow.IsVisible() {
		a.mainWindow.Focus()
		return
	}
	a.mainWindow.Show()
	a.mainWindow.Focus()
}

// ShowWidget makes the floating widget visible and persists the setting.
func (a *App) ShowWidget() {
	if a.widgetWindow == nil {
		return
	}
	a.widgetWindow.Show()
	a.config.ShowWidget = true
	if err := config.Save(*a.config); err != nil {
		a.logger.Error("failed to save config", "error", err)
	}
	application.Get().Event.Emit("config:updated", *a.config)
	go setSkipTaskbar("NetSpeedWidget", true)
}

// UpdateWindowPosition updates the current window's screen coordinates.
func (a *App) UpdateWindowPosition(x, y int) {
	// Not used in v3 multi-window approach
}

// UpdateWindowSize updates the widget window's dimensions.
func (a *App) UpdateWindowSize(width, height int) {
	if a.widgetWindow != nil {
		a.widgetWindow.SetSize(width, height)
	}
}

// SetWidgetPositionX11 provides an explicit path for X11 position updates.
func (a *App) SetWidgetPositionX11(x, y int) {
	if a.widgetWindow != nil {
		a.widgetWindow.SetPosition(x, y)
	}
}

// SaveWidgetPosition persists the widget's screen coordinates.
func (a *App) SaveWidgetPosition(x, y int) {
	a.config.WidgetX = x
	a.config.WidgetY = y
	_ = config.Save(*a.config)
}

func (a *App) startEventLoop() {
	a.eventLoopStop = make(chan struct{})
	a.eventLoopDone = make(chan struct{})

	go func() {
		defer close(a.eventLoopDone)

		a.emitMonitorState()

		ticker := time.NewTicker(time.Duration(a.config.PollIntervalMs) * time.Millisecond)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				a.emitMonitorState()
			case <-a.eventLoopStop:
				return
			}
		}
	}()
}

func (a *App) stopEventLoop() {
	if a.eventLoopStop == nil || a.eventLoopDone == nil {
		return
	}

	close(a.eventLoopStop)
	<-a.eventLoopDone
	a.eventLoopStop = nil
	a.eventLoopDone = nil
}

func (a *App) emitMonitorState() {
	app := application.Get()
	if app == nil {
		return
	}

	if errMessage := a.monitor.GetLastError(); errMessage != "" {
		app.Event.Emit(speedErrorEvent, map[string]string{"message": errMessage})
		return
	}

	sample := a.monitor.GetSample()
	if sample.InterfaceCount == 0 {
		app.Event.Emit(speedErrorEvent, map[string]string{"message": "No active network adapters detected yet."})
		return
	}

	app.Event.Emit(speedUpdateEvent, sample)
}
