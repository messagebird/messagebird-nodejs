import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.verify.read('<VERIFY_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType Verify | null
  verifyObject
) => {});

mbClient.verify.create('31612345678', (
  // $ExpectType Error | null
  err,
  // $ExpectType Verify | null
  verifyObject
) => {});

mbClient.verify.create('31612345678', {
  type: "sms",
  datacoding: "plain",
  tokenLength: 8
}, (
  // $ExpectType Error | null
  err,
  // $ExpectType Verify | null
  verifyObject
) => {});

mbClient.verify.delete('<VERIFY_ID>', (
  // $ExpectType Error | null
  err,
  // $ExpectType void | null
  verifyObject
) => {});

mbClient.verify.verify('<VERIFY_ID>', '<TOKEN>', (
  // $ExpectType Error | null
  err,
  // $ExpectType Verify | null
  verifyObject
) => {});
