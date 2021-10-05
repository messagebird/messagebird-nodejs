
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.lookup.hlr.read('31612345678', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
