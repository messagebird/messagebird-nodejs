
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.verify.create('31612345678', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
