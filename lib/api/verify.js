const httpRequest = require('../utils/http-request')

const verify = {
  read: (id, callback) => {
    httpRequest('GET', '/verify/' + id, callback);
  },

  create: (recipient, params, callback) => {
    if (typeof params === 'function') {
      callback = params
      params = {}
    }

    if (recipient instanceof Array) {
      recipient = recipient[0]
    }

    params.recipient = recipient;
    httpRequest('POST', '/verify', params, callback);
  },
  delete: (id, callback) => {
    httpRequest('DELETE', '/verify/' + id, callback);
  },
  verify: (id, token, callback) => {
    var params = { token }
    httpRequest('GET', '/verify/' + id, params, callback);
  }
}

module.exports = verify