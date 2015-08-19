
var messagebird = require('messagebird');

messagebird.balance.read (function (error, response) {
  console.log ('Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment);
});
