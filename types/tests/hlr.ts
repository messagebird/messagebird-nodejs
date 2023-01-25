import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

// $ExpectType void
mbClient.hlr.read('<ID>', (err, hlr) => {
  // $ExpectType Error | null
  err;

  // ExpectType Hlr | null
  hlr;
});

// $ExpectType void
mbClient.hlr.create(31612345678, (err, hlr) => {
  // $ExpectType Error | null
  err;

  // ExpectType Hlr | null
  hlr;
});

// $ExpectType void
mbClient.hlr.create(31612345678, '<ref>', (err, hlr) => {
  // $ExpectType Error | null
  err;

  // ExpectType Hlr | null
  hlr;
});
