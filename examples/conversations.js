
const messagebird = require('messagebird')('<YOUR_ACCESS_KEY>');

// start a conversation
messagebird.conversations.start({
  'to': '31612345678',
  'channelId': '619747f69cf940a98fb443140ce9aed2',
  'type': 'text',
  'content': { 'text': 'Hello!' }
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// list conversations
messagebird.conversations.list(20, 0, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// get conversation
messagebird.conversations.read('46d0cef122574e8da60d9fb9e5de5eb9', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// update conversation status
messagebird.conversations.update('46d0cef122574e8da60d9fb9e5de5eb9', {
  'status': 'archived'
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// reply to conversation
messagebird.conversations.reply('649ca3dc307544e1b56ac1ca55d572d1', {
  'type': 'text',
  'content': {
    'text': 'Hello!'
  }
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// get messages in conversation
messagebird.conversations.listMessages('46d0cef122574e8da60d9fb9e5de5eb9', 20, 0, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// get message
messagebird.conversations.readMessage('93e00b69b1094befbd3fe71290469f1a', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// create webhook
messagebird.conversations.webhooks.create({
  'events': [
    'message.created',
    'message.updated'
  ],
  'channelId': '853eeb5348e541a595da93b48c61a1ae',
  'url': 'https://example.com/webhook'
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// list webhooks
messagebird.conversations.webhooks.list(100, 0, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// get webhook
messagebird.conversations.webhooks.read('451e6b72799e4415b2aab425f582f65e', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// update webhook
messagebird.conversations.webhooks.update('451e6b72799e4415b2aab425f582f65e', {
  'status': 'disabled'
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// delete webook
messagebird.conversations.webhooks.delete('451e6b72799e4415b2aab425f582f65e', function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

// send hsm message
messagebird.conversations.reply('6710713c4605456f894b93580e8b5791', {
  'type': 'hsm',
  'content': {
    'hsm': {
      'namespace': '5ba2d0b7_f2c6_433b_a66e_57b009ceb6ff',
      'templateName': 'order_update',
      'language': {
        'policy': 'deterministic',
        'code': 'en'
      },
      'params': [
        { 'default': 'Bob' },
        { 'default': 'tomorrow!' }
      ]
    }
  }
}, function (err, response) {
  if (err) {
    return console.log(err);
  }
  console.log(response);
});

