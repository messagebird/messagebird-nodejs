const httpRequest = require('../utils/http-request')

const balance = {
  read: callback => {
    httpRequest('GET', '/balance', callback);
  }
}

module.exports = balance