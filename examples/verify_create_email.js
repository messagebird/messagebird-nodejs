
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

params = {
  type: 'email',
  subject: 'Login code',
  originator: '<ORIGINATOR EMAIL>',
  template: 'Your security token: %token',
  timeout: 300
}

//Creating a token
messagebird.verify.create('<RECIPIENT_EMAIL>', params, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

//Validating a token
var verifyId = '<VERIFY_ID>';
var token = '<TOKEN>';
messagebird.verify.verify(verifyId, token, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

//Retrieving a email message
var emailMessageId = '<MESSAGE_ID>';
messagebird.verify.getVerifyEmailMessage(emailMessageId, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});