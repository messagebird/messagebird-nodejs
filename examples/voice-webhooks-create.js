var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

//create webhook
messagebird.voice.webhooks.create({
  'url': '<WEBHOOK_URL>',
  'title': '<WEBHOOK_TITLE>',
  'token': '<TOKEN_NAME>'
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
