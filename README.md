# import-ponyfill

Loading incompatible UMD scripts for browser `module` and `worker`.



### Why you need it

Some lib scripts throw errors in `ES module ` or `web worker` environments because of specific/deprecated UMD wrappers, which is fixedly using `this` or `window` to access the global object.  Thus you need another mechanism to load these scripts.



### How it works

+ use synchronous `XMLHttpRequest` to load script
+ use sync `<script>` (or `new Function().call()` in web worker) to eval js code
+ use `/* global xxx */` to mark imported UMD global vars



**Case 1:** In module js

If `import './some.umd.js'`  throws error, try `importSync('./some.umd.js')`

```js
// import './some.umd.js'; /* global Some */

import {importSync} from '/node_modules/import-ponyfill/import.js';
importSync('./some.umd.js'); /* global Some */
```



or  if `import('./some.umd.js')`  rejects with an error,

```js
import('./some.umd.js').then(()=>{ /* global Some */
  console.log(Some);
});
```

try `importAsync('./some.umd.js')`

```js
import {importAsync} from '/node_modules/import-ponyfill/import.js';
importAsync('./some.umd.js').then()=>{ /* global Some */
  console.log(Some);
});
```

**Case 2:** In worker js

If `importScripts('./some.umd.js')` throws error, try `importScriptsSync('./some.umd.js')` 

```js
// importScripts('./some.umd.js');
importScripts('/node_modules/import-ponyfill/import-scripts.js'); /* global importScriptsSync importScriptsAsync */
importScriptsSync('./some.umd.js');
```



### Supported features

+ supports standard module name prefixes `./` `../` `/` `http:` and `https:` 
+ maintains a module registry and won't initiate multiple requests for same module
+ respects commented `sourceMappingURL` in main-thread module

These features are designed to be conformant to spec as closer as possible.



### Known limitations

+ synchronous import requires synchronous XHR which may hurt performance
+ use of CSP script-src requires `'unsafe-eval'` 
+ `sourceMappingURL` in web worker will be ignored 

 For limitations above, this package gives **NO WARRANTY**, **USE AT YOUR OWN RISK**



### Install

```sh
npm install import-ponyfill
```



### Examples

See [./examples/index.html](./examples/index.html)

To run examples, 

1. checkout
2. `npm install && npm start`
3. open http://localhost:8080/examples/

