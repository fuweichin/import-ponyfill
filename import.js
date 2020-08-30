let path = {
  dirname(str) {
    let pos = str.lastIndexOf('/');
    return pos === -1 ? '' : str.slice(0, pos);
  },
  basename(str, ext = '') {
    let pos = str.lastIndexOf('/');
    let name = pos === -1 ? str : str.slice(pos + 1);
    if (typeof ext === 'string' && ext.length > 0 && name.endsWith(ext)) {
      return name.slice(0, -ext.length);
    }
    return name;
  },
  extname(str) {
    let pos = str.lastIndexOf('/');
    let name = pos === -1 ? str : str.slice(pos + 1);
    let index = name.lastIndexOf('.');
    return index === -1 ? '' : name.slice(index);
  },
};

let registry = {};
function importScript(url, options) {
  let {async = true} = options;
  let p = registry[url];
  if (!p) {
    let error;
    p = new Promise((resolve, reject)=> {
      let xhr = new XMLHttpRequest({mozAnon: true, anon: true});
      xhr.onload = ()=> {
        // check content type
        let type = xhr.getResponseHeader('Content-Type');
        if (type) type = type.split(';')[0];
        if (
          !(type === 'text/javascript' || type === 'application/javascript')
        ) {
          error = new Error(
            'The server responded with a non-JavaScript MIME type of "' +
              type +
              '"',
          );
          reject(error);
          return;
        }
        let text = xhr.responseText;
        text = transformSourceMapping(text, {scriptUrl: url});
        try {
          evalSource(text);
          resolve();
        } catch (e) {
          error = e;
          reject(e);
        }
      };
      if (async) {
        xhr.onerror = ()=> {
          reject(new Error('Loading error'));
        };
        xhr.open('GET', url, async);
        xhr.send();
      } else {
        try {
          xhr.open('GET', url, false);
          xhr.send();
        } catch (e) {
          error = e;
          reject(e);
        }
      }
    });
    registry[url] = p;
    if (!async && error) {
      throw error;
    }
  }
  return p;
}

let rSourceMapComment = /^(\/[*/][@#]\s?sourceMappingURL=)([^\s*]+)(\s*(?:\*\/)?)/m;
function transformSourceMapping(text, {scriptUrl, toAbsoluteMappingURL = true}) {
  // when using `<script>CODE</script>` or `eval("CODE")`, replace relative map url with absolute
  let newMapUrl = '';
  let filename = path.basename(scriptUrl.pathname);
  let searchLen = 30 + filename.length;
  let searchText = text.slice(-searchLen);
  let fixedText = searchText.replace(
    rSourceMapComment,
    (comment, header, url, trailer)=> {
      if (toAbsoluteMappingURL) {
        newMapUrl = new URL(url, scriptUrl).toString();
        return header + newMapUrl + trailer;
      }
      return comment;
    },
  );
  return newMapUrl ? text.slice(0, -searchLen) + fixedText : text;
}

function evalSource(text) {
  let {document} = self;
  if (document) {
    let script = document.createElement('script');
    script.async = false;
    script.textContent = text;
    document.head.appendChild(script);
    return;
  }
  new Function('window', text).call(self, self); // ensure `this` and `window`
}

let isFF = /Firefox\//.test(navigator.userAgent);
function parseErrorStack(stack) {
  let frames;
  if (isFF) {
    let lines = stack.split(/\n/);
    let regex = /@(https?:\/\/[a-z0-9.]+(?::\d+)?(?:\/[\w-.~%!$&'()*+,;=:@]+]*)+)(?:\?[^#\n]+)?:(\d+):(\d+)$/;
    frames = lines.map((line)=> {
      let m = line.match(regex);
      return {fileName: m[1], lineNumber: +m[2], columnNumber: +m[3]};
    });
  } else {
    let lines = stack.split(/\n/).slice(1);
    let regex = /\(?(https?:\/\/[a-z0-9.]+(?::\d+)?(?:\/[\w-.~%!$&'()*+,;=:@]+]*)+)(?:\?[^#\n]+)?:(\d+):(\d+)\)?$/;
    frames = lines.map((line)=> {
      let m = line.match(regex);
      return {fileName: m[1], lineNumber: +m[2], columnNumber: +m[3]};
    });
  }
  return frames;
}

function importSync(name) {
  let baseUrl;
  try {
    throw new Error('');
  } catch (e) {
    let arr = parseErrorStack(e.stack);
    baseUrl = arr[1].fileName;
  }
  let url;
  if (name.startsWith('./') || name.startsWith('../') || name.startsWith('/')) {
    url = new URL(name, baseUrl);
  } else if (/^(https?):/.test(name)) {
    url = new URL(name);
  } else {
    throw new Error(
      'Relative references must start with either "/", "./", or "../"',
    );
  }
  return importScript(url, {async: false});
}

function importAsync(name) {
  let baseUrl;
  try {
    throw new Error('');
  } catch (e) {
    let arr = parseErrorStack(e.stack);
    baseUrl = new URL(arr[1].fileName);
  }
  let url;
  if (name.startsWith('./') || name.startsWith('../') || name.startsWith('/')) {
    url = new URL(name, baseUrl);
  } else if (/^(https?):/.test(name)) {
    url = new URL(name);
  } else {
    throw new Error(
      'Relative references must start with either "/", "./", or "../".',
    );
  }
  return importScript(url, {});
}

export {importSync, importAsync};
