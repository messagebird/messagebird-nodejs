
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.hlr.create('31612345678', 'MessageBird', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
