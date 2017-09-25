function httpRequest(method, path, params, callback) {
  var options = {};
  var complete = false;
  var body = null;
  var request;

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

  /**
     * doCallback prevents multiple callback
     * calls emitted by node's http module
     *
     * @param {Error} err
     * @param {Mixed} res
     * @return {Void}
     */
  function doCallback(err, res) {
    if (!complete) {
      complete = true;
      callback(err, res || null);
    }
  }

  // build request
  options = {
    hostname: 'rest.messagebird.com',
    path: path,
    method: method,
    headers: {
      'Authorization': 'AccessKey ' + config.accessKey,
      'User-Agent': 'MessageBird/ApiClient/' + pkg.version + ' Node.js/' + process.versions.node
    }
  };

  if (options.method === 'POST' || options.method === 'PUT') {
    body = JSON.stringify(params);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  } else {
    options.path += params ? '?' + querystring.stringify(params) : '';
  }

  request = http.request(options);

  // set timeout
  request.on('socket', function (socket) {
    socket.setTimeout(parseInt(config.timeout, 10));
    socket.on('timeout', function () {
      request.abort();
    });
  });

  // process client error
  request.on('error', function (e) {
    var error = new Error('request failed: ' + e.message);

    if (error.message === 'ECONNRESET') {
      error = new Error('request timeout');
    }

    error.error = e;
    doCallback(error);
  });

  // process response
  request.on('response', function (response) {
    var data = [];
    var size = 0;
    var error = null;

    response.on('data', function (ch) {
      data.push(ch);
      size += ch.length;
    });

    response.on('close', function () {
      doCallback(new Error('request closed'));
    });

    response.on('end', function () {
      data = Buffer.concat(data, size)
        .toString()
        .trim();

      if (method === 'DELETE' && response.statusCode === 204) {
        doCallback(null, true);
        return;
      }

      try {
        data = JSON.parse(data);
        if (data.errors) {
          var clientErrors = data.errors.map(function (e) {
            return e.description + ' (code: ' + e.code + (e.parameter ? ', parameter: ' + e.parameter : '') + ')';
          });

          error = new Error('api error(s): ' + clientErrors.join(', '));
          error.statusCode = response.statusCode;
          error.errors = data.errors;
          data = null;
        }
      } catch (e) {
        error = new Error('response failed');
        error.statusCode = response.statusCode;
        error.error = e;
        data = null;
      }

      doCallback(error, data);
    });
  });

  // do request
  request.end(body);
}
