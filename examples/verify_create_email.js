
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

var from = "<FROM_EMAIL>";//email from which users will receive the verification token
var to = "<TO_EMAIL>";//email to which the verification code will be sent to
var additionalParams = {
  subject: 'Your verification code',
  template: 'Your security token: %token',
  timeout: 300
}

//Creating a token with email
messagebird.verify.createWithEmail(from, to, additionalParams, function (err, response) {
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