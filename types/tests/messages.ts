import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.messages.read('<ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType Message | null
  message
) => {});

mbClient.messages.create(
  {
    originator: '<originator>',
    recipients: [3161234567, '3161234567'],
    body: '<body>'
  },
  (
    // $ExpectType Error | null
    err,
    // $ExpectType Message | null
    message
  ) => {}
);
