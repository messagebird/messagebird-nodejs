const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// get webhook
messagebird.voice.webhooks.read('<WEBHOOK_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
