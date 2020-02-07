
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.messages.list(function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });
  
  messagebird.messages.list({status: "scheduled"}, function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });