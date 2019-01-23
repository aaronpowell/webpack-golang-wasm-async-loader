import * as webpack from "webpack";
import { readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { execFile } from "child_process";

const proxyBuilder = `
let ready = false;
if (!global.__gobridge__) {
  global.__gobridge__ = {};
}

async function init() {
  const go = new Go();
  let result = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
  go.run(result.instance);
  ready = true;
}

function sleep() {
  return new Promise(requestAnimationFrame);
}

init();

let proxy = new Proxy(
  {},
  {
    get: (_, key) => {
      return (...args) => {
        return new Promise(async (resolve, reject) => {
          let run = () => {
            let cb = (err, ...msg) => (err ? reject(err) : resolve(...msg));
            (self || window || global)[key].apply(undefined, [...args, cb]);
          };

          while (!ready) {
            await sleep();
          }
          run();
        });
      };
    }
  }
);
  
export default proxy;
  `;

const getGoBin = (root: string) => `${root}/bin/go`;

function loader(this: webpack.loader.LoaderContext, contents: string) {
  const cb = this.async();

  const opts = {
    env: {
      GOPATH: process.env.GOPATH,
      GOROOT: process.env.GOROOT,
      GOOS: "js",
      GOARCH: "wasm"
    }
  };

  const goBin = getGoBin(opts.env.GOROOT);
  const outFile = `${this.resourcePath}.wasm`;
  const args = ["build", "-o", outFile, this.resourcePath];

  execFile(goBin, args, opts, (_, err) => {
    if (err) {
      cb(new Error(err));
      return;
    }

    let out = readFileSync(outFile);
    unlinkSync(outFile);
    this.emitFile("main.wasm", out, null);

    cb(
      null,
      [
        "require('!",
        join(__dirname, "..", "lib", "wasm_exec.js"),
        "');",
        proxyBuilder
      ].join("")
    );
  });
}

export default loader;
