
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.verify.verify('<VERIFY_ID>', '<TOKEN>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
