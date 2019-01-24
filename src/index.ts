import * as webpack from "webpack";
import { readFileSync, unlinkSync } from "fs";
import { join, basename } from "path";
import { execFile } from "child_process";

const proxyBuilder = (filename: string) => `
let ready = false;

const g = self || window || global

if (!g.__gobridge__) {
  g.__gobridge__ = {};
}

const bridge = g.__gobridge__;

async function init() {
  const go = new Go();
  let result = await WebAssembly.instantiateStreaming(fetch("${filename}"), go.importObject);
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
            bridge[key].apply(undefined, [...args, cb]);
          };

          while (!ready) {
            await sleep();
          }

          if (!(key in bridge)) {
            reject(\`There is nothing defined with the name "$\{key\}"\`);
            return;
          }

          if (typeof bridge[key] !== 'function') {
            resolve(bridge[key]);
            return;
          }

          run();
        });
      };
    }
  }
);
  
export default proxy;`;

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
    const emittedFilename = basename(this.resourcePath, ".go") + ".wasm";
    this.emitFile(emittedFilename, out, null);

    cb(
      null,
      [
        "require('!",
        join(__dirname, "..", "lib", "wasm_exec.js"),
        "');",
        proxyBuilder(emittedFilename)
      ].join("")
    );
  });
}

export default loader;
