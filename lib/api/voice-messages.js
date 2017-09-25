const httpRequest = require('../utils/http-request')

const path = '/voicemessages'

const voice_messages = {
  read: (id, callback) => {
    httpRequest('GET', `${path}/${id}`, callback)
  },
  create: (recipients, params, callback) => {
    if (recipients instanceof Object) {
      callback = params
      params = recipients
      recipients = null
    }

    if (recipients) {
      params.recipients = recipients
    }

    if (params.recipients instanceof Array) {
      params.recipients = params.recipients.join(',')
    }

    httpRequest('POST', path, params, callback)
  }
}

module.exports = voice_messages