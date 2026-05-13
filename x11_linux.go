//go:build linux

package main

import (
	"os/exec"
	"time"
)

func setSkipTaskbar(title string, skip bool) {
	// Give the window manager a moment to see the new title if it just changed
	time.Sleep(200 * time.Millisecond)

	arg := "remove"
	if skip {
		arg = "add"
	}
	_ = exec.Command("wmctrl", "-r", title, "-b", arg+",skip_taskbar").Run()
}
