import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.calls.create({
  source: '31612345678',
  destination: '31612345678',
  callFlow: {
    steps: [
      {
        action: 'say',
        options: {
          payload: 'This is a journey into sound. Good bye!',
          voice: 'male',
          language: 'en-us',
        }
      }
    ]
  },
},
  (
    // $ExpectType Error | null
    err,
    // $ExpectType Call | null
    call
  ) => {}
);

mbClient.calls.read('<CALL_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType Call | null
  call
) => {});

mbClient.calls.list(
  (
    // $ExpectType Error | null
    err,
    // $ExpectType Call[] | null
    calls
  ) => {}
);

mbClient.calls.read('<CALL_ID>',
  (
    // $ExpectType Error | null
    err,
    // $ExpectType Call | null
    call
  ) => {}
);
