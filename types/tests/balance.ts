import { initClient } from 'messagebird';

const mbClient = initClient('<AccessKey>');

mbClient.balance.read((err, balance) => {
  // $ExpectType Error | null
  err;

  // $ExpectType Balance | null
  balance;
});
