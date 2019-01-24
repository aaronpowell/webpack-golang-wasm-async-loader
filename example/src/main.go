//+ build js,wasm

package main

import (
	"strconv"
	"syscall/js"

	"github.com/aaronpowell/webpack-golang-wasm-async-loader/gobridge"
)

var global = js.Global()

func add(i ...js.Value) js.Value {
	ret := 0

	for _, item := range i {
		val, _ := strconv.Atoi(item.String())
		ret += val
	}

	return js.ValueOf(ret)
}

func main() {
	c := make(chan struct{}, 0)
	println("Web Assembly is ready")
	gobridge.RegisterCallback("add", add)

	<-c
}
