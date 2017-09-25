const httpRequest = require('../utils/http-request')

const messages = {
  read: (id, callback) => {
    httpRequest('GET', '/messages/' + id, callback)
  },
  create: (params, callback) => {
    if (params.recipients instanceof Array) {
      params.recipients = params.recipients.join(',')
    }
    httpRequest('POST', '/messages', params, callback)
  }
}

module.exports = messages