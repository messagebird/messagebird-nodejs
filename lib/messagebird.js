/**
 * MessageBird API methods
 *
 * @module messagebird
 */

var http = require('https');
var querystring = require('querystring');
var pkg = require('../package.json');
var extend = Object.assign ? Object.assign : require('util')._extend;

/**
 * module.exports sets configuration
 * and returns an object with methods
 *
 * @param {String} accessKey
 * @param {Integer} timeout
 * @param {Array} features
 * @return {Object}
 */
module.exports = {
  initClient: function (accessKey, timeout, features) {
    var config = {
      accessKey: accessKey,
      timeout: timeout || 5000,
    };

    var CONVERSATIONS_ENDPOINT = 'conversations.messagebird.com';
    var VOICE_ENDPOINT = 'voice.messagebird.com';
    var IS_FIREBASE_PLUGIN_ENABLED = false;

    if (features && 'indexOf' in features) {
      if (features.indexOf('ENABLE_FIREBASE_PLUGIN') !== -1) {
        IS_FIREBASE_PLUGIN_ENABLED = true;
      }
    }

    /**
     * httpRequest does the API call and process the response.
     * requestParams.hostname is optional and defaults back to
     * 'rest.messagebird.com'.
     *
     * @param {Object} requestParams
     * @param {String} requestParams.hostname
     * @param {String} requestParams.path
     * @param {String} requestParams.method
     * @param {Object} requestParams.params
     * @param {Function} callback
     * @return {Void}
     */
    function httpRequest(requestParams, callback) {
      var options = {};
      var complete = false;
      var body = null;
      var request;

      if (typeof requestParams === 'function') {
        callback = requestParams;
        requestParams = null;
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

      function getUserAgent() {
        if (IS_FIREBASE_PLUGIN_ENABLED) {
          return 'MessageBird/ApiClient/FirebasePlugin';
        }
        return (
          'MessageBird/ApiClient/' +
          pkg.version +
          ' Node.js/' +
          process.versions.node
        );
      }

      // build request
      options = {
        hostname: requestParams.hostname || 'rest.messagebird.com',
        path: requestParams.path,
        method: requestParams.method,
        headers: {
          Authorization: 'AccessKey ' + config.accessKey,
          'User-Agent': getUserAgent(),
        },
      };

      if (
        options.method === 'POST' ||
        options.method === 'PUT' ||
        options.method === 'PATCH'
      ) {
        body = JSON.stringify(requestParams.params);
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
      } else {
        options.path += requestParams.params
          ? '?' + querystring.stringify(requestParams.params)
          : '';
      }

      // you can override any headers you like
      options.headers = extend(
        options.headers || {},
        requestParams.headers || {}
      );

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
          data = Buffer.concat(data, size).toString().trim();

          if (response.statusCode === 204) {
            doCallback(null, true);
            return;
          }

          try {
            let contentDisposition = response.headers['content-disposition'];

            // check if response data is downloadable so it can't be parsed to JSON
            if (
              contentDisposition &&
              contentDisposition.includes('attachment')
            ) {
              doCallback(error, data);
              return;
            }

            data = JSON.parse(data);
            if (data.errors) {
              let clientErrors = data.errors.map(function (e) {
                return (
                  e.description +
                  ' (code: ' +
                  e.code +
                  (e.parameter ? ', parameter: ' + e.parameter : '') +
                  ')'
                );
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
          httpRequest({ method: 'GET', path: '/balance' }, callback);
        },
      },

      hlr: {
        /**
         * Get HLR report
         *
         * @param {Function} callback
         * @return {void}
         */
        read: function (id, callback) {
          httpRequest({ method: 'GET', path: '/hlr/' + id }, callback);
        },

        /**
         * Send HLR network query to a number. Ref parameter is optional.
         *
         * @param {Number} msisdn
         * @param {String} ref
         * @param {Function} callback
         * @return {void}
         */
        create: function (msisdn, ref, callback) {
          var params = {
            msisdn: msisdn,
            reference: typeof ref === 'function' ? null : ref,
          };

          httpRequest(
            { method: 'POST', path: '/hlr', params: params },
            callback || ref
          );
        },
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
          httpRequest({ method: 'GET', path: '/messages/' + id }, callback);
        },

        /**
         * Lists sms messages.
         *
         * @param filter Filtering options.
         * @param filter.status The status of the message.
         * @param filter.limit The limit of messages to retrieve.
         * @param filter.offset The number of messages to skip before selecting.
         * @param {Function} callback
         * @return void
         */
        list: function (filter, callback) {
          var params = {};

          if (typeof callback === 'function') {
            if (Object.prototype.hasOwnProperty.call(filter, 'limit')) {
              params.limit = filter.limit;
            }
            if (Object.prototype.hasOwnProperty.call(filter, 'offset')) {
              params.offset = filter.offset;
            }
            if (Object.prototype.hasOwnProperty.call(filter, 'status')) {
              params.status = filter.status;
            }
          } else {
            callback = filter;
          }

          httpRequest(
            { method: 'GET', path: '/messages', params: params },
            callback
          );
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

          httpRequest(
            { method: 'POST', path: '/messages', params: params },
            callback
          );
        },

        /**
         * Delete a text message
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        delete: function (id, callback) {
          httpRequest({ method: 'DELETE', path: '/messages/' + id }, callback);
        },
      },

      mms: {
        /**
         * Get a mms message
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        read: function (id, callback) {
          httpRequest({ method: 'GET', path: '/mms/' + id }, callback);
        },

        /**
         * Send a mms message
         *
         * @param {Object} params
         * @param {Function} callback
         * @return {void}
         */
        create: function (params, callback) {
          if (params.recipients instanceof Array) {
            params.recipients = params.recipients.join(',');
          }
          httpRequest(
            { method: 'POST', path: '/mms', params: params },
            callback
          );
        },

        /**
         * Lists mms messages. Pagination is optional. If a limit is set, an
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            { method: 'GET', path: '/mms', params: params },
            callback
          );
        },

        /**
         * Delete a mms message
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        delete: function (id, callback) {
          httpRequest({ method: 'DELETE', path: '/mms/' + id }, callback);
        },
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
          httpRequest(
            { method: 'GET', path: '/voicemessages/' + id },
            callback
          );
        },

        /**
         * Lists existing voice messages. Pagination is optional. If a limit is set, an
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            { method: 'GET', path: '/voicemessages', params: params },
            callback
          );
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

          httpRequest(
            { method: 'POST', path: '/voicemessages', params: params },
            callback
          );
        },

        /**
         * Delete a voice message
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        delete: function (id, callback) {
          httpRequest(
            { method: 'DELETE', path: '/voicemessages/' + id },
            callback
          );
        },
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
          httpRequest({ method: 'GET', path: '/verify/' + id }, callback);
        },

        /**
         * Send a verification code
         *
         * @param {String} recipient
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
          httpRequest(
            { method: 'POST', path: '/verify', params: params },
            callback
          );
        },

        /**
         * Send a verification code via email
         *
         * @param {String} from
         * @param {String} to
         * @param {Object} params
         * @param {Function} callback
         * @return {void}
         */
        createWithEmail: function (from, to, params, callback) {
          if (typeof params === 'function') {
            callback = params;
            params = {};
          }
          if (!params) {
            params = {};
          }
          params.type = 'email';
          params.originator = from;

          this.create(to, params, callback);
        },

        /**
         * Delete a verification code
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        delete: function (id, callback) {
          httpRequest({ method: 'DELETE', path: '/verify/' + id }, callback);
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
            token: token,
          };

          httpRequest(
            { method: 'GET', path: '/verify/' + id, params: params },
            callback
          );
        },

        /**
         * Get email message details
         *
         * @param {String} email message id
         * @param {Function} callback
         * @return {void}
         */
        getVerifyEmailMessage: function (id, callback) {
          httpRequest(
            { method: 'GET', path: '/verify/messages/email/' + id },
            callback
          );
        },
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

          httpRequest(
            { method: 'GET', path: '/lookup/' + phoneNumber, params: params },
            callback
          );
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

            httpRequest(
              {
                method: 'GET',
                path: '/lookup/' + phoneNumber + '/hlr',
                params: params,
              },
              callback
            );
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

            httpRequest(
              {
                method: 'POST',
                path: '/lookup/' + phoneNumber + '/hlr',
                params: params,
              },
              callback
            );
          },
        },
      },

      conversations: {
        getEndpoint: function () {
          return CONVERSATIONS_ENDPOINT;
        },

        /**
         * Sends a new message to a channel-specific user identifier (e.g. phone
         * number). If an active conversation already exists for the recipient,
         * this conversation will be resumed. If an active conversation does not
         * exist, a new one will be created.
         *
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        send: function (params, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'POST',
              path: '/v1/send',
              params: params,
            },
            callback
          );
        },

        /**
         * Starts a new conversation from a channel-specific user identifier,
         * such as a phone number, and sends a first message. If an active
         * conversation already exists for the recipient, this conversation will
         * be resumed.
         *
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        start: function (params, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'POST',
              path: '/v1/conversations/start',
              params: params,
            },
            callback
          );
        },

        /**
         * Retrieves all conversations for this account. By default,
         * conversations are sorted by their lastReceivedDatetime field so that
         * conversations with new messages appear first.
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'GET',
              path: '/v1/conversations',
              params: params,
            },
            callback
          );
        },

        /**
         * Retrieves a single conversation.
         *
         * @param {String} id
         * @param {Function} callback
         * @return void
         */
        read: function (id, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'GET',
              path: '/v1/conversations/' + id,
            },
            callback
          );
        },

        /**
         * Update Conversation Status.
         *
         * @param {String} id
         * @param {String} params
         * @param {Function} callback
         * @return void
         */
        update: function (id, params, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'PATCH',
              path: '/v1/conversations/' + id,
              params: params,
            },
            callback
          );
        },

        /**
         * Adds a new message to an existing conversation and sends it to the
         * contact that you're in conversation with.
         *
         * @param {String} id
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        reply: function (id, params, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'POST',
              path: '/v1/conversations/' + id + '/messages',
              params: params,
            },
            callback
          );
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
        listMessages: function (id, limit, offset, callback) {
          var params = null;

          if (typeof callback === 'function') {
            params = {
              limit: limit,
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'GET',
              path: '/v1/conversations/' + id + '/messages',
              params: params,
            },
            callback
          );
        },

        /**
         * View a message
         *
         * @param {String} id
         * @param {Function} callback
         * @return {void}
         */
        readMessage: function (id, callback) {
          httpRequest(
            {
              hostname: CONVERSATIONS_ENDPOINT,
              method: 'GET',
              path: '/v1/messages/' + id,
            },
            callback
          );
        },

        webhooks: {
          /**
           * Creates a new webhook.
           *
           * @param {Object} params
           * @param {Function} callback
           * @return {void}
           */
          create: function (params, callback) {
            httpRequest(
              {
                hostname: CONVERSATIONS_ENDPOINT,
                method: 'POST',
                path: '/v1/webhooks',
                params: params,
              },
              callback
            );
          },

          /**
           * Retrieves an existing webhook by id.
           *
           * @param {String} id
           * @param {Function} callback
           * @return {void}
           */
          read: function (id, callback) {
            httpRequest(
              {
                hostname: CONVERSATIONS_ENDPOINT,
                method: 'GET',
                path: '/v1/webhooks/' + id,
              },
              callback
            );
          },

          /**
           * Updates a webhook.
           *
           * @param {String} id
           * @param {Object} params
           * @param {Function} callback
           * @return {void}
           */
          update: function (id, params, callback) {
            httpRequest(
              {
                hostname: CONVERSATIONS_ENDPOINT,
                method: 'PATCH',
                path: '/v1/webhooks/' + id,
                params: params,
              },
              callback
            );
          },

          /**
           * Retrieves a list of webhooks.
           *
           * @param {Number} perPage
           * @param {Number} currentPage
           * @param {Function} callback
           * @return void
           */
          list: function (limit, offset, callback) {
            var params = null;

            if (typeof callback === 'function') {
              params = {
                limit: limit,
                offset: offset,
              };
            } else {
              callback = limit;
            }

            httpRequest(
              {
                hostname: CONVERSATIONS_ENDPOINT,
                method: 'GET',
                path: '/v1/webhooks',
                params: params,
              },
              callback
            );
          },

          /**
           * Deletes webhook
           *
           * @param {String} id
           * @param {Function} callback
           * @return {void}
           */
          delete: function (id, callback) {
            httpRequest(
              {
                hostname: CONVERSATIONS_ENDPOINT,
                method: 'DELETE',
                path: '/v1/webhooks/' + id,
              },
              callback
            );
          },
        },
      },

      voice: {
        webhooks: {
          /**
           * Creates a new webhook.
           *
           * @param {Object} params
           * @param {Function} callback
           * @return {void}
           */
          create: function (params, callback) {
            httpRequest(
              {
                hostname: VOICE_ENDPOINT,
                method: 'POST',
                path: '/webhooks',
                params: params,
              },
              callback
            );
          },

          /**
           * Retrieves an existing webhook by id.
           *
           * @param {String} id
           * @param {Function} callback
           * @return {void}
           */
          read: function (id, callback) {
            httpRequest(
              {
                hostname: VOICE_ENDPOINT,
                method: 'GET',
                path: '/webhooks/' + id,
              },
              callback
            );
          },

          /**
           * Updates a webhook.
           *
           * @param {String} id
           * @param {Object} params
           * @param {Function} callback
           * @return {void}
           */
          update: function (id, params, callback) {
            httpRequest(
              {
                hostname: VOICE_ENDPOINT,
                method: 'PUT',
                path: '/webhooks/' + id,
                params: params,
              },
              callback
            );
          },

          /**
           * Retrieves a list of webhooks.
           *
           * @param {Number} perPage
           * @param {Number} currentPage
           * @param {Function} callback
           * @return void
           */
          list: function (perPage, currentPage, callback) {
            var params = null;

            if (typeof callback === 'function') {
              params = {
                perPage: perPage,
                currentPage: currentPage,
              };
            } else {
              callback = perPage;
            }

            httpRequest(
              {
                hostname: VOICE_ENDPOINT,
                method: 'GET',
                path: '/webhooks',
                params: params,
              },
              callback
            );
          },

          /**
           * Deletes webhook
           *
           * @param {String} id
           * @param {Function} callback
           * @return {void}
           */
          delete: function (id, callback) {
            httpRequest(
              {
                hostname: VOICE_ENDPOINT,
                method: 'DELETE',
                path: '/webhooks/' + id,
              },
              callback
            );
          },
        },
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

          httpRequest(
            { method: 'POST', path: '/contacts', params: params },
            callback
          );
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
          httpRequest({ method: 'DELETE', path: '/contacts/' + id }, callback);
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            { method: 'GET', path: '/contacts', params: params },
            callback
          );
        },

        /**
         * View an existing contact.
         *
         * @param {String} id
         * @param {Function} callback
         * @return void
         */
        read: function (id, callback) {
          httpRequest({ method: 'GET', path: '/contacts/' + id }, callback);
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
          httpRequest(
            { method: 'PATCH', path: '/contacts/' + id, params: params },
            callback
          );
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              method: 'GET',
              path: '/contacts/' + contactId + '/groups',
              params: params,
            },
            callback
          );
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              method: 'GET',
              path: '/contacts/' + contactId + '/messages',
              params: params,
            },
            callback
          );
        },
      },

      callflows: {
        /**
         * Lists existing call flows.
         * @param {Number} page
         * @param {Number} perpage
         * @param {Function} callback
         * @return void
         */
        list: function (page, perpage, callback) {
          var params = null;

          if (typeof callback === 'function') {
            params = {
              page: page,
              perPage: perpage,
            };
          } else {
            callback = page;
          }

          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: '/call-flows',
              params: params,
            },
            callback
          );
        },

        /**
         * Creates a new call flow, params are mandatory.
         *
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        create: function (params, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'POST',
              path: '/call-flows',
              params: params,
            },
            callback
          );
        },

        /**
         * Get a call flow
         *
         * @param {String} flowId
         * @param {Function} callback
         * @return {void}
         */
        read: function (flowId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: '/call-flows/' + flowId,
            },
            callback
          );
        },

        /**
         * Deletes an existing call flow. The callback is invoked with an error if
         * applicable, but the data will never contain anything meaningful as the
         * API returns an empty response for successful deletes.
         *
         * @param {String} flowId
         * @param {Function} callback
         * @return void
         */
        delete: function (flowId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'DELETE',
              path: '/call-flows/' + flowId,
            },
            callback
          );
        },

        /**
         * Updates an existing call flow. Params are required.
         *
         * @param {String} flowId
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        update: function (flowId, params, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'PUT',
              path: '/call-flows/' + flowId,
              params: params,
            },
            callback
          );
        },
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

          httpRequest(
            { method: 'POST', path: '/groups', params: params },
            callback
          );
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
          httpRequest({ method: 'DELETE', path: '/groups/' + id }, callback);
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            { method: 'GET', path: '/groups', params: params },
            callback
          );
        },

        /**
         * View an existing group.
         *
         * @param {String} id
         * @param {Function} callback
         * @return void
         */
        read: function (id, callback) {
          httpRequest({ method: 'GET', path: '/groups/' + id }, callback);
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

          httpRequest(
            { method: 'PATCH', path: '/groups/' + id, params: params },
            callback
          );
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
          const params = {
            groupId,
            ids: contactIds,
          };

          httpRequest(
            { method: 'PUT', path: '/groups/' + groupId + '/contacts', params },
            callback
          );
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
              offset: offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              method: 'GET',
              path: '/groups/' + groupId + '/contacts',
              params: params,
            },
            callback
          );
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
          httpRequest(
            {
              method: 'DELETE',
              path: '/groups/' + groupId + '/contacts/' + contactId,
            },
            callback
          );
        },
      },
      calls: {
        /**
         * Create a call.
         *
         * @param {Object} params
         * @param {Function} callback
         * @return void
         */
        create: function (params, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'POST',
              path: '/calls',
              params,
            },
            callback
          );
        },

        /**
         * List calls.
         *
         * @param {Function} callback
         * @return void
         */
        list: function (callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: '/calls',
            },
            callback
          );
        },

        /**
         * Read a call.
         *
         * @param {String} callId
         * @param {Function} callback
         * @return void
         */
        read: function (callId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}`,
            },
            callback
          );
        },

        /**
         * Delete a call.
         *
         * @param {String} callId
         * @param {Function} callback
         * @return void
         */
        delete: function (callId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'DELETE',
              path: `/calls/${callId}`,
            },
            callback
          );
        },
      },
      recordings: {
        /**
         * View an existing recording.
         *
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {Function} callback
         * @return void
         */
        read: function (callId, legId, recordingId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}`,
            },
            callback
          );
        },

        /**
         * List recordings.
         *
         * @param {String} callId
         * @param {String} legId
         * @param {Function} callback
         * @return void
         */
        list: function (callId, legId, limit, offset, callback) {
          var params = null;

          if (typeof callback === 'function') {
            params = {
              limit,
              offset,
            };
          } else {
            callback = limit;
          }

          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings`,
              params,
            },
            callback
          );
        },

        /**
         * Delete recordings.
         *
         * @param {String} callId
         * @param {String} legId
         * @param {String} recId
         * @param {Function} callback
         * @return void
         */

        delete: function (callId, legId, recId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'DELETE',
              path: `/calls/${callId}/legs/${legId}/recordings/${recId}`,
            },
            callback
          );
        },

        /**
         * Download an existing recording.
         *
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {Function} callback
         * @return void
         */
        download: function (callId, legId, recordingId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}.wav`,
            },
            callback
          );
        },
      },
      transcriptions: {
        /**
         * Creates a new transcription.
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {String} language
         * @param {Function} callback
         * @return void
         */
        create: function (callId, legId, recordingId, language, callback) {
          var params = {
            language: language,
          };

          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'POST',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}/transcriptions`,
              params: params,
            },
            callback
          );
        },

        /**
         * List transcriptions.
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {Function} callback
         * @return void
         */
        list: function (callId, legId, recordingId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}/transcriptions`,
            },
            callback
          );
        },

        /**
         * View an existing transcription.
         *
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {String} language
         * @param {Function} callback
         * @return void
         */
        read: function (callId, legId, recordingId, transcriptionId, callback) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}/transcriptions/${transcriptionId}`,
            },
            callback
          );
        },

        /**
         * Downloads an existing transcription.
         * @param {String} callId
         * @param {String} legId
         * @param {String} recordingId
         * @param {String} transcriptionId
         * @param {Function} callback
         * @return void
         */
        download: function (
          callId,
          legId,
          recordingId,
          transcriptionId,
          callback
        ) {
          httpRequest(
            {
              hostname: VOICE_ENDPOINT,
              method: 'GET',
              path: `/calls/${callId}/legs/${legId}/recordings/${recordingId}/transcriptions/${transcriptionId}.txt`,
            },
            callback
          );
        },
      },
    };
  },
};
