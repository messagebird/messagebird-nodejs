
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

var params = {
  'recipients': [
    '31612345678'
  ],
  'body': 'Hello, world'
};

messagebird.voice_messages.create(params, function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
