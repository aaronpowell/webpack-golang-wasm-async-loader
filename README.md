# Golang WebAssembly loader for webpack

This is a loader for [webpack](https://webpack.js.org/) that is used for generating [WebAssembly](https://webassembly.org/) (aka WASM) bundles from [Go](https://golang.org).

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
	"github.com/aaronpowell/webpack-golang-wasm-async-loader/gobridge"
)

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

	gobridge.RegisterCallback("add", add)

	<-c
}
```

## How does it work?

As part of this repository a Go package has been created to improve the interop between the Go WASM runtime and work with the async pattern the loader defines.

To do this a function is exported from the package called `RegisterCallback` which takes two arguments:

* A `string` representing the name to register it as in JavaScript (and what you'll call it using)
* The `func` to register as a callback
  * Note: The `func` must has a signature of `(args ...js.Value) js.Value` and you are responsible to box/unbox the JavaScript values to the appropriate Go types. Similarly you need to box the return type as a `js.Value`

In JavaScript a global object is registered as `__gobridge__` which the registrations happen against.

# Licence

MIT

# Credit

Aaron Powell