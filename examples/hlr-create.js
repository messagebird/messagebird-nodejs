
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.hlr.create('31612345678', 'YourBrand', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
