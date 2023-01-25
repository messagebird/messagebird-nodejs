const fs = require('fs');
const path = require ('path');
const root = path.resolve('.');
const nock = require('nock');
const pkg = require(root + '/package.json');
const validateSignature = require('./signature');
const webookSignatureJwt = require('./webhook-signature-jwt');
const { createSecretKey } = require('crypto');

const MessageBird = require(root);
var messagebird;

var accessKey = process.env.MB_ACCESSKEY || null;
var timeout = process.env.MB_TIMEOUT || 5000;
var number = parseInt(process.env.MB_NUMBER, 10) || 31612345678;
var emailFrom = process.env.MB_EMAIL_FROM || 'test_from@email.com';
var emailTo = process.env.MB_EMAIL_TO || 'test_to@email.com';

var testStart = Date.now();
var errors = 0;
var queue = [];
var next = 0;
var accessType = null;

var cache = {
  textMessage: {
    originator: 'node-js',
    recipients: [number],
    type: 'sms',
    body: 'Test message from node ' + process.version
  },

  voiceMessage: {
    originator: 'node-js',
    recipients: [number],
    body: 'Hello, this is a test message from node version ' + process.version,
    language: 'en-gb',
    voice: 'female',
    repeat: 1,
    ifMachine: 'continue'
  },

  hlr: {},

  verify: {
    recipient: number.toString()
  },

  verifyEmail: {},

  lookup: {
    phoneNumber: number
  },

  transcription: {},

  callflow: {}
};

const VOICE_ENDPOINT = 'https://voice.messagebird.com';

/**
 * doColor returns a color-coded string
 *
 * @param {String} str
 * @param {String} color
 * @return {String}
 */
function doColor(str, color) {
  var colors = {
    red: '\u001b[1m\u001b[31m',
    green: '\u001b[1m\u001b[32m',
    yellow: '\u001b[1m\u001b[33m',
    reset: '\u001b[0m'
  };

  return colors [color] + str + colors.reset;
}

// Output
function cGood(arg) {
  console.log(doColor('good', 'green') + ' - ' + arg);
}

function cFail(arg) {
  console.log(doColor('fail', 'red') + ' - ' + arg);
  errors++;
}

function cInfo(arg) {
  console.log(doColor('info', 'yellow') + ' - ' + arg);
}

function cDump(arg) {
  console.dir(arg, { depth: null, colors: true });
}

function cError(arg, err) {
  console.log(doColor('ERR', 'red') + '  - ' + arg + '\n');
  cDump(err);
  console.log();
  console.error(err.stack);
  console.log();
  errors++;
}


// handle exits
/* eslint no-process-exit:0 */
process.on('exit', function () {
  var timing = (Date.now() - testStart) / 1000;

  if (process.env.CIRCLE_ARTIFACTS) {
    fs.rename(root + '/npm-debug.log', process.env.CIRCLE_ARTIFACTS + '/npm-debug-' + process.versions.node + '.log', function () {});
  }

  console.log();
  cInfo('Timing: ' + timing + ' sec');
  cInfo('Memory usage:');
  cDump(process.memoryUsage());

  if (errors === 0) {
    console.log('\nDONE, no errors.\n');
    process.exit(0);
  } else {
    console.log('\n' + doColor('FAIL', 'red') + ', ' + errors + ' error' + (errors > 1 ? 's' : '') + ' occurred!\n');
    process.exit(1);
  }
});

// prevent errors from killing the process
process.on('uncaughtException', function (err) {
  cError('uncaughtException', err);
});

// Queue to prevent flooding
function doNext() {
  next++;
  if (queue [next]) {
    queue [next]();
  }
}

/**
 * doTest checks for error
 * else runs specified tests
 *
 * @param {Error} err
 * @param {String} label
 * @param {Array} tests
 *
 * doTest(err, 'label text', [
 *   ['feeds', typeof feeds === 'object']
 * ]);
 */
function doTest(err, label, tests) {
  var testErrors = [];
  var i;

  if (err instanceof Error) {
    cError(label, err);
    errors++;
  } else {
    for (i = 0; i < tests.length; i++) {
      if (tests [i] [1] !== true) {
        testErrors.push(tests [i] [0]);
        errors++;
      }
    }

    if (testErrors.length === 0) {
      cGood(label);
    } else {
      cFail(label + '(' + testErrors.join(', ') + ')');
    }
  }

  doNext();
}

/**
 * expectError fails if the error is empty.
 *
 * @param {Error} err
 * @param {String} label
 */
function expectError(err, label) {
  doTest(null, label, [
    ['expectError', err instanceof Error]
  ]);
}

queue.push(function () {
  messagebird.messages.create(
    {},
    function (err) {
      doTest(null, 'error handling', [
        ['type', err instanceof Error],
        ['message', err.message === 'api error(s): no (correct) recipients found (code: 9, parameter: recipients), originator is required (code: 9, parameter: originator)'],
        ['errors', err.errors instanceof Array]
      ]);
    }
  );
});


queue.push(function () {
  messagebird.balance.read(function (err, data) {
    doTest(err, 'balance.read', [
      ['type', data instanceof Object],
      ['.amount', data && typeof data.amount === 'number'],
      ['.type', data && typeof data.type === 'string'],
      ['.payment', data && typeof data.payment === 'string']
    ]);
  });
});

// CALL TESTS
const CALL_EXAMPLE = {
  id: 'call_id',
  status: 'queued',
  source: '31623456789',
  destination: '31612345678',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  endedAt: null
};

const PAGINATION_EXAMPLE = {
  totalCount: 1,
  pageCount: 1,
  currentPage: 1,
  perPage: 10
};

// create a call
queue.push(function () {
  var params = {
    source: '31623456789',
    destination: '31612345678',
    callFlow: {
      steps: [
        {
          action: 'say',
          options: {
            payload: 'This is a journey into sound. Good bye!',
            voice: 'male',
            language: 'en-US'
          }
        }
      ]
    }
  };

  nock(VOICE_ENDPOINT)
    .post('/calls', params)
    .reply(200, {
      data: [CALL_EXAMPLE]
    }
    );

  messagebird.calls.create(params, function (err, response) {
    doTest(err, 'calls.create', [
      ['.source', response.data[0].source === CALL_EXAMPLE.source],
      ['.destination', response.data[0].destination === CALL_EXAMPLE.destination]
    ]);
  });
});

// list calls
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls')
    .reply(200, {
      data: [CALL_EXAMPLE],
      pagination: PAGINATION_EXAMPLE
    }
    );

  messagebird.calls.list(function (err, response) {
    doTest(err, 'calls.list', [
      ['.source', response.data[0].source === CALL_EXAMPLE.source],
      ['pagination', response.pagination instanceof Object]
    ]);
  });
});

// read a call
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id')
    .reply(200, {
      data: [CALL_EXAMPLE]
    }
    );

  messagebird.calls.read('call_id', function (err, response) {
    doTest(err, 'calls.read', [
      ['.source', response.data[0].source === CALL_EXAMPLE.source],
      ['.destination', response.data[0].destination === CALL_EXAMPLE.destination]
    ]);
  });
});

// delete a call
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .delete('/calls/call_id')
    .reply(204);

  messagebird.calls.delete('call_id', function (err) {
    doTest(err, 'calls.delete', []);
  });
});

// RECORDING TESTS
const RECORDING_EXAMPLE = {
  id: 'call_id',
  format: 'wav',
  legId: 'leg_id',
  state: 'done',
  duration: 10,
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// list recordings
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings')
    .query(({ limit, offset }) => limit === '1' && offset === '0')
    .reply(200, {
      data: [RECORDING_EXAMPLE],
      pagination: PAGINATION_EXAMPLE
    }
    );

  messagebird.recordings.list('call_id', 'leg_id', '1', '0', function (err, response) {
    doTest(err, 'recordings.list', [
      ['.id', response.data[0].id === RECORDING_EXAMPLE.id],
      ['.legId', response.data[0].legId === RECORDING_EXAMPLE.legId],
      ['.duration', typeof response.data[0].duration === 'number'],
      ['pagination', response.pagination instanceof Object]
    ]);
  });
});

