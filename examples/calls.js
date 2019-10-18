var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// create a call
var params = {
  source: "<SOURCE_PHONE_NUMBER>",
  destination: "<DESTINATION_PHONE_NUMBER>",
  callFlow: {
    title: "Say message",
    steps: [
      {
        action: "say",
        options: {
          payload: "This is a journey into sound. Good bye!",
          voice: "male",
          language: "en-US"
        }
      }
    ]
  }
};

messagebird.calls.create(params, function (err, response) {
  if (err) {
      return console.log(err);
  }
  console.log(response);
});

// list calls
messagebird.calls.list(function (err, response) {
  if (err) {
      return console.log(err);
  }
  console.log(response);
});

// read a call
messagebird.calls.read('<CALL_ID>' ,function (err, response) {
  if (err) {
      return console.log(err);
  }
  console.log(response);
});

// delete a call
messagebird.calls.delete('<CALL_ID>' ,function (err, response) {
  if (err) {
      return console.log(err);
  }
  console.log(response);
});
