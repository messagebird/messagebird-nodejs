
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.verify.read('<VERIFY_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
