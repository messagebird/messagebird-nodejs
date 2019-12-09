var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// delete webook
messagebird.voice.webhooks.delete('<WEBHOOK_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
