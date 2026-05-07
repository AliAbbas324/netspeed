package main

import (
	"fmt"
	"reflect"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

func main() {
	t := reflect.TypeOf(windows.Options{})
	for i := 0; i < t.NumField(); i++ {
		fmt.Println(t.Field(i).Name)
	}
}
