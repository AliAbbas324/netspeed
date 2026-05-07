package main

import (
	"embed"
	"log"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	wailsApp := application.New(application.Options{
		Name:        "NetSpeed",
		Description: "Network Speed Monitor",
		Services: []application.Service{
			application.NewService(app),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
	})

	// Create Windows
	mainWindow := wailsApp.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:      "main",
		Title:     "NetSpeed Settings",
		Width:     900,
		Height:    600,
		MinWidth:  600,
		MinHeight: 400,
		URL:       "/?mode=settings",
	})

	widgetWindow := wailsApp.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:        "widget",
		Title:       "NetSpeedWidget",
		Width:       100,
		Height:      40,
		AlwaysOnTop: true,
		Frameless:   true,
		URL:         "/?mode=widget",
		Hidden:      !app.config.ShowWidget,
	})

	mainWindow.OnWindowEvent(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		mainWindow.Hide()
	})

	widgetWindow.OnWindowEvent(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		app.ToggleWidget(false)
	})

	app.SetWindows(mainWindow, widgetWindow)

	// System Tray
	tray := wailsApp.SystemTray.New()
	tray.SetIcon(trayIcon)
	
	trayMenu := wailsApp.NewMenu()
	trayMenu.Add("Show Settings").OnClick(func(ctx *application.Context) {
		mainWindow.Show()
		mainWindow.Focus()
	})
	
	mWidget := trayMenu.AddCheckbox("Show Widget", app.config.ShowWidget)
	mWidget.OnClick(func(ctx *application.Context) {
		checked := ctx.IsChecked()
		if checked {
			widgetWindow.Show()
			app.config.ShowWidget = true
			go setSkipTaskbar("NetSpeedWidget", true)
		} else {
			widgetWindow.Hide()
			app.config.ShowWidget = false
		}
		mWidget.SetChecked(checked)
		app.SaveConfig(*app.config)
	})
	
	trayMenu.AddSeparator()
	trayMenu.Add("Quit").OnClick(func(ctx *application.Context) {
		wailsApp.Quit()
	})
	
	tray.SetMenu(trayMenu)

	// Initial taskbar hide if widget is shown
	if app.config.ShowWidget {
		go func() {
			for i := 0; i < 5; i++ {
				time.Sleep(1 * time.Second)
				setSkipTaskbar("NetSpeedWidget", true)
			}
		}()
	}

	err := wailsApp.Run()
	if err != nil {
		log.Fatal(err)
	}
}
