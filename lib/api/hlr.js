const httpRequest = require('../utils/http-request')

const hlr = {
  read: (id, callback) => {
    httpRequest('GET', '/hlr/' + id, callback)
  },
  create: (msisdn, ref, callback) => {
    const params = {
      msisdn: msisdn,
      reference: (typeof ref === 'function') ? null : ref
    }
    httpRequest('POST', '/hlr', params, callback || ref)
  }
}

module.exports = hlr