var fs = require('fs');
var path = require ('path');
var root = path.resolve('.');
var nock = require('nock');
var pkg = require(root + '/package.json');
var MessageBird = require(root);
var messagebird;

var accessKey = process.env.MB_ACCESSKEY || null;
var timeout = process.env.MB_TIMEOUT || 5000;
var number = parseInt(process.env.MB_NUMBER, 10) || 31612345678;

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
    body: 'Test message from node ' + process.version,
    gateway: 2
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
    recipient: number
  },

  lookup: {
    phoneNumber: number
  }
};


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
  messagebird.voice_messages.create(cache.voiceMessage, function (err, data) {
    cache.voiceMessage.id = data && data.id || null;
    doTest(err, 'voice_messages.create', [
      ['type', data instanceof Object],
      ['.id', data && typeof data.id === 'string']
    ]);
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


// queue.push(function () {
//   if (cache.verify.id) {
//     messagebird.verify.read(cache.verify.id, function (err, data) {
//       doTest(err, 'verify.read', [
//         ['type', data instanceof Object],
//         ['.id', data && data.id === cache.verify.id]
//       ]);
//     });
//   }
// });


// queue.push(function () {
//   if (cache.verify.id) {
//     messagebird.verify.delete(cache.verify.id, function (err, data) {
//       doTest(err, 'verify.delete', [
//         ['type', typeof data === 'boolean'],
//         ['data', data === true]
//       ]);
//     });
//   }
// });

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
          ['.status', data.status === 'absent'],
          ['.network', data.network === 20408],
          ['.details', data.details instanceof Object && data.details.country_iso === 'NLD']
        ]);
      }
    });
  }, 500);
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

  var params = {
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
    .get('/groups/group-id')
    .query(function (queryString) {
      // nock isn't too forgiving when it comes to non-standard queries. The
      // closest we can get to properly testing the query is comparing the
      // encoded JSON. The query is, in fact, `_method=PUT&ids[]=first-id&ids[]=second-id`.
      var expected = '{"_method":"PUT","ids":["first-id","second-id"]}';

      return JSON.stringify(queryString) === expected;
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

// Start the tests
if (accessKey) {
  accessType = accessKey.split('_') [0] .toUpperCase();
  cInfo('Running test.js');
  cInfo('Node.js ' + process.versions.node);
  cInfo('Module  ' + pkg.version);
  cInfo('Using ' + accessType + ' access key\n');

  messagebird = MessageBird(accessKey, timeout);

  queue[0]();
} else {
  cFail('MB_ACCESSKEY not set');
  errors++;
}
