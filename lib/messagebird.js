/**
 * MessageBird API methods
 *
 * @module messagebird
 */

var http = require('https');
var querystring = require('querystring');

/**
 * module.exports sets configuration
 * and returns an object with methods
 *
 * @param {String} accessKey
 * @param {Integer} timeout
 * @return {Object}
 */
module.exports = function (accessKey, timeout) {
  var config = {
    accessKey: accessKey,
    timeout: timeout || 5000
  };


  /**
   * httpRequest does the API call
   * and process the response
   *
   * @param {String} method
   * @param {String} path
   * @param {Object} params
   * @param {Function} callback
   * @return {Void}
   */
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
        'User-Agent': 'node.js/' + process.versions.node
      }
    };

    if (options.method === 'POST' || options.method === 'PUT') {
      body = JSON.stringify(params);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = body.length;
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
      var error = new Error('request failed');

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
            error = new Error('api error');
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


  // METHODS
  return {
    balance: {
      read: function (callback) {
        httpRequest('GET', '/balance', callback);
      }
    },

    hlr: {
      read: function (id, callback) {
        httpRequest('GET', '/hlr/' + id, callback);
      },

      create: function (msisdn, ref, callback) {
        var params = {
          msisdn: msisdn,
          reference: ref
        };

        httpRequest('POST', '/hlr', params, callback);
      }
    },

    messages: {
      read: function (id, callback) {
        httpRequest('GET', '/messages/' + id, callback);
      },

      create: function (params, callback) {
        if (params.recipients instanceof Array) {
          params.recipients = params.recipients.join(',');
        }

        httpRequest('POST', '/messages', params, callback);
      }
    },

    voice_messages: {
      read: function (id, callback) {
        httpRequest('GET', '/voicemessages/' + id, callback);
      },

      create: function (recipients, params, callback) {
        if (recipients instanceof Object) {
          callback = params;
          params = recipients;
          recipients = null;
        }

        if (recipients) {
          params.recipients = recipients;
        }

        if (params.recipients instanceof Array) {
          params.recipients = params.recipients.join(',');
        }

        httpRequest('POST', '/voicemessages', params, callback);
      }
    },

    verify: {
      read: function (id, callback) {
        httpRequest('GET', '/verify/' + id, callback);
      },

      create: function (recipient, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }

        if (recipient instanceof Array) {
          recipient = recipient[0];
        }

        params.recipient = recipient;
        httpRequest('POST', '/verify', params, callback);
      },

      delete: function (id, callback) {
        httpRequest('DELETE', '/verify/' + id, callback);
      },

      verify: function (id, token, callback) {
        var params = {
          token: token
        };

        httpRequest('GET', '/verify/' + id, params, callback);
      }
    }
  };
};
