var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// update webhook
messagebird.voice.webhooks.update('<WEBHOOK_ID>', {
  'token': '<TOKEN_NAME>',
  'url': '<WEBHOOK_URL>',
  'title': '<WEBHOOK_TITLE>'
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
