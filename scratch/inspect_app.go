package main

import (
	"fmt"
	"reflect"
	"github.com/wailsapp/wails/v2/pkg/options"
)

func main() {
	t := reflect.TypeOf(options.App{})
	for i := 0; i < t.NumField(); i++ {
		fmt.Println(t.Field(i).Name)
	}
}
