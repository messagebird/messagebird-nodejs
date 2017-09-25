const httpRequest = require('../utils/http-request')

const lookup = {
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
    read: (phoneNumber, countryCode, callback) => {
      var params = {}
      if (typeof countryCode === 'function') {
        callback = countryCode
        countryCode = null
      }

      if (countryCode) {
        params.countryCode = countryCode
      }

      httpRequest('GET', '/lookup/' + phoneNumber + '/hlr', params, callback);
    },
    create: (phoneNumber, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = null;
      }
      httpRequest('POST', '/lookup/' + phoneNumber + '/hlr', params, callback);
    }
  }
}

module.exports = lookup