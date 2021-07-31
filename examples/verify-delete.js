
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.verify.delete('<VERIFY_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
