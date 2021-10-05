
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.balance.read(function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log('Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment);
});
