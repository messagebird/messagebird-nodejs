import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.recordings.list('<CALL_ID>', '<LEG_ID>', 100, 0, (
  // $ExpectType Error | null
  err,
  // $ExpectType Recording[] | null
  recordings
) => {});

mbClient.recordings.read('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>',
  (
    // $ExpectType Error | null
    err,
    // $ExpectType Recording | null
    recording
  ) => {}
);

mbClient.recordings.download('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>',
  (
    // $ExpectType Error | null
    err,
    // $ExpectType unknown
    recording
  ) => {}
);
