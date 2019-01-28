import messagebird from 'messagebird';

const mbClient = messagebird('<AccessKey>');

mbClient.voice_messages.read('<ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType VoiceMessage | null
  voiceMessage
) => {});

mbClient.voice_messages.create(
  {
    originator: '<originator>',
    recipients: [3161234567, '3161234567'],
    body: '<body>'
  },
  (
    // $ExpectType Error | null
    err,
    // $ExpectType VoiceMessage | null
    message
  ) => {}
);

mbClient.voice_messages.create(
  [3161234567, '3161234567'],
  {
    originator: '<originator>',
    body: '<body>'
  },
  (
    // $ExpectType Error | null
    err,
    // $ExpectType VoiceMessage | null
    message
  ) => {}
);
