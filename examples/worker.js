importScripts('../import-scripts.js'); /* global importScriptsSync importScriptsAsync */

importScripts('/node_modules/pako/dist/pako_inflate.min.js'); /* global pako */
console.log('pako', pako);

importScriptsSync('/node_modules/js-untar/build/dist/untar.js'); /* global untar */
console.log('untar', untar);

setTimeout(async ()=> {
  await importScriptsAsync('/node_modules/wasm-flate/wasm_flate.js'); /* global wasm_bindgen */
  console.log('wasm_bindgen', wasm_bindgen);
}, 1000);
