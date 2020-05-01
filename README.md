MessageBird REST API for Node.js
================================

This repository contains the open source Node.js client for MessageBird's REST API.
Documentation can be found at: https://developers.messagebird.com


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
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');
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
  //In this case 20 is limit and 0 is offset
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

We sign our HTTP requests to allow you to verify that they actually came from us (authentication) and that they haven't been altered along the way (integrity). For each HTTP request that MessageBird sends, a `MessageBird-Signature` and `MessageBird-Request-Timestamp` header is added. Signature middleware calculates a signature using the timestamp, query parameters and body then compares the calculated signature to `MessageBird-Signature` header. If they are not same or request expired, middleware throws an error. This way, you will know if the request is valid or not. If you want to verify request manually, you can check [here](https://developers.messagebird.com/docs/verify-http-requests). Let's use Signature middleware to verify webhooks.

```
var Signature = require('messagebird/lib/signature');

// Replace <YOUR_SIGNING_KEY> with your actual signing key.
var verifySignature = new Signature('<YOUR_SIGNING_KEY>');

// Retrieve the raw body as a buffer.
app.use(require('body-parser').raw({ type: '*/*' }));

// Verified webhook.
app.get('/webhook', verifySignature, function(req, res) {
    res.send("Verified");
});

```

Conversations Whatsapp Sandbox
-------------

To use the whatsapp sandbox you need to add `"ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX"` to the list of features you want enabled. Don't forget to replace `<YOUR_ACCESS_KEY>` with your actual access key.

```javascript
var messagebird = require('messagebird')("<YOUR_ACCESS_KEY>", null, ["ENABLE_CONVERSATIONSAPI_WHATSAPP_SANDBOX"]);
```
Documentation
-------------

Complete documentation, instructions, and examples are available at:
[https://developers.messagebird.com](https://developers.messagebird.com)


License
-------
The MessageBird REST API for Node.js is licensed under [The BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause). Copyright (c) 2014, MessageBird
