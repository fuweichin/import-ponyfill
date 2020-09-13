import {importSync, importAsync} from '../import.js';

import '/node_modules/pako/dist/pako.min.js'; /* global pako */
console.log('pako', pako);

importSync('/node_modules/js-untar/build/dist/untar.js'); /* global untar */
console.log('untar', untar);

setTimeout(async ()=> {
  await importAsync('/node_modules/wasm-flate/wasm_flate.js'); /* global wasm_bindgen */
  console.log('wasm_bindgen', wasm_bindgen);
}, 1000);
