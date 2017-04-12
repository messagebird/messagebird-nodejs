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

```javascript
var messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');
```

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


Documentation
-------------

Complete documentation, instructions, and examples are available at:
[https://developers.messagebird.com](https://developers.messagebird.com)


License
-------
The MessageBird REST API for Node.js is licensed under [The BSD 2-Clause License](http://opensource.org/licenses/BSD-2-Clause). Copyright (c) 2014, MessageBird
