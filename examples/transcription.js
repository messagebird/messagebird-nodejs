
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

messagebird.transcriptions.create('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<LANGUAGE>', function (err, data) {
  if (err) {
    return console.log(err);
  }

  console.log(data);
});

messagebird.transcriptions.list('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', function (err, data) {
  if (err) {
    return console.log(err);
  }

  console.log(data);
});

messagebird.transcriptions.read('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<TRANSCRIPTION_ID>', function (err, data) {
  if (err) {
    return console.log(err);
  }

  console.log(data);
});

messagebird.transcriptions.download('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<TRANSCRIPTION_ID>', function (err, data) {
  if (err) {
    return console.log(err);
  }

  console.log(data);
});
