import messagebird from 'messagebird';

const mbClient = messagebird('<AccessKey>');

mbClient.transcriptions.create('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<LANGUAGE>', (
  // $ExpectType Error | null
  err,
  // $ExpectType TranscriptionData | null
  transcriptionData
) => {});

mbClient.transcriptions.list('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType TranscriptionData | null
  transcriptionData
) => {});

mbClient.transcriptions.read('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<TRANSCRIPTION_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType TranscriptionData | null
  transcriptionData
) => {});

mbClient.transcriptions.download('<CALL_ID>', '<LEG_ID>', '<RECORDING_ID>', '<TRANSCRIPTION_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType string | boolean | null
  transcriptionContent
) => {});
