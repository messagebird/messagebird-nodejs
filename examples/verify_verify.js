
var messagebird = require('messagebird')

messagebird.verify.verify('<VERIFY_ID>', '<TOKEN>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
