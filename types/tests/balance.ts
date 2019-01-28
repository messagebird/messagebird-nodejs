import messagebird from 'messagebird';

const mbClient = messagebird('<AccessKey>');

mbClient.balance.read((err, balance) => {
  // $ExpectType Error | null
  err;

  // $ExpectType Balance | null
  balance;
});
