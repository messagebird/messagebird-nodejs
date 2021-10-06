// This example show how to verify the authenticity of a MessageBird webhook.
const mbWebhookSignatureJwt = require('messagebird/lib/webhook-signature-jwt');
const express = require('express');

const secret = '<YOUR SIGNING KEY>';

const app = express();

// If the node server is behind a proxy, you must trust the proxy to infer the correct protocol and hostname.

app.set('trust proxy', () => true);

// Replace <YOUR_SIGNING_KEY> with your actual signing key.
const verifySignature = new mbWebhookSignatureJwt.ExpressMiddlewareVerify(secret);

// Retrieve the raw body as a buffer.
app.use(express.raw({ 'type': '*/*' }));

// Verified webhook.
app.get('/webhook', verifySignature, (req, res) => {
  res.send('verified');
});
app.post('/webhook', verifySignature, (req, res) => {
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
const skipUrlOpts = new mbWebhookSignatureJwt.VerifyOptions();

skipUrlOpts.validateUrl = false;
let skipUrlVerifySignature = new mbWebhookSignatureJwt.ExpressMiddlewareVerify(secret, skipUrlOpts);

app.get('/webhook-skip-url-verification', skipUrlVerifySignature, (req, res) => {
  res.send('partialy verified');
});


// It's also possible to protect further by ensuring the uniqueness of the JWT ID (jti).
// By default jti is required but always considered valid.
//
// Do note that the following implementation isn't production-grade and only for demonstration purposes.
const verifyJtiOpts = new mbWebhookSignatureJwt.VerifyOptions();
const seenJtis = new Set();

skipUrlOpts.jwtVerifyJti = (jti) => {
  if (seenJtis.has(jti)) {
    return false;
  }
  seenJtis.add(jti);
  return true;
};
const verifyJtiVerifySignature = new mbWebhookSignatureJwt.ExpressMiddlewareVerify(secret, verifyJtiOpts);

app.get('/webhook-verify-jti', verifyJtiVerifySignature, (req, res) => {
  res.send('verified with jti');
});

app.listen(8000, () => {
  console.log('Example webhooks hanlder listening at http://localhost:8000');
});
