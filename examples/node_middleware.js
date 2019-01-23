var Signature = require('messagebird/lib/signature');
var verifySignature = new Signature('af8ay41b9uafa9k3pla');

app.get('/webhook', verifySignature, function(req, res) {
    res.send("OK");
});