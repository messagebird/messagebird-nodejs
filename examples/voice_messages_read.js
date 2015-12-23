
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.voice_messages.read('<VOICE_MESSAGE_ID>', function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
