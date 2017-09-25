const httpRequest = require('../utils/http-request')

const path = '/hlr'

const hlr = {
  read: (id, callback) => {
    httpRequest('GET', `${path}/${id}`, callback)
  },
  create: (msisdn, ref, callback) => {
    const params = {
      msisdn,
      reference: (typeof ref === 'function') ? null : ref
    }
    httpRequest('POST', path, params, callback || ref)
  }
}

module.exports = hlr