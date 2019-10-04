[![Build Status][build]][build-url]
[![npm][npm]][npm-url]
[![node][node]][node-url]

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <h1>Golang WebAssembly Async Loader</h1>
  <p>Generates a WASM package from Golang and provides an async interface for working with it</p>
</div>

<h2 align="center">Install</h2>

```bash
npm install --save-dev golang-wasm-async-loader
```

This is a loader for [webpack](https://webpack.js.org/) that is used for generating [WebAssembly](https://webassembly.org/) (aka WASM) bundles from [Go](https://golang.org).

The JavaScript bridge that is then generated for webpack will expose the WebAssembly functions as a Promise for interacting with.

Note: It works with `Go 1.12` for now. Stay tuned for updates :)

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

  const someValue = await wasm.someValue();
  console.log(someValue);
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

func add(i []js.Value) (interface{},error) {
	ret := 0

	for _, item := range i {
		val, _ := strconv.Atoi(item.String())
		ret += val
	}

	return ret, nil
}

func main() {
	c := make(chan struct{}, 0)

	gobridge.RegisterCallback("add", add)
	gobridge.RegisterValue("someValue", "Hello World")

	<-c
}
```

## How does it work?

As part of this repository a Go package has been created to improve the interop between the Go WASM runtime and work with the async pattern the loader defines.

To do this a function is exported from the package called `RegisterCallback` which takes two arguments:

* A `string` representing the name to register it as in JavaScript (and what you'll call it using)
* The `func` to register as a callback
  * The `func` must has a signature of `(args js.Value) (interface{}, error)` so you can raise an error if you need

If you want to register a static value that's been created from Go to be available in JavaScript you can do that with `RegisterValue`, which takes a name and a value. Values are converted to functions that return a Promise so they can be treated asynchronously like function invocations.

In JavaScript a global object is registered as `__gobridge__` which the registrations happen against.

## Example

You'll find an example of this in action in the [`example`](https://github.com/aaronpowell/webpack-golang-wasm-async-loader/tree/master/example) folder.

# Licence

MIT

# Credit

Aaron Powell

[build]: https://aaronpowell.visualstudio.com/webpack-golang-wasm-async-loader/_apis/build/status/aaronpowell.webpack-golang-wasm-async-loader?branchName=master&label=Built%20on%20Azure%20🐱%E2%80%8D💻
[build-url]: https://aaronpowell.visualstudio.com/webpack-golang-wasm-async-loader/_build/latest?definitionId=16?branchName=master

[npm]: https://img.shields.io/npm/v/golang-wasm-async-loader.svg
[npm-url]: https://npmjs.com/package/golang-wasm-async-loader

[node]: https://img.shields.io/node/v/golang-wasm-async-loader.svg
[node-url]: https://nodejs.org
