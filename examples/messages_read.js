
var messagebird = require('messagebird')

messagebird.messages.read('<MESSAGE_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
