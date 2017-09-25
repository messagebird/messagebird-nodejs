
var messagebird = require('messagebird')

messagebird.hlr.read('<HLR_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
