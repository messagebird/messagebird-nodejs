var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// list webhooks
messagebird.voice.webhooks.list(100, 0, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
