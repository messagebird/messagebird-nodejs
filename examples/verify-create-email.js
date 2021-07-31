
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// email from which users will receive the verification token
let from = '<FROM_EMAIL>';

// email to which the verification code will be sent to
let to = '<TO_EMAIL>';
let additionalParams = {
  subject: 'Your verification code',
  template: 'Your security token: %token',
  timeout: 300
};

// Creating a token with email
messagebird.verify.createWithEmail(from, to, additionalParams, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// Validating a token
let verifyId = '<VERIFY_ID>';
let token = '<TOKEN>';

messagebird.verify.verify(verifyId, token, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// Retrieving a email message
let emailMessageId = '<MESSAGE_ID>';

messagebird.verify.getVerifyEmailMessage(emailMessageId, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});
