package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

const (
	appDirName            = "netspeed"
	configFilename        = "config.json"
	defaultPollIntervalMs = 1000
	defaultWidgetFontSize = 18
)

// Config stores persisted application settings.
type Config struct {
	SelectedInterface string  `json:"selectedInterface"`
	PollIntervalMs    int     `json:"pollIntervalMs"`
	ShowDownload      bool    `json:"showDownload"`
	ShowUpload        bool    `json:"showUpload"`
	ShowWidget        bool    `json:"showWidget"`
	WidgetFontSize    int     `json:"widgetFontSize"`
	WidgetBgOpacity   float64 `json:"widgetBgOpacity"`
	WidgetOpacity     float64 `json:"widgetOpacity"`
	WidgetTextOpacity float64 `json:"widgetTextOpacity"`
	WidgetX           int     `json:"widgetX"`
	WidgetY           int     `json:"widgetY"`
	Theme             string  `json:"theme"`
	AppPreset         string  `json:"appPreset"`
	WidgetPreset      string  `json:"widgetPreset"`
	HideWidgetOnFocus bool    `json:"hideWidgetOnFocus"`
	// TitleBarLogoRoundedCorners when nil means “unset” (treat as true for legacy configs).
	TitleBarLogoRoundedCorners *bool `json:"titleBarLogoRoundedCorners,omitempty"`
}

// Default returns the baseline configuration used for a fresh install.
func Default() Config {
	return Config{
		SelectedInterface:          "",
		PollIntervalMs:             defaultPollIntervalMs,
		ShowDownload:               true,
		ShowUpload:                 true,
		ShowWidget:                 false,
		WidgetFontSize:             defaultWidgetFontSize,
		WidgetBgOpacity:            0.8,
		WidgetOpacity:              1,
		WidgetTextOpacity:          1,
		WidgetX:                    -1,
		WidgetY:                    -1,
		Theme:                      "system",
		AppPreset:                  "default",
		WidgetPreset:               "classic",
		HideWidgetOnFocus:          true,
		TitleBarLogoRoundedCorners: boolPtr(true),
	}
}

// Load reads the config from the user config directory, falling back to defaults
// if the file does not exist yet.
func Load() (*Config, error) {
	path, err := filePath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			cfg := Default()
			return &cfg, nil
		}
		return nil, err
	}

	cfg := Default()
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	cfg.applyDefaults()
	return &cfg, nil
}

// Save writes the config to the user config directory.
func Save(cfg Config) error {
	cfg.applyDefaults()

	path, err := filePath()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0o644)
}

func filePath() (string, error) {
	baseDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	return filepath.Join(baseDir, appDirName, configFilename), nil
}

func (c *Config) applyDefaults() {
	if c.PollIntervalMs <= 0 {
		c.PollIntervalMs = defaultPollIntervalMs
	}

	if !c.ShowDownload && !c.ShowUpload {
		c.ShowDownload = true
		c.ShowUpload = true
	}

	if c.WidgetFontSize <= 0 {
		c.WidgetFontSize = defaultWidgetFontSize
	}

	if c.WidgetBgOpacity < 0 {
		c.WidgetBgOpacity = 0
	}
	if c.WidgetBgOpacity > 1 {
		c.WidgetBgOpacity = 1
	}

	if c.WidgetOpacity <= 0 {
		c.WidgetOpacity = 1
	}
	if c.WidgetOpacity > 1 {
		c.WidgetOpacity = 1
	}

	if c.WidgetTextOpacity > 1 {
		c.WidgetTextOpacity = 1
	}

	if c.WidgetPreset == "" {
		c.WidgetPreset = "classic"
	}

	if c.Theme == "" {
		c.Theme = "system"
	}

	if c.AppPreset == "" {
		c.AppPreset = "default"
	}

	if c.TitleBarLogoRoundedCorners == nil {
		c.TitleBarLogoRoundedCorners = boolPtr(true)
	}
}

func boolPtr(v bool) *bool {
	return &v
}
