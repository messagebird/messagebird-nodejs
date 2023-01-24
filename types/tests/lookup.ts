import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.lookup.read('31612345678', (
  // $ExpectType Error | null
  err,
  // $ExpectType Lookup | null
  lookupObject
) => {});

mbClient.lookup.read('0612345678', 'NL', (
  // $ExpectType Error | null
  err,
  // $ExpectType Lookup | null
  lookupObject
) => {});

mbClient.lookup.hlr.read('31612345678', (
  // $ExpectType Error | null
  err,
  // $ExpectType Hlr | null
  hlrObject
) => {});

mbClient.lookup.hlr.read('0612345678', 'NL', (
  // $ExpectType Error | null
  err,
  // $ExpectType Hlr | null
  hlrObject
) => {});
