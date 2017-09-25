const httpRequest = require('../utils/http-request');

class Balance {
  read(callback) {
    httpRequest('GET', '/balance', callback);
  }
}

module.exports = Balance;
