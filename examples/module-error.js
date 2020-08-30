// compare this with ./module.js

import '../node_modules/pako/dist/pako.min.js'; /* global pako */
console.log('pako', pako);

import '../node_modules/js-untar/build/dist/untar.js'; /* global untar */
console.log('untar', untar);

setTimeout(async ()=> {
  await import('../node_modules/wasm-flate/wasm_flate.js'); /* global wasm_bindgen */
  console.log('wasm_bindgen', wasm_bindgen);
}, 1000);
