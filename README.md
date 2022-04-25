MessageBird REST API for Node.js
================================

This repository contains the open source Node.js client for MessageBird's REST API.
Documentation can be found at: [https://developers.messagebird.com](https://developers.messagebird.com)

Requirements
------------

- [Sign up](https://www.messagebird.com/en/signup) for a free MessageBird account
- Create a new `access_key` in the [developers](https://www.messagebird.com/app/en/settings/developers/access) section
- MessageBird REST API for Node.js requires Node.js >= 0.10 or io.js

Installation
------------

`npm install messagebird`

Usage
-----

We have put some self-explanatory examples in the *examples* directory, but here is a quick breakdown on how it works.
Let's go ahead and initialize the library first. Don't forget to replace `<YOUR_ACCESS_KEY>` with your actual access key.

CommonJS require syntax:

```javascript
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');
```

Typescript with ES6 import (or .mjs with Node >= v13):

```typescript
import initMB from 'messagebird';
const messagebird = initMB('<YOUR_ACCESS_KEY>');
```

Tip: Don't forget to enable the `esModuleInterop` in tsconfig.json.

Nice! Now we can send API requests through node. Let's use getting your balance overview as an example:

```javascript
// Get your balance
messagebird.balance.read(function (err, data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});

// Result object:
{
  payment: 'prepaid',
  type: 'credits',
  amount: 42.5
}
```

Or in case of an error:

```javascript
{ [Error: api error]
  errors: [
    {
      code: 2,
      description: 'Request not allowed (incorrect access_key)',
      parameter: 'access_key'
    }
  ]
}
```

Notes
-------------

Messaging and Voice API use different pagination semantics:
  
  **Messaging API** uses limit and offset params for list methods (where applicable)

  ````javascript
  // list conversations
  // In this case 20 is limit and 0 is offset
  messagebird.conversations.list(20, 0, function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });
  ````

  **Voice API** uses page and perPage params for list methods (where applicable)

  ````javascript
  // list Call Flows
  // In this case 1 is page, 2 is items per page
  messagebird.callflows.list(1, 2, function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });
  ````

Verifying Signatures
-------------

For each HTTP request that MessageBird sends, a `MessageBird-Signature-JWT` header is added.

The `MessageBird-Signature-JWT` header is a signature that consists of all the information that is required to verify the integrity of the request. The signature is generated from the request URL and request body and is signed with the HMAC-SHA256 algorithm using your your signing key. You can validate this signature using our SDKsto ensure that the request is valid and unaltered. The token also includes timestamp claims that allow you to prove the time of the request, protecting from replay attacks and the like.
For more details consult the [documentation](https://developers.messagebird.com/api/#verifying-http-requests).

Examples:

- [full example with Express](./examples/webhook-signature-express-middleware.js)
- [example in vanilla JS](./examples/webhook-signature-http-node.js)

Let's use Express Signature middleware to verify webhooks.

```javascript
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
```

Documentation
-------------

Complete documentation, instructions, and examples are available at:
[https://developers.messagebird.com](https://developers.messagebird.com)

License
-------

The MessageBird REST API for Node.js is licensed under [The BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause). Copyright (c) 2022, MessageBird
