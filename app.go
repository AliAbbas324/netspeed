package main

import (
	"context"
	"log/slog"
	"os"
	"sync"

	"speed-meter/internal/config"
	"speed-meter/internal/netmon"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// AppState is the frontend-facing snapshot used by the Phase 1 UI.
type AppState struct {
	Speeds                 map[string]netmon.InterfaceSpeed `json:"speeds"`
	Interfaces             []string                         `json:"interfaces"`
	ErrorMessage           string                           `json:"errorMessage"`
	SampledAt              string                           `json:"sampledAt"`
	InterfaceCount         int                              `json:"interfaceCount"`
	DownloadBytesPerSecond float64                          `json:"downloadBytesPerSecond"`
	UploadBytesPerSecond   float64                          `json:"uploadBytesPerSecond"`
}

// App exposes backend functionality to the Wails frontend.
type App struct {
	ctx     context.Context
	logger  *slog.Logger
	mu      sync.RWMutex
	monitor *netmon.Monitor
	config  config.Config
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
		config:  *cfg,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.monitor.Start()
}

func (a *App) domReady(ctx context.Context) {
	runtime.WindowCenter(ctx)
}

func (a *App) shutdown(ctx context.Context) {
	a.monitor.Stop()
}

// GetState returns the latest monitor snapshot for the frontend.
func (a *App) GetState() AppState {
	sample := a.monitor.GetSample()

	return AppState{
		Speeds:                 a.monitor.GetSpeeds(),
		Interfaces:             a.monitor.ListInterfaces(),
		ErrorMessage:           a.monitor.GetLastError(),
		SampledAt:              sample.SampledAt,
		InterfaceCount:         sample.InterfaceCount,
		DownloadBytesPerSecond: sample.DownloadBytesPerSecond,
		UploadBytesPerSecond:   sample.UploadBytesPerSecond,
	}
}

// GetSpeeds returns the latest per-interface transfer rates.
func (a *App) GetSpeeds() map[string]netmon.InterfaceSpeed {
	return a.monitor.GetSpeeds()
}

// ListInterfaces returns the available non-loopback interfaces observed by the monitor.
func (a *App) ListInterfaces() []string {
	return a.monitor.ListInterfaces()
}

// GetConfig returns the in-memory configuration snapshot.
func (a *App) GetConfig() config.Config {
	a.mu.RLock()
	defer a.mu.RUnlock()

	return a.config
}

// SaveConfig persists frontend-driven settings updates and restarts the monitor
// when the polling interval changes.
func (a *App) SaveConfig(next config.Config) (config.Config, error) {
	current := a.GetConfig()

	if err := config.Save(next); err != nil {
		a.logger.Error("failed to save config", "error", err)
		return current, err
	}

	loaded, err := config.Load()
	if err != nil {
		a.logger.Error("failed to reload config after save", "error", err)
		return current, err
	}

	a.mu.Lock()
	a.config = *loaded
	a.mu.Unlock()

	if current.PollIntervalMs != loaded.PollIntervalMs {
		a.monitor.Stop()
		a.monitor = netmon.NewMonitor(loaded.PollIntervalMs)
		a.monitor.Start()
	}

	return *loaded, nil
}
