var Signature = require('messagebird/lib/signature');

// Replace <YOUR_SIGNING_KEY> with your actual signing key.
var verifySignature = new Signature('<YOUR_SIGNING_KEY>');

// Retrieve the raw body as a buffer.
app.use(require('body-parser').raw({ type: '*/*' }));

// Verified webhook.
app.get('/webhook', verifySignature, function(req, res) {
    res.send("Verified");
});