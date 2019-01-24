//+ build js,wasm

package gobridge

import (
	"syscall/js"
)

var bridgeRoot js.Value

const (
	bridgeJavaScriptName = "__gobridge__"
)

func registrationWrapper(fn func(args ...js.Value) js.Value) func(args []js.Value) {
	return func(args []js.Value) {
		cb := args[len(args)-1:][0]

		ret := fn(args[:len(args)-1]...)

		cb.Invoke(js.Null(), ret)
	}
}

// RegisterCallback registers a Go function to be a callback used in JavaScript
func RegisterCallback(name string, callback func(args ...js.Value) js.Value) {
	bridgeRoot.Set(name, js.NewCallback(registrationWrapper(callback)))
}

// RegisterValue registers a static value output from Go for access in JavaScript
func RegisterValue(name string, value js.Value) {
  bridgeRoot.Set(name, value)
}

func init() {
	global := js.Global()

	bridgeRoot = global.Get(bridgeJavaScriptName)
}
