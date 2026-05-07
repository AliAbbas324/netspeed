package main

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func test(ctx context.Context) {
	// Check if WindowCreate exists
	_ = runtime.WindowCreate(ctx, &options.Window{})
}
