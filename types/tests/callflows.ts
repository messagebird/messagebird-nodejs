import messagebird from 'messagebird';

const mbClient = messagebird('<AccessKey>');

mbClient.callflows.create({
    steps: [
            {
                action: 'say',
                options: {
                    payload: 'This is a journey into sound. Good bye!',
                    voice: 'male',
                    language: 'en-us',
                }
            }
        ],
    record: false
  },
    (
        // $ExpectType Error | null
        err,
        // $ExpectType CallFlow | null
        callflows
    ) => {}
);

mbClient.callflows.read('<CALLFLOW_ID>', (
    // $ExpectType Error | null
    err,
    // $ExpectType CallFlow | null
    callflows
) => {}
);

mbClient.callflows.list((
    // $ExpectType Error | null
    err,
    // $ExpectType CallFlow[] | null
    callflows
) => {}
);

mbClient.callflows.delete('<CALLFLOW_ID>', (
    // $ExpectType Error | null
    err,
    // $ExpectType unknown
    callflows
) => {}
);
