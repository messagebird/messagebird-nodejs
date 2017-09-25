const balance = require('./api/balance')
const hlr = require('./api/hlr')
const messages = require('./api/messages')
const voice_messages = require('./api/voice_messages')
const verify = require('./api/verify')
const lookup = require('./api/lookup')

module.exports = function (accessKey, timeout) {
  const config = {
    accessKey,
    timeout: timeout || 5000
  }
  const messageBirdClient = { balance, hlr, messages, voice_messages, verify, lookup }
  return messageBirdClient
}