var MessageBird = require ('./');
var messagebird;
var colors = require ('colors');

var accessKey = process.env.MB_ACCESSKEY || null;
var timeout = process.env.MB_TIMEOUT || 5000;

var testStart = Date.now ();
var errors = 0;
var queue = [];
var next = 0;
var accessType = null;

var cache = {
  textMessage: {
    originator: 'node-js',
    recipients: [31610948431],
    type: 'sms',
    body: 'Test message from node v' + process.version,
    gateway: 2
  },

  voiceMessage: {
    recipients: [31610948431],
    body: 'Hello, this is a test message from node version ' + process.version,
    language: 'en-gb',
    voice: 'female',
    repeat: 1,
    ifMachine: 'continue'
  },

  hlr: {}
};


// Output
function cGood (arg) {
  console.log ('good'.green + ' - ' + arg);
}

function cFail (arg) {
  console.error ('fail'.bold.red + ' - ' + arg);
  errors++;
}

function cInfo (arg) {
  console.log ('info'.yellow + ' - ' + arg);
}

function cDump (arg) {
  console.dir (arg, { depth: null, colors: true });
}

function cError (arg, err) {
  console.error ('ERR'.bold.red + '  - ' + arg + '\n');
  cDump (err);
  console.log ();
  console.error (err.stack);
  console.log ();
  errors++;
}


// handle exits
/* eslint no-process-exit:0 */

process.on ('exit', function () {
  var timing = (Date.now () - testStart) / 1000;

  console.log ('\nTiming: ' + timing + ' sec');
  if (errors === 0) {
    console.log ('\nDONE, no errors.\n');
    process.exit (0);
  } else {
    console.log ('\nFAIL'.bold.red + ', ' + errors + ' error' + (errors > 1 ? 's' : '') + ' occurred!\n');
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  cError ('uncaughtException', err);
});

// Queue to prevent flooding
function doNext () {
  next++;
  if (queue [next]) {
    queue [next] ();
  }
}

// doTest( passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ])
function doTest (err, label, tests) {
  var i;
  var testErrors = [];

  if (err instanceof Error) {
    cError (label, err);
    errors++;
  } else {
    for (i = 0; i < tests.length; i++) {
      if (tests [i] [1] !== true) {
        testErrors.push (tests [i] [0]);
        errors++;
      }
    }

    if (testErrors.length === 0) {
      cGood (label);
    } else {
      cFail (label + ' (' + testErrors.join (', ') + ')');
    }
  }

  doNext ();
}


queue.push (function () {
  messagebird.messages.create (
    {},
    function (err) {
      doTest (null, 'error handling', [
        ['type', err instanceof Error],
        ['message', err.message === 'api error'],
        ['errors', err.errors instanceof Array]
      ]);
    }
  );
});


queue.push (function () {
  messagebird.balance.read (function (err, data) {
    doTest (err, 'balance.read', [
      ['type', data instanceof Object],
      ['.amount', data && typeof data.amount === 'number'],
      ['.type', data && typeof data.type === 'string'],
      ['.payment', data && typeof data.payment === 'string']
    ]);
  });
});


queue.push (function () {
  messagebird.messages.create (cache.textMessage, function (err, data) {
    cache.textMessage.id = data && data.id || null;
    doTest (err, 'messages.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});


queue.push (function () {
  if (cache.textMessage.id) {
    messagebird.messages.read (cache.textMessage.id, function (err, data) {
      doTest (err, 'messages.read', [
        ['type', data instanceof Object],
        ['.totalCount', data && typeof data.totalCount === 'number']
      ]);
    });
  }
});


queue.push (function () {
  messagebird.voice_messages.create (cache.voiceMessage, function (err, data) {
    cache.voiceMessage.id = data && data.id || null;
    doTest (err, 'voice_messages.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
  });
});


queue.push (function () {
  if (cache.voiceMessage.id) {
    messagebird.voice_messages.read (cache.voiceMessage.id, function (err, data) {
      doTest (err, 'voice_messages.read', [
        ['type', data instanceof Object],
        ['.totalCount', data && typeof data.totalCount === 'number']
      ]);
    });
  }
});


queue.push (function () {
  messagebird.hlr.create (
    31610948431,
    'The ref',
    function (err, data) {
      cache.hlr.id = data && data.id || null;
      doTest (err, 'hlr.create', [
        ['type', data instanceof Object],
        ['.id', data && typeof data.id === 'string']
      ]);
    }
  );
});


queue.push (function () {
  if (cache.hlr.id) {
    messagebird.hlr.read (cache.hlr.id, function (err, data) {
      doTest (err, 'hlr.read', [
        ['type', data instanceof Object],
        ['.totalCount', data && typeof data.totalCount === 'number']
      ]);
    });
  }
});


// Start the tests
if (accessKey) {
  accessType = accessKey.split ('_') [0] .toUpperCase ();
  console.log ('\n');
  cInfo ('Running test.js');
  cInfo ('Using ' + accessType + ' access key\n');

  messagebird = new MessageBird.client (accessKey, timeout);

  queue[0]();
} else {
  cFail ('MB_ACCESSKEY not set');
  errors++;
}