// read recordings
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings/recording_id')
    .reply(200, {
      data: [RECORDING_EXAMPLE]
    }
    );

  messagebird.recordings.read('call_id', 'leg_id', 'recording_id', function (err, response) {
    doTest(err, 'recordings.read', [
      ['.id', response.data[0].id === RECORDING_EXAMPLE.id],
      ['.legId', response.data[0].legId === RECORDING_EXAMPLE.legId],
      ['.duration', typeof response.data[0].duration === 'number']
    ]);
  });
});

// download recording
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings/recording_id.wav')
    .reply(200, '', {
      'Content-Disposition': 'attachment; filename="recording_id.wav"'
    });

  messagebird.recordings.download('call_id', 'leg_id', 'recording_id', function (err) {
    doTest(err, 'recordings.download', []);
  });
});

// delete recording
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .delete('/calls/call_id/legs/leg_id/recordings/recording_id')
    .reply(204, '', {
    });

  messagebird.recordings.delete('call_id', 'leg_id', 'recording_id', function (err) {
    doTest(err, 'recordings.delete', []);
  });
});


queue.push(function () {
  messagebird.messages.create(cache.textMessage, function (err, data) {
    cache.textMessage.id = data && data.id || null;
    doTest(err, 'messages.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});

queue.push(function () {
  if (cache.textMessage.id) {
    messagebird.messages.read(cache.textMessage.id, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'messages.read', [
          ['type', err instanceof Error],
          ['.message', err.message === 'api error(s): message not found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'messages.read', [
          ['type', data instanceof Object],
          ['.body', data && data.body === cache.textMessage.body]
        ]);
      }
    });
  }
});

queue.push(function () {
  messagebird.messages.delete(cache.textMessage.id, function (err, data) {
    if (accessType === 'TEST') {
      doTest(null, 'messages.delete', [
        ['type', err instanceof Error],
        ['.message', err.message === 'api error(s): message not found (code: 20)'],
        ['.errors', err.errors instanceof Array]
      ]);
    } else {
      doTest(err, 'messages.delete', [
        ['type', typeof data === 'boolean'],
        ['true', data === true]
      ]);
    }
  });
});

queue.push(function () {
  messagebird.voice_messages.create(cache.voiceMessage, function (err, data) {
    cache.voiceMessage.id = data && data.id || null;
    doTest(err, 'voice_messages.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});

queue.push(function () {
  messagebird.voice_messages.list(100, 0, function (err, data) {
    if (data && data.count > 0) {
      doTest(err, 'voice_messages.list', [
        ['.offset', data.offset === 0],
        ['.limit', data.limit === 100],
        ['.items[0].id', data.items && data.items[0] && typeof data.items[0].id === 'string']
      ]);
    } else {
      doTest(err, 'voice_messages.list', [
        ['.offset', data.offset === 0],
        ['.limit', data.limit === 100],
        ['.count', data.count === 0]
      ]);
    }
  });
});


queue.push(function () {
  if (cache.voiceMessage.id) {
    messagebird.voice_messages.read(cache.voiceMessage.id, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'voice_messages.read', [
          ['type', err instanceof Error],
          ['.message', err.message === 'api error(s): message not found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'voice_messages.read', [
          ['type', data instanceof Object],
          ['.body', data && data.body === cache.voiceMessage.body]
        ]);
      }
    });
  }
});

queue.push(function () {
  messagebird.voice_messages.delete(cache.voiceMessage.id, function (err, data) {
    if (accessType === 'TEST') {
      doTest(null, 'voice_messages.delete', [
        ['type', err instanceof Error],
        ['.message', err.message === 'api error(s): message not found (code: 20)'],
        ['.errors', err.errors instanceof Array]
      ]);
    } else {
      doTest(err, 'voice_messages.delete', [
        ['type', typeof data === 'boolean'],
        ['true', data === true]
      ]);
    }
  });
});

queue.push(function () {
  messagebird.hlr.create(
    number,
    'The ref',
    function (err, data) {
      cache.hlr.id = data && data.id || null;
      doTest(err, 'hlr.create', [
        ['type', data instanceof Object],
        ['.id', data && typeof data.id === 'string']
      ]);
    }
  );
});

queue.push(function () {
  if (cache.hlr.id) {
    messagebird.hlr.read(cache.hlr.id, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'hlr.read', [
          ['type', err instanceof Error],
          ['.message', err.message === 'api error(s): hlr not found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'hlr.read', [
          ['type', data instanceof Object],
          ['.msisdn', data && data.msisdn === number]
        ]);
      }
    });
  }
});

queue.push(function () {
  messagebird.verify.create(cache.verify.recipient, function (err, data) {
    cache.verify.id = data && data.id || null;
    doTest(err, 'verify.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});

queue.push(function () {
  messagebird.verify.createWithEmail(emailFrom, emailTo, function (err, data) {
    cache.verifyEmail.id = data && data.id || null;
    cache.verifyEmail.messages = data && data.messages && data.messages;
    doTest(err, 'verify.createWithEmail', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});

queue.push(function () {
  if (cache.verify.id) {
    messagebird.verify.read(cache.verify.id, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'verify.read', [
          ['type', err instanceof Error],
          ['.statusCode', err.statusCode === 404],
          ['.message', err.message === 'api error(s): Verify object could not be found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'verify.read', [
          ['type', data instanceof Object],
          ['.id', data && data.id === cache.verify.id]
        ]);
      }
    });
  }
});

queue.push(function () {
  if (cache.verifyEmail.messages) {
    let verifyPath = 'verify/messages/email/';
    let href = cache.verifyEmail.messages.href;
    let emailMessageId = href.substring(href.indexOf(verifyPath) + verifyPath.length);

    messagebird.verify.getVerifyEmailMessage(emailMessageId, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'verify.getVerifyEmailMessage', [
          ['type', err instanceof Error],
          ['.statusCode', err.statusCode === 404],
          ['.message', err.message === 'api error(s): Entity not found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'verify.getVerifyEmailMessage', [
          ['type', data instanceof Object],
          ['.id', data && data.id === 'email_id'],
          ['.status', data && typeof data.status === 'string']
        ]);
      }
    });
  }
});

queue.push(function () {
  if (cache.verify.id) {
    messagebird.verify.delete(cache.verify.id, function (err, data) {
      if (accessType === 'TEST') {
        doTest(null, 'verify.delete', [
          ['type', err instanceof Error],
          ['.statusCode', err.statusCode === 404],
          ['.message', err.message === 'api error(s): Verify object could not be found (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'verify.delete', [
          ['type', typeof data === 'boolean'],
          ['data', data === true]
        ]);
      }
    });
  }
});

queue.push(function () {
  messagebird.lookup.read(cache.lookup.phoneNumber, function (err, data) {
    doTest(err, 'lookup.read', [
      ['type', data instanceof Object],
      ['.countryCode', data.countryCode === 'NL'],
      ['.type', data.type === 'mobile'],
      ['.formats', data.formats instanceof Object]
    ]);
  });
});

queue.push(function () {
  messagebird.lookup.hlr.create(cache.lookup.phoneNumber, function (err, data) {
    cache.lookup.id = data && data.id || null;
    doTest(err, 'lookup.hlr.create', [
      ['type', data instanceof Object],
      ['.status', data.status === 'sent'],
      ['.network', data.network === null],
      ['.details', data.details === null]
    ]);
  });
});

queue.push(function () {
  setTimeout(function () {
    messagebird.lookup.hlr.read(cache.lookup.phoneNumber, function (err, data) {
      if (accessType === 'TEST' && err) {
        doTest(null, 'hlr.read', [
          ['type', err instanceof Error],
          ['.message', err.message === 'api error(s): Not found (hlr not found) (code: 20)'],
          ['.errors', err.errors instanceof Array]
        ]);
      } else {
        doTest(err, 'hlr.read', [
          ['type', data instanceof Object],
          ['.id', data.id === cache.lookup.id],
          ['.status', data && typeof data.status === 'string'],
          ['.network', data && typeof data.network === 'number'],
          ['.details', data.details instanceof Object]
        ]);
      }
    });
  }, 5000);
});

queue.push(function () {
  let params = {
    to: '+31612345678',
    from: '619747f69cf940a98fb443140ce9aed2',
    type: 'text',
    content: {
      text: 'Hello!'
    },
    reportUrl: 'https://example.com/reports'
  };

  nock('https://conversations.messagebird.com')
    .post('/v1/send', params)
    .reply(200, {
      message: {
        id: 'message-id',
        status: 'accepted'
      }
    });

  messagebird.conversations.send(params, function (err, data) {
    doTest(err, 'conversations.send', [
      ['type', data instanceof Object],
      ['.message', data.message instanceof Object],
      ['.message.id', data && data.message.id === 'message-id']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/conversations')
    .query({
      offset: 0,
      limit: 20
    })
    .reply(200, {
      'offset': 0,
      'limit': 20,
      'count': 2,
      'totalCount': 2,
      'items': [
        {
          'id': 'fbbdde79129f45e3a179458a91e2ead6',
          'contactId': '03dfc27855c3475b953d6200a1b7eaf7',
          'contact': {
            'id': '03dfc27855c3475b953d6200a1b7eaf7',
            'href': 'https://rest.messagebird.com/contacts/03dfc27855c3475b953d6200a1b7eaf7',
            'msisdn': 31612345678,
            'firstName': 'John',
            'lastName': 'Doe',
            'customDetails': {
              'custom1': null,
              'custom2': null,
              'custom3': null,
              'custom4': null
            },
            'createdDatetime': '2018-08-01T09:45:52Z',
            'updatedDatetime': '2018-08-28T12:37:35Z'
          },
          'channels': [
            {
              'id': '619747f69cf940a98fb443140ce9aed2',
              'name': 'My WhatsApp',
              'platformId': 'whatsapp',
              'status': 'active',
              'createdDatetime': '2018-08-28T11:56:57Z',
              'updatedDatetime': '2018-08-29T08:16:33Z'
            }
          ],
          'status': 'active',
          'createdDatetime': '2018-08-29T08:52:54Z',
          'updatedDatetime': '2018-08-29T08:52:54Z',
          'lastReceivedDatetime': '2018-08-29T08:52:54Z',
          'lastUsedChannelId': '619747f69cf940a98fb443140ce9aed2',
          'messages': {
            'totalCount': 10,
            'href': 'https://conversations.messagebird.com/v1/conversations/fbbdde79129f45e3a179458a91e2ead6/messages'
          }
        },
        {
          'id': '2e15efafec384e1c82e9842075e87beb',
          'contactId': 'a621095fa44947a28b441cfdf85cb802',
          'contact': {
            'id': 'a621095fa44947a28b441cfdf85cb802',
            'href': 'https://rest.messagebird.com/1/contacts/a621095fa44947a28b441cfdf85cb802',
            'msisdn': 316123456789,
            'firstName': 'Jen',
            'lastName': 'Smith',
            'customDetails': {
              'custom1': null,
              'custom2': null,
              'custom3': null,
              'custom4': null
            },
            'createdDatetime': '2018-06-03T20:06:03Z',
            'updatedDatetime': null
          },
          'channels': [
            {
              'id': '853eeb5348e541a595da93b48c61a1ae',
              'name': 'SMS',
              'platformId': 'sms',
              'status': 'active',
              'createdDatetime': '2018-08-28T11:56:57Z',
              'updatedDatetime': '2018-08-29T08:16:33Z'
            },
            {
              'id': '619747f69cf940a98fb443140ce9aed2',
              'name': 'My WhatsApp',
              'platformId': 'whatsapp',
              'status': 'active',
              'createdDatetime': '2018-08-28T11:56:57Z',
              'updatedDatetime': '2018-08-29T08:16:33Z'
            }
          ],
          'status': 'active',
          'createdDatetime': '2018-08-13T09:17:22Z',
          'updatedDatetime': '2018-08-29T07:35:48Z',
          'lastReceivedDatetime': '2018-08-29T07:35:48Z',
          'lastUsedChannelId': '853eeb5348e541a595da93b48c61a1ae',
          'messages': {
            'totalCount': 23,
            'href': 'https://conversations.messagebird.com/v1/conversations/2e15efafec384e1c82e9842075e87beb/messages'
          }
        }
      ]
    });

  messagebird.conversations.list(20, 0, function (err, data) {
    doTest(err, 'conversations.list', [
      ['.offset', data.offset === 0],
      ['.limit', data.limit === 20],
      ['.items[0].id', data.items[0].id === 'fbbdde79129f45e3a179458a91e2ead6'],
      ['.items[1].contact.id', data.items[1].contact.id === 'a621095fa44947a28b441cfdf85cb802']
    ]);
  });
});

queue.push(function () {
  var params = {
    to: '+31612345678',
    channelId: 'channel-id',
    type: 'text',
    content: { text: 'Hello!' }
  };

  nock('https://conversations.messagebird.com')
    .post('/v1/conversations/start', params)
    .reply(200, {
      id: 'conversation-id',
      contactId: 'contact-id',
      status: 'active',
      channels: [
        {
          id: 'channel-id-1',
          name: 'SMS',
          platformId: 'sms',
          status: 'active',
          createdDatetime: '2018-08-28T11:56:57Z',
          updatedDatetime: '2018-08-29T08:16:33Z'
        },
        {
          id: 'channel-id-2',
          name: 'My WhatsApp',
          platformId: 'whatsapp',
          status: 'active',
          createdDatetime: '2018-08-28T11:56:57Z',
          updatedDatetime: '2018-08-29T08:16:33Z'
        }
      ]
    });

  messagebird.conversations.start(params, function (err, data) {
    doTest(err, 'conversations.start', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'conversation-id'],
      ['.contactId', data && data.contactId === 'contact-id'],
      ['channels.length', data && data.channels.length === 2],
      ['channels[0].id', data && data.channels[0].id === 'channel-id-1']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/conversations/conversation-id')
    .reply(200, {
      id: 'conversation-id',
      contactId: 'contact-id',
      status: 'active',
      channels: [
        {
          id: 'channel-id-1',
          name: 'SMS',
          platformId: 'sms',
          status: 'active',
          createdDatetime: '2018-08-28T11:56:57Z',
          updatedDatetime: '2018-08-29T08:16:33Z'
        },
        {
          id: 'channel-id-2',
          name: 'My WhatsApp',
          platformId: 'whatsapp',
          status: 'active',
          createdDatetime: '2018-08-28T11:56:57Z',
          updatedDatetime: '2018-08-29T08:16:33Z'
        }
      ]
    });

  messagebird.conversations.read('conversation-id', function (err, data) {
    doTest(err, 'conversations.read', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'conversation-id'],
      ['.contactId', data && data.contactId === 'contact-id'],
      ['channels.length', data && data.channels.length === 2],
      ['channels[0].id', data && data.channels[0].id === 'channel-id-1']
    ]);
  });
});

queue.push(function () {
  var params = {
    status: 'archived'
  };

  nock('https://conversations.messagebird.com')
    .patch('/v1/conversations/conversation-id', params)
    .reply(200, {
      id: 'conversation-id',
      contactId: 'contact-id',
      status: 'archived'
    });

  messagebird.conversations.update('conversation-id', params, function (err, data) {
    doTest(err, 'conversations.update', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'conversation-id'],
      ['.status', data && data.status === 'archived'],
      ['.contactId', data && data.contactId === 'contact-id']
    ]);
  });
});


queue.push(function () {
  var params = {
    type: 'text',
    content: { text: 'Hello!' }
  };

  nock('https://conversations.messagebird.com')
    .post('/v1/conversations/conversation-id/messages', params)
    .reply(200, {
      id: 'message-id',
      conversationId: 'conversation-id',
      status: 'pending',
      channelId: 'a621095fa44947a28b441cfdf85cb802',
      type: 'text',
      direction: 'sent',
      content: {
        text: 'This is a test message'
      }
    });

  messagebird.conversations.reply('conversation-id', params, function (err, data) {
    doTest(err, 'conversations.reply', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'message-id'],
      ['.conversationId', data && data.conversationId === 'conversation-id'],
      ['.status', data && data.status === 'pending']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/conversations/2e15efafec384e1c82e9842075e87beb/messages')
    .query({
      offset: 0,
      limit: 20
    })
    .reply(200, {
      'count': 2,
      'items': [
        {
          'id': 'eb34fb1fc73f47a58ad644de0e2de254',
          'conversationId': '2e15efafec384e1c82e9842075e87beb',
          'channelId': '619747f69cf940a98fb443140ce9aed2',
          'status': 'received',
          'direction': 'received',
          'type': 'text',
          'content': {
            'text': 'This is a test WhatsApp message'
          },
          'createdDatetime': '2018-08-29T08:07:15Z',
          'updatedDatetime': '2018-08-29T08:07:33Z'
        },
        {
          'id': '5f3437fdb8444583aea093a047ac014b',
          'conversationId': '2e15efafec384e1c82e9842075e87beb',
          'channelId': '853eeb5348e541a595da93b48c61a1ae',
          'status': 'delivered',
          'direction': 'sent',
          'type': 'text',
          'content': {
            'text': 'This is a test SMS message'
          },
          'createdDatetime': '2018-08-28T15:52:41Z',
          'updatedDatetime': '2018-08-28T15:52:58Z'
        }
      ],
      'limit': 20,
      'offset': 0,
      'totalCount': 24
    });

  messagebird.conversations.listMessages('2e15efafec384e1c82e9842075e87beb', 20, 0, function (err, data) {
    doTest(err, 'conversations.listMessages', [
      ['.offset', data.offset === 0],
      ['.limit', data.limit === 20],
      ['.items[0].id', data.items[0].id === 'eb34fb1fc73f47a58ad644de0e2de254'],
      ['.items[1].content.text', data.items[1].content.text === 'This is a test SMS message']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/messages/message-id')
    .reply(200, {
      id: 'message-id',
      conversationId: 'conversation-id',
      channelId: 'channgel-id',
      status: 'delivered',
      direction: 'sent',
      type: 'text'
    });

  messagebird.conversations.readMessage('message-id', function (err, data) {
    doTest(err, 'conversations.readMessage', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'message-id'],
      ['.conversationId', data && data.conversationId === 'conversation-id'],
      ['.status', data && data.status === 'delivered']
    ]);
  });
});

queue.push(function () {
  var params = {
    events: ['message.created', 'message.updated'],
    channelId: 'channel-id',
    url: 'https://example.com/webhook'
  };

  nock('https://conversations.messagebird.com')
    .post('/v1/webhooks', params)
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      channelId: 'channel-id',
      events: [
        'message.created',
        'message.updated'
      ],
      status: 'enabled'
    });

  messagebird.conversations.webhooks.create(params, function (err, data) {
    doTest(err, 'conversations.webhooks.create', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.url', data && data.url === 'https://example.com/webhook'],
      ['.events.length', data && data.events && data.events.length === 2],
      ['.status', data && data.status === 'enabled']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/webhooks/webhook-id')
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      channelId: 'channel-id',
      events: [
        'message.created',
        'message.updated'
      ],
      status: 'enabled'
    });

  messagebird.conversations.webhooks.read('webhook-id', function (err, data) {
    doTest(err, 'conversations.webhooks.read', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.channelId', data && data.channelId === 'channel-id'],
      ['.status', data && data.status === 'enabled']
    ]);
  });
});

queue.push(function () {
  var params = { 'status': 'disabled' };

  nock('https://conversations.messagebird.com')
    .patch('/v1/webhooks/webhook-id', params)
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      channelId: 'channel-id',
      events: [
        'message.created',
        'message.updated'
      ],
      status: 'disabled'
    });

  messagebird.conversations.webhooks.update('webhook-id', params, function (err, data) {
    doTest(err, 'conversations.webhooks.update', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.channelId', data && data.channelId === 'channel-id'],
      ['.status', data && data.status === 'disabled']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/webhooks')
    .query({
      limit: 0,
      offset: 30
    })
    .reply(200, {
      offset: 0,
      limit: 30,
      count: 1,
      totalCount: 1,
      items: [{
        id: 'webhook-id',
        url: 'https://example.com/webhook',
        channelId: 'channel-id',
        events: [
          'message.created',
          'message.updated'
        ],
        status: 'enabled'
      }]
    });

  messagebird.conversations.webhooks.list(0, 30, function (err, data) {
    doTest(err, 'conversations.webhooks.list', [
      ['type', data instanceof Object],
      ['.limit', data && data.limit === 30],
      ['.items[0].id', data && data.items[0].id === 'webhook-id']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .get('/v1/webhooks')
    .reply(200, {
      offset: 0,
      limit: 20,
      count: 1,
      totalCount: 1,
      items: [{
        id: 'webhook-id',
        url: 'https://example.com/webhook',
        channelId: 'channel-id',
        events: [
          'message.created',
          'message.updated'
        ],
        status: 'enabled'
      }]
    });

  messagebird.conversations.webhooks.list(function (err, data) {
    doTest(err, 'conversations.webhooks.list.withoutpagination', [
      ['type', data instanceof Object],
      ['.limit', data && data.limit === 20],
      ['.items[0].id', data && data.items[0].id === 'webhook-id']
    ]);
  });
});

queue.push(function () {
  nock('https://conversations.messagebird.com')
    .delete('/v1/webhooks/webhook-id')
    .reply(204, '');

  messagebird.conversations.webhooks.delete('webhook-id', function (err) {
    doTest(err, 'conversations.webhooks.delete', []);
  });
});

queue.push(function () {
  var params = {
    originator: 'node-js',
    recipients: [number],
    body: 'Have you seen this logo?',
    mediaUrls: ['https://www.messagebird.com/assets/images/og/messagebird.gif']
  };

  nock('https://rest.messagebird.com')
    .post('/mms', params)
    .reply(200, { id: 'mms-id', body: 'Have you seen this logo?' });

  messagebird.mms.create(params, function (err, data) {
    doTest(err, 'mms.create', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'mms-id'],
      ['.body', data && data.body === 'Have you seen this logo?']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/mms/mms-id')
    .reply(200, {
      id: 'mms-id',
      href: 'https://rest.messagebird.com/mms/efa6405d518d4c0c88cce11f7db775fb',
      direction: 'mt',
      originator: '+31207009850',
      subject: 'Great logo',
      body: 'Hi! Please have a look at this very nice logo of this cool company.',
      reference: 'the-customers-reference',
      mediaUrls: [
        'https://www.messagebird.com/assets/images/og/messagebird.gif'
      ],
      scheduledDatetime: null,
      createdDatetime: '2017-09-01T10:00:00+00:00',
      recipients: {
        totalCount: 1,
        totalSentCount: 1,
        totalDeliveredCount: 0,
        totalDeliveryFailedCount: 0,
        items: [
          {
            recipient: 31612345678,
            status: 'sent',
            statusDatetime: '2017-09-01T10:00:00+00:00'
          }
        ]
      }
    });

  messagebird.mms.read('mms-id', function (err, data) {
    doTest(err, 'mms.read', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'mms-id'],
      ['.body', data && data.body === 'Hi! Please have a look at this very nice logo of this cool company.']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/mms')
    .query({
      limit: 20,
      offset: 10
    })
    .reply(200, {
      offset: 10,
      limit: 20,
      count: 1,
      totalCount: 1,
      links: {
        first: 'https://rest.messagebird.com/mms?offset=0',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/mmsoffset=0'
      },
      items: [
        {
          id: 'mms-id',
          href: 'https://rest.messagebird.com/mms/efa6405d518d4c0c88cce11f7db775fb',
          direction: 'mt',
          originator: '+31207009850',
          subject: 'Great logo',
          body: 'Hi! Please have a look at this very nice logo of this cool company.',
          reference: 'the-customers-reference',
          mediaUrls: [
            'https://www.messagebird.com/assets/images/og/messagebird.gif'
          ],
          scheduledDatetime: null,
          createdDatetime: '2017-09-01T10:00:00+00:00'
        }
      ]
    });

  messagebird.mms.list(20, 10, function (err, data) {
    doTest(err, 'mms.list', [
      ['type', data instanceof Object],
      ['.limit', data && data.limit === 20],
      ['.offset', data && data.offset === 10],
      ['.items[0].id', data && data.items[0].id === 'mms-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/mms')
    .reply(200, { offset: 0, limit: 20, items: [{ id: 'mms-id' }]});

  messagebird.mms.list(function (err, data) {
    doTest(err, 'mms.list.withoutpagination', [
      ['type', data instanceof Object],
      ['.offset', data && data.offset === 0],
      ['.items[0].id', data && data.items[0].id === 'mms-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/mms/mms-id')
    .reply(204, {
      id: 'mms-id'
    });

  messagebird.mms.delete('mms-id', function (err) {
    doTest(err, 'mms.delete', []);
  });
});


queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/mms/mms-id')
    .reply(404, { statusCode: 404, errors: [{ code: 20, description: 'message not found', parameter: null }]});

  messagebird.mms.delete('mms-id', function (err) {
    expectError(err, 'mms.delete.witherror');
  });
});

queue.push(function () {
  var params = {
    'msisdn': 31612345678,
    'firstName': 'Foo',
    'custom3': 'Third'
  };

  nock('https://rest.messagebird.com')
    .post('/contacts', '{"msisdn":31612345678,"firstName":"Foo","custom3":"Third"}')
    .reply(200, {
      id: 'contact-id',
      href: 'https://rest.messagebird.com/contacts/contact-id',
      msisdn: 31612345678,
      firstName: 'Foo',
      lastName: 'Bar',
      customDetails: {
        custom1: 'First',
        custom2: 'Second',
        custom3: 'Third',
        custom4: 'Fourth'
      },
      groups: {
        totalCount: 3,
        href: 'https://rest.messagebird.com/contacts/contact-id/groups'
      },
      messages: {
        totalCount: 5,
        href: 'https://rest.messagebird.com/contacts/contact-id/messages'
      },
      createdDatetime: '2018-07-13T10:34:08+00:00',
      updatedDatetime: '2018-07-13T10:44:08+00:00'
    });

  messagebird.contacts.create(31612345678, params, function (err, data) {
    doTest(err, 'contacts.create', [
      ['.msisdn', data.msisdn === 31612345678],
      ['.customDetails.custom3', data.customDetails.custom3 === 'Third'],
      ['.groups.totalCount', data.groups.totalCount === 3]
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/contacts/contact-id')
    .reply(200, {
      id: 'contact-id',
      href: 'https://rest.messagebird.com/contacts/contact-id',
      msisdn: 31612345678,
      firstName: 'Foo',
      lastName: 'Bar',
      customDetails: {
        custom1: 'First',
        custom2: 'Second',
        custom3: 'Third',
        custom4: 'Fourth'
      },
      groups: {
        totalCount: 3,
        href: 'https://rest.messagebird.com/contacts/contact-id/groups'
      },
      messages: {
        totalCount: 5,
        href: 'https://rest.messagebird.com/contacts/contact-id/messages'
      },
      createdDatetime: '2018-07-13T10:34:08+00:00',
      updatedDatetime: '2018-07-13T10:44:08+00:00'
    });

  messagebird.contacts.read('contact-id', function (err, data) {
    doTest(err, 'contacts.read', [
      ['.id', data.id === 'contact-id'],
      ['.firstName', data.firstName === 'Foo']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .patch('/contacts/contact-id', '{"firstName":"new-name"}')
    .reply(200, {});

  let params = {
    firstName: 'new-name'
  };

  messagebird.contacts.update('contact-id', params, function (err, data) {
    doTest(err, 'contacts.update', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/contacts/contact-id/groups')
    .query({
      limit: 20,
      offset: 0
    })
    .reply(200, {
      offset: 0,
      limit: 20,
      count: 1,
      totalCount: 1,
      links: {
        first: 'https://rest.messagebird.com/contacts/contact-id/groups?offset=0',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/contacts/contact-id/groups?offset=0'
      },
      items: [
        {
          id: 'group-id',
          href: 'https://rest.messagebird.com/groups/group-id',
          name: 'SomeGroup',
          contacts: {
            totalCount: 1,
            href: 'https://rest.messagebird.com/groups/group-id/contacts'
          },
          createdDatetime: '2018-08-06T08:34:51+00:00',
          updatedDatetime: '2018-08-21T14:17:39+00:00'
        }
      ]
    });

  messagebird.contacts.listGroups('contact-id', 20, 0, function (err, data) {
    doTest(err, 'contacts.listGroups', [
      ['.totalCount', data.totalCount === 1],
      ['.items[0].id', data.items[0].id === 'group-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/contacts/contact-id/messages')
    .reply(200, {
      offset: 0,
      limit: 20,
      count: 1,
      totalCount: 1,
      links: {
        first: 'https://rest.messagebird.com/messages/?offset=0',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/messages/?offset=0'
      },
      items: [
        {
          id: 'message-id',
          href: 'https://rest.messagebird.com/messages/message-id',
          direction: 'mo',
          type: 'sms',
          originator: 'MBird',
          body: 'Profile',
          reference: 'MyReference',
          validity: null,
          gateway: 0,
          typeDetails: {},
          datacoding: 'plain',
          mclass: 1,
          scheduledDatetime: null,
          createdDatetime: '2018-08-31T14:24:22+00:00',
          recipients: {
            totalCount: 1,
            totalSentCount: 1,
            totalDeliveredCount: 1,
            totalDeliveryFailedCount: 0,
            items: [
              {
                recipient: 31612345678,
                originator: null,
                status: 'delivered',
                statusDatetime: null
              }
            ]
          }
        }
      ]
    });

  messagebird.contacts.listMessages('contact-id', function (err, data) {
    doTest(err, 'contacts.listMessages', [
      ['.items[0].reference', data.items[0].reference === 'MyReference']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/contacts/contact-id')
    .reply(204, '');

  messagebird.contacts.delete('contact-id', function (err) {
    doTest(err, 'contacts.delete', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/contacts/non-existing')
    .reply(404, {
      errors: [
        {
          code: 20,
          description: 'contact not found',
          parameter: null
        }
      ]
    });

  messagebird.contacts.delete('non-existing', function (err) {
    expectError(err, 'contacts.delete.witherror');
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/contacts')
    .query({
      limit: 10,
      offset: 20
    })
    .reply(200, {
      offset: 20,
      limit: 10,
      count: 2,
      totalCount: 22,
      links: {
        first: 'https://rest.messagebird.com/contacts?offset=0',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/contacts?offset=0'
      },
      items: [
        {
          id: 'first-id',
          href: 'https://rest.messagebird.com/contacts/first-id',
          msisdn: 31612345678,
          firstName: 'Foo',
          lastName: 'Bar',
          customDetails: {
            custom1: null,
            custom2: null,
            custom3: null,
            custom4: null
          },
          groups: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/first-id/groups'
          },
          messages: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/first-id/messages'
          },
          createdDatetime: '2018-07-13T10:34:08+00:00',
          updatedDatetime: '2018-07-13T10:34:08+00:00'
        },
        {
          id: 'second-id',
          href: 'https://rest.messagebird.com/contacts/second-id',
          msisdn: 49612345678,
          firstName: 'Hello',
          lastName: 'World',
          customDetails: {
            custom1: null,
            custom2: null,
            custom3: null,
            custom4: null
          },
          groups: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/second-id/groups'
          },
          messages: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/second-id/messages'
          },
          createdDatetime: '2018-07-13T10:33:52+00:00',
          updatedDatetime: null
        }
      ]
    }
    );

  messagebird.contacts.list(10, 20, function (err, data) {
    doTest(err, 'contacts.list', [
      ['.offset', data.offset === 20],
      ['.links.first', data.links.first === 'https://rest.messagebird.com/contacts?offset=0'],
      ['.items[0].msisdn', data.items[0].msisdn === 31612345678],
      ['.items[1].messages.href', data.items[1].messages.href === 'https://rest.messagebird.com/contacts/second-id/messages']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/contacts')
    .reply(200, {});

  messagebird.contacts.list(function (err, data) {
    doTest(err, 'contacts.list.withoutpagination', []);
  });
});

const CALLFLOW_EXAMPLE = {
  data: [
    {
      id: 'id#1',
      title: 'title #1',
      steps: [
        {
          id: 'step #1',
          action: 'action',
          options: {
            destination: 'dest $1'
          }
        }
      ],
      record: false,
      default: false,
      createdAt: '2019-11-04T15:38:01Z',
      updatedAt: '2019-11-04T15:38:01Z',
      _links: {
        self: '/call-flows/id#1'
      }
    },
    {
      id: 'id#2',
      steps: [
        {
          id: 'step #1',
          action: 'action',
          options: {
            destination: 'dest $2'
          }
        }
      ],
      record: false,
      default: false,
      createdAt: '2019-11-04T15:38:01Z',
      updatedAt: '2019-11-04T15:38:01Z',
      _links: {
        self: '/call-flows/id#2'
      }
    },
    {
      id: 'id#3',
      steps: [
        {
          id: 'step #1',
          action: 'action',
          options: {
            destination: 'dest $3'
          }
        }
      ],
      record: false,
      default: false,
      createdAt: '2019-11-04T15:38:01Z',
      updatedAt: '2019-11-04T15:38:01Z',
      _links: {
        self: '/call-flows/id#3'
      }
    }
  ],
  pagination: {
    totalCount: 3,
    pageCount: 1,
    currentPage: 1,
    perPage: 10
  }
};

const CALLFLOW_EXAMPLE_PAGE = {
  data: [
    {
      id: 'id#1',
      steps: [
        {
          id: 'step #1',
          action: 'action',
          options: {
            destination: 'dest $1'
          }
        }
      ],
      record: false,
      default: false,
      createdAt: '2019-11-04T15:38:01Z',
      updatedAt: '2019-11-04T15:38:01Z',
      _links: {
        self: '/call-flows/id#1'
      }
    }
  ],
  pagination: {
    totalCount: 1,
    pageCount: 1,
    currentPage: 1,
    perPage: 10
  }
};

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/call-flows')
    .reply(200, {});
  messagebird.callflows.list(function (err, data) {
    doTest(err, 'callflows.list.empty', []);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/call-flows')
    .reply(200, CALLFLOW_EXAMPLE);
  messagebird.callflows.list(function (err, response) {
    doTest(err, 'callflows.list.default', [
      ['.response.data[0].id', response.data[0].id === 'id#1'],
      ['.response.data[0].id', response.data[0].title === 'title #1'],
      ['length of array response == 3', response.data.length === 3],
      ['totalCount == 3', response.pagination.totalCount === 3]
    ]);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/call-flows?page=1&perPage=1')
    .reply(200, CALLFLOW_EXAMPLE_PAGE);
  messagebird.callflows.list(1, 1, function (err, response) {
    doTest(err, 'callflows.list.paged', [
      ['.response.data[0].id', response.data[0].id === 'id#1'],
      ['length of array response == 1', response.data.length === 1],
      ['totalCount == 1', response.pagination.totalCount === 1]
    ]);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/call-flows/id#1')
    .reply(200, CALLFLOW_EXAMPLE_PAGE);
  messagebird.callflows.read('id#1', function (err, response) {
    doTest(err, 'callflows.read', [
      ['.response.data[0].id', response.data[0].id === 'id#1'],
      ['length of array response == 1', response.data.length === 1]
    ]);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .delete('/call-flows/id#1')
    .reply(204, '');

  messagebird.callflows.delete('id#1', function (err) {
    doTest(err, 'callflows.delete', []);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .post('/call-flows')
    .reply(200, CALLFLOW_EXAMPLE_PAGE);

  messagebird.callflows.create(CALLFLOW_EXAMPLE_PAGE.data[0], function (err, response) {
    doTest(err, 'callflows.create', [
      ['.response.data[0].id', response.data[0].id === 'id#1']
    ]);
  });
});

queue.push(function () {
  nock(VOICE_ENDPOINT)
    .put('/call-flows/id#1')
    .reply(204, '');

  messagebird.callflows.update('id#1', { title: 'title_new' }, function (err, response) {
    doTest(err, 'callflows.update', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .post('/groups', '{"name":"friends"}')
    .reply(200, {});

  messagebird.groups.create('friends', function (err, data) {
    doTest(err, 'groups.create', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/groups/group-id')
    .reply(204, '');

  messagebird.groups.delete('group-id', function (err) {
    doTest(err, 'groups.delete', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/groups')
    .query({
      limit: 10,
      offset: 20
    })
    .reply(200, {});

  messagebird.groups.list(10, 20, function (err, data) {
    doTest(err, 'groups.list', []);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/groups')
    .reply(200, {
      offset: 0,
      limit: 10,
      count: 2,
      totalCount: 2,
      links: {
        first: 'https://rest.messagebird.com/groups?offset=0&limit=10',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/groups?offset=0&limit=10'
      },
      items: [
        {
          id: 'first-id',
          href: 'https://rest.messagebird.com/groups/first-id',
          name: 'First',
          contacts: {
            totalCount: 3,
            href: 'https://rest.messagebird.com/groups/first-id/contacts'
          },
          createdDatetime: '2018-07-25T11:47:42+00:00',
          updatedDatetime: '2018-07-25T14:03:09+00:00'
        },
        {
          id: 'second-id',
          href: 'https://rest.messagebird.com/groups/second-id',
          name: 'Second',
          contacts: {
            totalCount: 4,
            href: 'https://rest.messagebird.com/groups/second-id/contacts'
          },
          createdDatetime: '2018-07-25T11:47:39+00:00',
          updatedDatetime: '2018-07-25T14:03:09+00:00'
        }
      ]
    }
    );

  messagebird.groups.list(function (err, data) {
    doTest(err, 'groups.list.withoutpagination', [
      ['.links.last', data.links.last === 'https://rest.messagebird.com/groups?offset=0&limit=10'],
      ['.items[0].name', data.items[0].name === 'First'],
      ['.items[1].contacts.totalCount', data.items[1].contacts.totalCount === 4]
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/groups/group-id')
    .reply(200, {
      id: 'group-id',
      href: 'https://rest.messagebird.com/groups/group-id',
      name: 'Friends',
      contacts: {
        totalCount: 3,
        href: 'https://rest.messagebird.com/groups/group-id'
      },
      createdDatetime: '2018-07-25T12:16:10+00:00',
      updatedDatetime: '2018-07-25T12:16:23+00:00'
    }
    );

  messagebird.groups.read('group-id', function (err, data) {
    doTest(err, 'groups.read', [
      ['.id', data.id === 'group-id'],
      ['.contacts.href', data.contacts.href === 'https://rest.messagebird.com/groups/group-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .patch('/groups/group-id', '{"name":"new-name"}')
    .reply(200, {
      id: 'group-id',
      href: 'https://rest.messagebird.com/groups/group-id',
      name: 'new-name',
      contacts: {
        totalCount: 3,
        href: 'https://rest.messagebird.com/groups/group-id'
      },
      createdDatetime: '2018-07-25T12:16:10+00:00',
      updatedDatetime: '2018-07-25T12:16:23+00:00'
    }
    );

  messagebird.groups.update('group-id', 'new-name', function (err, data) {
    doTest(err, 'groups.update', [
      ['.id', data.id === 'group-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .put('/groups/group-id/contacts', {
      'groupId': 'group-id',
      'ids': ['first-id', 'second-id']
    })
    .reply(204, '');

  messagebird.groups.addContacts('group-id', ['first-id', 'second-id'], function (err) {
    doTest(err, 'groups.addContacts', []);
  });
});

queue.push(function () {
  var matchAnyQuery = true;

  nock('https://rest.messagebird.com')
    .get('/groups/group-id')
    .query(matchAnyQuery)
    .reply(404, {
      errors: [
        {
          code: 20,
          description: 'contact not found',
          parameter: null
        }
      ]
    }
    );

  messagebird.groups.addContacts('group-id', ['first-id', 'second-id'], function (err) {
    expectError(err, 'groups.addContects.witherror');
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .get('/groups/group-id/contacts')
    .reply(200, {
      offset: 20,
      limit: 10,
      count: 2,
      totalCount: 22,
      links: {
        first: 'https://rest.messagebird.com/contacts?offset=0',
        previous: null,
        next: null,
        last: 'https://rest.messagebird.com/contacts?offset=0'
      },
      items: [
        {
          id: 'first-id',
          href: 'https://rest.messagebird.com/contacts/first-id',
          msisdn: 31612345678,
          firstName: 'Foo',
          lastName: 'Bar',
          customDetails: {
            custom1: null,
            custom2: null,
            custom3: null,
            custom4: null
          },
          groups: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/first-id/groups'
          },
          messages: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/first-id/messages'
          },
          createdDatetime: '2018-07-13T10:34:08+00:00',
          updatedDatetime: '2018-07-13T10:34:08+00:00'
        },
        {
          id: 'second-id',
          href: 'https://rest.messagebird.com/contacts/second-id',
          msisdn: 49612345678,
          firstName: 'Hello',
          lastName: 'World',
          customDetails: {
            custom1: null,
            custom2: null,
            custom3: null,
            custom4: null
          },
          groups: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/second-id/groups'
          },
          messages: {
            totalCount: 0,
            href: 'https://rest.messagebird.com/contacts/second-id/messages'
          },
          createdDatetime: '2018-07-13T10:33:52+00:00',
          updatedDatetime: null
        }
      ]
    });

  messagebird.groups.listContacts('group-id', function (err, data) {
    doTest(err, 'groups.listContacts', [
      ['.items[0].msisdn', data.items[0].msisdn === 31612345678],
      ['.items[1].id', data.items[1].id === 'second-id']
    ]);
  });
});

queue.push(function () {
  nock('https://rest.messagebird.com')
    .delete('/groups/group-id/contacts/contact-id')
    .reply(204, '');

  messagebird.groups.removeContact('group-id', 'contact-id', function (err) {
    doTest(err, 'groups.removeContact', []);
  });
});

// old webhook signature test
queue.push(function () {
  var req = {
    rawBody: '',
    headers: {
      'messagebird-request-timestamp': '1547198231',
      'messagebird-signature': 'KVBdcVdz2lYMwcBLZCRITgxUfA/WkwSi+T3Wxl2HL6w='
    },
    query: {
      'id': 'eef0ab57a9e049be946f3821568c2b2e',
      'mccmnc': '20408',
      'ported': '1',
      'recipient': '31612345678',
      'reference': 'FOO',
      'status': 'delivered',
      'statusDatetime': '2019-01-11T09:17:11+00:00'
    }
  };
  var signature = validateSignature.generate(req, 'PlLrKaqvZNRR5zAjm42ZT6q1SQxgbbGd');

  var isValid = validateSignature.isValid(req, signature);

  doTest(null, 'signature.isValid', [
    ['isValid', isValid === true]
  ]);
});

queue.push(function () {
  var req = {
    body: '',
    headers: {
      'messagebird-request-timestamp': '1547198231',
      'messagebird-signature': 'KVBdcVdz2lYMwcBLZCRITgxUfA/WkwSi+T3Wxl2HL6w='
    },
    query: {
      'id': 'eef0ab57a9e049be946f3821568c2b2e',
      'mccmnc': '20408',
      'ported': '1',
      'recipient': '31612345678',
      'reference': 'BAR',
      'status': 'delivered',
      'statusDatetime': '2019-01-11T09:17:11+00:00'
    }
  };

  var signature = validateSignature.generate(req, 'PlLrKaqvZNRR5zAjm42ZT6q1SQxgbbGd');

  var isValid = validateSignature.isValid(req, signature);

  doTest(null, 'signature.isValid.wrongpayload', [
    ['isValid', isValid === false]
  ]);
});

queue.push(function () {
  var req = {
    body: '',
    headers: {
      'messagebird-request-timestamp': Math.floor(new Date().getTime() / 1000) - 1,
      'messagebird-signature': 'KVBdcVdz2lYMwcBLZCRITgxUfA/WkwSi+T3Wxl2HL6w='
    },
    query: {}
  };

  var isRecent = validateSignature.isRecent(req);

  doTest(null, 'signature.isRecent', [
    ['isRecent', isRecent === true]
  ]);
});

queue.push(function () {
  var req = {
    body: '',
    headers: {
      'messagebird-request-timestamp': Math.floor(new Date().getTime() / 1000) - 120,
      'messagebird-signature': 'KVBdcVdz2lYMwcBLZCRITgxUfA/WkwSi+T3Wxl2HL6w='
    },
    query: {}
  };


  var isRecent = validateSignature.isRecent(req);

  doTest(null, 'signature.isRecent.expired', [
    ['isRecent', isRecent === false]
  ]);
});

// (END) old webhook signature test

queue.push(
  ...(() => {
    let rawData = fs.readFileSync(path.join(__dirname, '/testdata/webhook-signature-jwt-reference.json'));
    let references = JSON.parse(rawData);

    return references.map((ref) => {
      return () => {
        // this is needed so the clock is properly set for the data provided by the reference
        let opts = new webookSignatureJwt.VerifyOptions();

        opts.jwtVerifyOptions.currentDate = new Date(ref.timestamp);

        let payload = null;

        if ('payload' in ref) {
          payload = Buffer.from(ref.payload, 'utf8');
        }

        let sk = null;

        if ('secret' in ref) {
          sk = createSecretKey(Buffer.from(ref.secret, 'utf8'));
        }

        webookSignatureJwt.verify(
          ref.url,
          payload,
          ref.token,
          sk,
          opts
        ).then(() => {
          doTest(null, 'webookSignatureJwt: ' + ref.name, [
            [ref.reason, ref.valid === true]
          ]);
        })
          .catch((err) => {
            doTest(ref.valid === false ? null : err, 'webookSignatureJwt: ' + ref.name, [
              [ref.reason, ref.valid === false]
            ]);
          });
      };
    });
  })()
);

// webhook signature JWT test
// (END) webhook signature JWT test

// Transcription tests
const TRANSCRIPTION_EXAMPLE = {
  id: 'transcription_id',
  recordingId: 'recording_id',
  error: null,
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  _links: {
    'self': '/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions/transcription_id',
    'file': '/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions/transcription_id.txt'
  }
};

// Transcription create
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .post('/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions', '{"language":"language"}')
    .reply(200, {
      data: [
        TRANSCRIPTION_EXAMPLE
      ]
    });

  messagebird.transcriptions.create('call_id', 'leg_id', 'recording_id', 'language', function (err, data) {
    doTest(err, 'transcriptions.create', [
      ['type', data instanceof Object],
      ['.id', data.data[0].id === TRANSCRIPTION_EXAMPLE.id],
      ['.recordingId', data.data[0].recordingId === TRANSCRIPTION_EXAMPLE.recordingId],
      ['.error', data.data[0].error === TRANSCRIPTION_EXAMPLE.error],
      ['.createdAt', data.data[0].createdAt === TRANSCRIPTION_EXAMPLE.createdAt],
      ['.updatedAt', data.data[0].updatedAt === TRANSCRIPTION_EXAMPLE.updatedAt],
      ['._links', data.data[0]._links instanceof Object],
      ['._links.self', data.data[0]._links.self === TRANSCRIPTION_EXAMPLE._links.self],
      ['._links.file', data.data[0]._links.file === TRANSCRIPTION_EXAMPLE._links.file]
    ]);
  });
});

// Transcription list
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions')
    .reply(200, {
      data: [
        TRANSCRIPTION_EXAMPLE
      ]
    });

  messagebird.transcriptions.list('call_id', 'leg_id', 'recording_id', function (err, data) {
    doTest(err, 'transcriptions.list', [
      ['type', data instanceof Object],
      ['.id', data.data[0].id === TRANSCRIPTION_EXAMPLE.id],
      ['.recordingId', data.data[0].recordingId === TRANSCRIPTION_EXAMPLE.recordingId],
      ['.error', data.data[0].error === TRANSCRIPTION_EXAMPLE.error],
      ['.createdAt', data.data[0].createdAt === TRANSCRIPTION_EXAMPLE.createdAt],
      ['.updatedAt', data.data[0].updatedAt === TRANSCRIPTION_EXAMPLE.updatedAt],
      ['._links', data.data[0]._links instanceof Object],
      ['._links.self', data.data[0]._links.self === TRANSCRIPTION_EXAMPLE._links.self],
      ['._links.file', data.data[0]._links.file === TRANSCRIPTION_EXAMPLE._links.file]
    ]);
  });
});

// Transcription read
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions/transcription_id')
    .reply(200, {
      data: [
        TRANSCRIPTION_EXAMPLE
      ]
    });

  messagebird.transcriptions.read('call_id', 'leg_id', 'recording_id', 'transcription_id', function (err, data) {
    doTest(err, 'transcriptions.read', [
      ['type', data instanceof Object],
      ['.id', data.data[0].id === TRANSCRIPTION_EXAMPLE.id],
      ['.recordingId', data.data[0].recordingId === TRANSCRIPTION_EXAMPLE.recordingId],
      ['.error', data.data[0].error === TRANSCRIPTION_EXAMPLE.error],
      ['.createdAt', data.data[0].createdAt === TRANSCRIPTION_EXAMPLE.createdAt],
      ['.updatedAt', data.data[0].updatedAt === TRANSCRIPTION_EXAMPLE.updatedAt],
      ['._links', data.data[0]._links instanceof Object],
      ['._links.self', data.data[0]._links.self === TRANSCRIPTION_EXAMPLE._links.self],
      ['._links.file', data.data[0]._links.file === TRANSCRIPTION_EXAMPLE._links.file]
    ]);
  });
});

// Transcription download
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/calls/call_id/legs/leg_id/recordings/recording_id/transcriptions/transcription_id.txt')
    .reply(200, '', {
      'Content-Disposition': 'attachment; filename="transcription_id.txt"'
    });

  messagebird.transcriptions.download('call_id', 'leg_id', 'recording_id', 'transcription_id', function (err, _) {
    doTest(err, 'transcriptions.download', []);
  });
});

// Voice webhook create
queue.push(function () {
  var params = {
    url: 'https://example.com/webhook',
    token: 'secret-token'
  };

  nock(VOICE_ENDPOINT)
    .post('/webhooks', params)
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      token: 'secret-token'
    });

  messagebird.voice.webhooks.create(params, function (err, data) {
    doTest(err, 'voice.webhooks.create', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.url', data && data.url === 'https://example.com/webhook'],
      ['.token', data && data.token === 'secret-token']
    ]);
  });
});

// Voice webhook read
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/webhooks/webhook-id')
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      token: 'secret-token'
    });

  messagebird.voice.webhooks.read('webhook-id', function (err, data) {
    doTest(err, 'voice.webhooks.read', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.token', data && data.token === 'secret-token']
    ]);
  });
});

// Voice webhook update
queue.push(function () {
  var params = { 'status': 'disabled' };

  nock('https://voice.messagebird.com')
    .put('/webhooks/webhook-id', params)
    .reply(200, {
      id: 'webhook-id',
      url: 'https://example.com/webhook',
      token: 'secret-token'
    });

  messagebird.voice.webhooks.update('webhook-id', params, function (err, data) {
    doTest(err, 'voice.webhooks.update', [
      ['type', data instanceof Object],
      ['.id', data && data.id === 'webhook-id'],
      ['.token', data && data.token === 'secret-token']
    ]);
  });
});


// Voice webhook list with pagination
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/webhooks')
    .query({
      perPage: 0,
      currentPage: 30
    })
    .reply(200, {
      perPage: 0,
      currentPage: 30,
      count: 1,
      totalCount: 1,
      items: [{
        id: 'webhook-id',
        url: 'https://example.com/webhook',
        token: 'secret-token'
      }]
    });

  messagebird.voice.webhooks.list(0, 30, function (err, data) {
    doTest(err, 'voice.webhooks.list', [
      ['type', data instanceof Object],
      ['.currentPage', data && data.currentPage === 30],
      ['.items[0].id', data && data.items[0].id === 'webhook-id']
    ]);
  });
});

// Voice webhook list without pagination
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .get('/webhooks')
    .reply(200, {
      offset: 0,
      limit: 30,
      count: 1,
      totalCount: 1,
      items: [{
        id: 'webhook-id',
        url: 'https://example.com/webhook',
        token: 'secret-token'
      }]
    });

  messagebird.voice.webhooks.list(function (err, data) {
    doTest(err, 'voice.webhooks.list.withoutpagination', [
      ['type', data instanceof Object],
      ['.limit', data && data.limit === 30],
      ['.items[0].id', data && data.items[0].id === 'webhook-id']
    ]);
  });
});

// Voice webhook delete
queue.push(function () {
  nock(VOICE_ENDPOINT)
    .delete('/webhooks/webhook-id')
    .reply(204, '');

  messagebird.voice.webhooks.delete('webhook-id', function (err) {
    doTest(err, 'voice.webhooks.delete', []);
  });
});


// Start the tests
if (accessKey) {
  accessType = accessKey.split('_') [0] .toUpperCase();
  cInfo('Running test.js');
  cInfo('Node.js ' + process.versions.node);
  cInfo('Module  ' + pkg.version);
  cInfo('Using ' + accessType + ' access key\n');

  messagebird = MessageBird.initClient(accessKey, timeout);

  queue[0]();
} else {
  cFail('MB_ACCESSKEY not set');
  errors++;
}
