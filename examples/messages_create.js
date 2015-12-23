
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

var params = {
  'originator': 'MessageBird',
  'recipients': [
    '31612345678'
  ],
  'body': 'Hello, world!'
};

messagebird.messages.create(params, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
