var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// list recordings
messagebird.recordings.list('<CALL_ID>', '<LEG_ID>', '<LIMIT>', '<OFFSET>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// read a recording
messagebird.recordings.read('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// download a recording
messagebird.recordings.download('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
