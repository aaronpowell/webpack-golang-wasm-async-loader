//+ build js,wasm

package main

import (
	"errors"
	"strconv"
	"syscall/js"

	"../../../gobridge"
)

var global = js.Global()

func add(this js.Value, args []js.Value) (interface{}, error) {
	var ret float64

	for _, item := range args {
		if item.Type() == js.TypeNumber {
			val := item.Float()
			ret += val
		}
	}

	return ret, nil
}

func err(this js.Value, args []js.Value) (interface{}, error) {
	return nil, errors.New("This is an error")
}

func main() {
	c := make(chan struct{}, 0)
	println("Web Assembly is ready")
	gobridge.RegisterCallback("add", add)
	gobridge.RegisterCallback("raiseError", err)
	gobridge.RegisterValue("someValue", "Hello World")

	<-c
}
