declare global {
  interface Window {
    __gobridge__: any

    Go: any

    WebAssembly: any
  }
}

const g = self || window || global

if (!g.__gobridge__) {
  g.__gobridge__ = {};
}

const bridge = g.__gobridge__;

function sleep() {
  return new Promise(requestAnimationFrame);
}

export default function (filename: string) {
  let ready = false;

  async function init() {
    const go = new g.Go();
    let result = await g.WebAssembly.instantiateStreaming(fetch(filename), go.importObject);
    go.run(result.instance);
    ready = true;
  }

  init();

  let proxy = new Proxy(
    {},
    {
      get: (_, key) => {
        return (...args: any) => {
          return new Promise(async (resolve, reject) => {
            let run = () => {
              let cb = (err: any, ...msg: any[]) => (err ? reject(err) : resolve(...msg));
              bridge[key].apply(undefined, [...args, cb]);
            };
  
            while (!ready) {
              await sleep();
            }
  
            if (!(key in bridge)) {
              reject(`There is nothing defined with the name "${key.toString()}"`);
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

  return proxy;
}