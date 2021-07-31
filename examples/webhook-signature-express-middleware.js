const mbWebookSignatureJwt = require('messagebird/lib/webookSignatureJwt');
const express = require('express');

let app = express();

// Replace <YOUR_SIGNING_KEY> with your actual signing key.
let verifySignature = new mbWebookSignatureJwt.ExpressMiddlewareVerify('<YOUR_SIGNING_KEY>');

// Retrieve the raw body as a buffer.
app.use(require('body-parser').raw({ type: '*/*' }));

// Verified webhook.
app.get('/webhook', verifySignature, (req, res) => {
  res.send('verified');
});

// If the application is sitting behind an uncooperative or untrusted proxy not setting headers like 'x-forwarded-proto', 'forwarded', etc.
// it's possible to only perform a partial verification covering:
// - the payload of the request: was the payload altered?
// - the origin of the request: is the request coming from MessageBird?
//
// However it doesn't verify if the URL was altered or not.
//
// This shouldn't be used in a production system and when used no query parameters should be trusted.
let advancedOpts = new mbWebookSignatureJwt.VerifyOptions();

advancedOpts.validateUrl = false;
let skipUrlVerifySignature = new mbWebookSignatureJwt.ExpressMiddlewareVerify('<YOUR_SIGNING_KEY>', advancedOpts);

app.get('/webhook-skip-url-verification', skipUrlVerifySignature, (req, res) => {
  res.send('partialy verified');
});
