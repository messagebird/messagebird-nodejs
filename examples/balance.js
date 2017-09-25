
var messagebird = require('messagebird');

messagebird.balance.read(function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log('Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment);
});
