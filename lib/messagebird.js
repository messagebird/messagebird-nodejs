/**
 * MessageBird API methods
 *
 * @module messagebird
 */

var http = require('https');
var querystring = require('querystring');
var pkg = require('../package.json');

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
        'User-Agent': 'MessageBird/ApiClient/' + pkg.version + ' Node.js/' + process.versions.node
      }
    };

    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
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

        if (response.statusCode === 204) {
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


  // METHODS
  return {
    balance: {

      /**
       * Get account balance
       *
       * @param {Function} callback
       * @return {void}
       */
      read: function (callback) {
        httpRequest('GET', '/balance', callback);
      }
    },

    hlr: {

      /**
       * Get HLR report
       *
       * @param {Function} callback
       * @return {void}
       */
      read: function (id, callback) {
        httpRequest('GET', '/hlr/' + id, callback);
      },

      /**
       * Send HLR network query to a number
       *
       * @param {Number} msisdn
       * @param {String} ref
       * @param {Function} callback
       * @return {void}
       */
      create: function (msisdn, ref, callback) {
        var params = {
          msisdn: msisdn,
          reference: (typeof ref === 'function') ? null : ref
        };

        httpRequest('POST', '/hlr', params, callback || ref);
      }
    },

    messages: {

      /**
       * Get a text message
       *
       * @param {String} id
       * @param {Function} callback
       * @return {void}
       */
      read: function (id, callback) {
        httpRequest('GET', '/messages/' + id, callback);
      },

      /**
       * Send a text message
       *
       * @param {Object} params
       * @param {Function} callback
       * @return {void}
       */
      create: function (params, callback) {
        if (params.recipients instanceof Array) {
          params.recipients = params.recipients.join(',');
        }

        httpRequest('POST', '/messages', params, callback);
      }
    },

    voice_messages: {

      /**
       * Get a voice message
       *
       * @param {String} id
       * @param {Function} callback
       * @return {void}
       */
      read: function (id, callback) {
        httpRequest('GET', '/voicemessages/' + id, callback);
      },

      /**
       * Send a voice message
       *
       * @param {Array} recipients
       * @param {Object} params
       * @param {Function} callback
       * @return {void}
       */
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

      /**
       * Get verification code details
       *
       * @param {String} id
       * @param {Function} callback
       * @return {void}
       */
      read: function (id, callback) {
        httpRequest('GET', '/verify/' + id, callback);
      },

      /**
       * Send a verification code
       *
       * @param {Number} recipient
       * @param {Object} params
       * @param {Function} callback
       * @return {void}
       */
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

      /**
       * Delete a verification code
       *
       * @param {String} id
       * @param {Function} callback
       * @return {void}
       */
      delete: function (id, callback) {
        httpRequest('DELETE', '/verify/' + id, callback);
      },

      /**
       * Verify a verification code
       *
       * @param {String} id
       * @param {String} token
       * @param {Function} callback
       * @return {void}
       */
      verify: function (id, token, callback) {
        var params = {
          token: token
        };

        httpRequest('GET', '/verify/' + id, params, callback);
      }
    },
    lookup: {

      /**
       * Do a phonenumber lookup
       *
       * @param {String} phoneNumber
       * @param {String} countryCode
       * @param {Function} callback
       * @return void
       */
      read: function (phoneNumber, countryCode, callback) {
        var params = {};

        if (typeof countryCode === 'function') {
          callback = countryCode;
          countryCode = null;
        }

        if (countryCode) {
          params.countryCode = countryCode;
        }

        httpRequest('GET', '/lookup/' + phoneNumber, params, callback);
      },

      hlr: {

        /**
         * View an HLR lookup
         *
         * @param {String} phoneNumber
         * @param {String} countryCode
         * @param {Function} callback
         * @return void
         */
        read: function (phoneNumber, countryCode, callback) {
          var params = {};

          if (typeof countryCode === 'function') {
            callback = countryCode;
            countryCode = null;
          }

          if (countryCode) {
            params.countryCode = countryCode;
          }

          httpRequest('GET', '/lookup/' + phoneNumber + '/hlr', params, callback);
        },

        /**
         * Request an HLR lookup
         *
         * @param {String} phoneNumber
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        create: function (phoneNumber, params, callback) {
          if (typeof params === 'function') {
            callback = params;
            params = null;
          }

          httpRequest('POST', '/lookup/' + phoneNumber + '/hlr', params, callback);
        }
      }
    },

    contacts: {

      /**
       * Create a new contact. Params is optional.
       *
       * @param {String} phoneNumber
       * @param {Object} params
       * @param {Function} callback
       * @return void
       */
      create: function (phoneNumber, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }

        params.msisdn = phoneNumber;

        httpRequest('POST', '/contacts', params, callback);
      },

      /**
       * Deletes an existing contact. The callback is invoked with an error if
       * applicable, but the data will never contain anything meaningful as the
       * API returns an empty response for successful deletes.
       *
       * @param {String} id
       * @param {Function} callback
       * @return void
       */
      delete: function (id, callback) {
        httpRequest('DELETE', '/contacts/' + id, callback);
      },

      /**
       * Lists existing contacts. Pagination is optional. If a limit is set, an
       * offset is also required.
       *
       * @param {Number} limit
       * @param {Number} offset
       * @param {Function} callback
       * @return void
       */
      list: function (limit, offset, callback) {
        var params = null;

        if (typeof callback === 'function') {
          params = {
            limit: limit,
            offset: offset
          };
        } else {
          callback = limit;
        }

        httpRequest('GET', '/contacts', params, callback);
      },

      /**
       * View an existing contact.
       *
       * @param {String} id
       * @param {Function} callback
       * @return void
       */
      read: function (id, callback) {
        httpRequest('GET', '/contacts/' + id, callback);
      },

      /**
       * Updates an existing contact. Params is optional.
       *
       * @param {String} id
       * @param {String} name
       * @param {Object} params
       * @param {Function} callback
       * @return void
       */
      update: function (id, params, callback) {
        httpRequest('PATCH', '/contacts/' + id, params, callback);
      },

      /**
       * Lists the groups a contact is part of.
       *
       * @param {String} contactId
       * @param {Number} limit
       * @param {Number} offset
       * @param {Function} callback
       * @return void
       */
      listGroups: function (contactId, limit, offset, callback) {
        var params = null;

        if (typeof callback === 'function') {
          params = {
            limit: limit,
            offset: offset
          };
        } else {
          callback = limit;
        }

        httpRequest('GET', '/contacts/' + contactId + '/groups', params, callback);
      },

      /**
       * Lists the messages for a contact.
       *
       * @param {String} contactId
       * @param {Number} limit
       * @param {Number} offset
       * @param {Function} callback
       * @return void
       */
      listMessages: function (contactId, limit, offset, callback) {
        var params = null;

        if (typeof callback === 'function') {
          params = {
            limit: limit,
            offset: offset
          };
        } else {
          callback = limit;
        }

        httpRequest('GET', '/contacts/' + contactId + '/messages', params, callback);
      }

    },

    groups: {

      /**
       * Creates a new group. Params is optional.
       *
       * @param {String} name
       * @param {Object} params
       * @param {Function} callback
       * @return void
       */
      create: function (name, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }

        params.name = name;

        httpRequest('POST', '/groups', params, callback);
      },

      /**
       * Deletes an existing group. The callback is invoked with an error if
       * applicable, but the data will never contain anything meaningful as the
       * API returns an empty response for successful deletes.
       *
       * @param {String} id
       * @param {Function} callback
       * @return void
       */
      delete: function (id, callback) {
        httpRequest('DELETE', '/groups/' + id, callback);
      },

      /**
       * Lists existing groups. Pagination is optional. If a limit is set, an
       * offset is also required.
       *
       * @param {Number} limit
       * @param {Number} offset
       * @param {Function} callback
       * @return void
       */
      list: function (limit, offset, callback) {
        var params = null;

        if (typeof callback === 'function') {
          params = {
            limit: limit,
            offset: offset
          };
        } else {
          callback = limit;
        }

        httpRequest('GET', '/groups', params, callback);
      },

      /**
       * View an existing group.
       *
       * @param {String} id
       * @param {Function} callback
       * @return void
       */
      read: function (id, callback) {
        httpRequest('GET', '/groups/' + id, callback);
      },

      /**
       * Updates an existing contact. Parmas is optional.
       *
       * @param {String} id
       * @param {String} name
       * @param {Object} params
       * @param {Function} callback
       * @return void
       */
      update: function (id, name, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = {};
        }

        params.name = name;

        httpRequest('PATCH', '/groups/' + id, params, callback);
      },

      /**
       * Adds anywhere from 1 to 50 contacts to a group.
       *
       * @param {String} groupId
       * @param {String[]} contactIds
       * @param {Function} callback
       * @return void
       */
      addContacts: function (groupId, contactIds, callback) {
        // We need to make a PUT request with a body formatted like:
        // `ids[]=contact-id&ids[]=other-contact-id`. The httpRequest method
        // encodes all request bodies to JSON though.
        //
        // Instead, we'll send a GET request and pass a _method=PUT parameter
        // that will ask the API to handle our request as a PUT. We can then
        // provide the contact IDs in the query string.
        var query = this.getAddContactsQueryString(contactIds);

        httpRequest('GET', '/groups/' + groupId + '?' + query, null, callback);
      },

      getAddContactsQueryString: function (contactIds) {
        // Map the contact IDs to the
        // `_method=PUT&ids[]=contact-id&ids[]=other-contact-id` format. See
        // docs in addContacts and:
        // * https://developers.messagebird.com/docs/alternatives
        // * https://developers.messagebird.com/docs/groups#add-contact-to-group
        var params = [];
        
        params.push('_method=PUT');
        for (var i = 0; i < contactIds.length; i++) {
          params.push('ids[]=' + contactIds[i]);
        }
        
        return params.join('&');
      },

      /**
       * Lists the contacts that are part of a group.
       *
       * @param {String} groupId
       * @param {Number} limit
       * @param {Number} offset
       * @param {Function} callback
       * @return void
       */
      listContacts: function (groupId, limit, offset, callback) {
        var params = null;

        if (typeof callback === 'function') {
          params = {
            limit: limit,
            offset: offset
          };
        } else {
          callback = limit;
        }

        httpRequest('GET', '/groups/' + groupId + '/contacts', params, callback);
      },

      /**
       * Removes a single contact from a group.
       *
       * @param {String} groupId
       * @param {String} contactId
       * @param {Function} callback
       * @return void
       */
      removeContact: function (groupId, contactId, callback) {
        httpRequest('DELETE', '/groups/' + groupId + '/contacts/' + contactId, callback);
      }

    }

  };
};
