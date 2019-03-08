//+ build js,wasm

package main

import (
  "../../gobridge"
  "strconv"
  "syscall/js"
)

var global = js.Global()

func add(this js.Value, args []js.Value) interface{} {
  ret := 0

  for _, item := range args {
    val, _ := strconv.Atoi(item.String())
    ret += val
  }

  return ret
}

func main() {
  c := make(chan struct{}, 0)
  println("Web Assembly is ready")
  gobridge.RegisterCallback("add", add)

  <-c
}
