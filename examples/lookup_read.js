
var messagebird = require('messagebird')

messagebird.lookup.read('31612345678', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
