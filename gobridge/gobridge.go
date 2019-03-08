//+ build js,wasm

package gobridge

import (
  "syscall/js"
)

var bridgeRoot js.Value

const (
  bridgeJavaScriptName = "__gobridge__"
)

func registrationWrapper(fn func(this js.Value, args []js.Value) interface{}) func(this js.Value, args []js.Value) interface{} {
  return func(this js.Value, args []js.Value) interface{} {
    cb := args[len(args)-1:][0]

    ret := fn(this, args[:len(args)-1])

    cb.Invoke(js.Null(), ret)

    return ret
  }
}

// RegisterCallback registers a Go function to be a callback used in JavaScript
func RegisterCallback(name string, callback func(this js.Value, args []js.Value) interface{}) {
  bridgeRoot.Set(name, js.FuncOf(registrationWrapper(callback)))
}

// RegisterValue registers a static value output from Go for access in JavaScript
func RegisterValue(name string, value js.Value) {
  bridgeRoot.Set(name, value)
}

func init() {
  global := js.Global()

  bridgeRoot = global.Get(bridgeJavaScriptName)
}
