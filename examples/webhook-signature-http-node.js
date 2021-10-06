const mbWebhookSignatureJwt = require('messagebird/lib/webhook-signature-jwt');
const http = require('http');
const { createSecretKey } = require('crypto');

const secret = createSecretKey(Buffer.from('<YOUR SIGNING KEY>', 'utf-8'));

// getProtocol try to infer original the protocol.
function getProtocol(req) {
  if (
    req.connection.encrypted || (typeof req.headers.forwarded !== 'undefined' && req.headers.forwarded.includes('proto=https')) || req.headers['x-forwarded-proto'] === 'https'
  ) {
    return 'https';
  }
  return 'http';
}

const server = http.createServer((req, res) => {
  if (!req.url.startsWith('/webhook')) {
    res.statusCode = 404;
    res.end();
  }

  let chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });
  req.on('end', () => {
    Promise.resolve()
      .then(() => {
        let body = Buffer.concat(chunks);
        let url = `${getProtocol(req)}://${req.headers.host}${req.url}`;
        let jwt = req.headers[mbWebhookSignatureJwt.SIGNATURE_HEADER_NAME];

        return mbWebhookSignatureJwt.verify(
          url,
          body,
          jwt,
          secret
        ).then(() => {
          res.statusCode = 200;
        });
      })
      .catch((err) => {
        console.log(err);
        res.statusCode = 403;
      }).finally(() => res.end());
  });
});

server.listen(8000, 'localhost', () => {
  console.log('Example webhooks hanlder listening at http://localhost:8000');
});
