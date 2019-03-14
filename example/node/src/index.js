const gobridge = require('../../../dist/gobridge');
const { join } = require('path');
require('../../../lib/wasm_exec.js');
require('isomorphic-fetch');
const { readFileSync } = require('fs');

global.requestAnimationFrame = global.setImmediate;

let p = new Promise(resolve =>
  resolve(readFileSync(join(__dirname, 'main.wasm')))
);
const wasm = gobridge.default(p);

async function run() {
  let result = await wasm.add(1,2);

  console.log(result);
};

run();