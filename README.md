# Golang WebAssembly loader for webpack

This is a loader for [webpack](https://webpack.js.org/) that is used for generating [WebAssembly](https://webassembly.org/) bundles from [Go](https://golang.org).

The JavaScript bridge that is then generated for webpack will expose the WebAssembly functions as a Promise for interacting with.

# Installation

```
## npm
npm install --save-dev golang-wasm-async-loader

## yarn
yarn add golang-wasm-async-loader
```

## webpack config

```js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.go/,
                use: ['golang-wasm-async-loader']
            }
        ]
    },
    node: {
        fs: 'empty'
    }
};
```

# Using in your code

You import your Go code just like any other JavaScript module you might be working with. The webpack loader will export a default export that has the functions you registered in Go on it. Unfortunately it currently doesn't provide autocomplete of those function names as they are runtime defined.

```js
import wasm from './main.go'

async function init() {
  const result = await wasm.add(1, 2);

  console.log(result);
}
```

Here's the `main.go` file:

```go
package main

import (
	"strconv"
	"syscall/js"
)

func add(i ...js.Value) js.Value {
	ret := 0

	for _, item := range i {
		val, _ := strconv.Atoi(item.String())
		ret += val
	}

	return js.ValueOf(ret)
}

func registerCallbacks() {
	wrapper := func(fn func(args ...js.Value) js.Value) func(args []js.Value) {
		return func(args []js.Value) {
			cb := args[len(args)-1:][0]

			ret := fn(args[:len(args)-1]...)

			cb.Invoke(js.Null(), ret)
		}
	}

	global.Set("add", js.NewCallback(wrapper(add)))
}

func main() {
	c := make(chan struct{}, 0)
	println("Web Assembly is ready")
	registerCallbacks()

	<-c
}
```

# Licence

MIT

# Credit

Aaron Powell