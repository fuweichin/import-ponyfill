const http = require('http');
const express = require('express');
const historyApiFallback = require('connect-history-api-fallback');

express.static.mime.define({
  'application/wasm': ['wasm'],
  'application/json': ['map']
}, true);

let app = express();
app.use('/', express.static('.'));
app.use('/', historyApiFallback({
  index: '/index.html',
  htmlAcceptHeaders: ['text/html'],
}));

let server = http.createServer(app);
server.listen(8080, ()=> {
  console.log('server listening on http://localhost:8080/');
});
