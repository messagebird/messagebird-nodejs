var messagebird = require('./lib/messagebird');

console.log('MessageBird Node.js Library test run');
console.log('---');

// test_WyB2x1bFsXypeab533ToUj0ql
// live_kqnckmyT61aVkpgObVUN4cNcD
messagebird.init('test_WyB2x1bFsXypeab533ToUj0ql');

console.log('Sending message(s)...');

// Send an SMS
messagebird.messages.create('Joey', [ 31610948431 ], 'This is a test message', {}, function(error, response){
    console.log('Messages sent - ' + response.id);

    // Read an SMS
    messagebird.messages.read(response.id, function(error, response){
        console.log('Messages sent/read: ' + response.totalCount);
    });
});

console.log('Sending voice message(s)...');

// Send a voice message
messagebird.voice_messages.create([ 31610948431 ], 'This is a test message', {}, function(error, response){
    console.log('Voice messages sent - ' + response.id);

    // Read an SMS
    messagebird.voice_messages.read(response.id, function(error, response){
        console.log('Voice messages sent/read: ' + response.totalCount);
    });
});

console.log('Creating HLR...');

// Create HLR
messagebird.hlr.create(31610948431, 'The ref', {}, function(error, response){
    console.log('HLR sent - ' + response.id);

    // Read an SMS
    messagebird.hlr.read(response.id, function(error, response){
        console.log('HLR sent/read: ' + response.totalCount);
    });
});

console.log('Reading balance...');

messagebird.balance.read(function(error, response){
    console.log('Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment );
});

console.log('---');
