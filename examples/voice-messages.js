const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

const params = {
  recipients: ['31612345678'],
  body: 'Hello, world'
};

// create a voice message
messagebird.voice_messages.create(params, function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});

// list voice messages for this account
messagebird.voice_messages.list(20, 0, function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});

// read a specific voice message by ID
messagebird.voice_messages.read('<VOICE_MESSAGE_ID>', function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
