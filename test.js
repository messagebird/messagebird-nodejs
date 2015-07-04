var messagebird = require('./lib/messagebird');

console.log('MessageBird Node.js Library test run');
console.log('---');

// test_WyB2x1bFsXypeab533ToUj0ql
// live_kqnckmyT61aVkpgObVUN4cNcD
messagebird.init('test_WyB2x1bFsXypeab533ToUj0ql');

console.log('Sending message(s)...');

// Send an SMS
messagebird.messages.create(
    'Joey',
    [ 59995288283 ],
    'This message was sent using the MessageBird Node.js API Wrapper',
    {
        type: 'sms',
        reference: 'A client reference',
        validity: 12,
        gateway: 2,
        typeDetails: 's0m3H4shV4lu3H3r3',
        datacoding: 'plain',
        mclass: 1,
        scheduledDatetime: '2015-07-03T19:40:03+00:00'
    },
    function(error, response){
        if( !error ){
            console.log('Messages sent - ' + response.id);

            // Read an SMS
            messagebird.messages.read(response.id, function(error, response){
                console.log('Messages sent/read: ' + response.totalCount);
            });
        } else {
            console.log('Oh no, error(s) occured:');
            console.dir(error);
        }
    });

console.log('Sending voice message(s)...');

// Send a voice message
messagebird.voice_messages.create(
    [ 31610948431 ],
    'Hey Cecil, please vote for Obama Drama in the upcomming elections.',
    {},
    function(error, response){
        if( !error ){
            console.log('Voice messages sent - ' + response.id);

            // Read an SMS
            messagebird.voice_messages.read(response.id, function(error, response){
                console.log('Voice messages sent/read: ' + response.totalCount);
            });
        } else {
            console.log('Oh no, error(s) occured:');
            console.dir(error);
        }
    });

console.log('Creating HLR...');

// Create HLR
messagebird.hlr.create(31610948431, 'The ref', {}, function(error, response){
    if( !error ){
        console.log('HLR sent - ' + response.id);

        // Read an SMS
        messagebird.hlr.read(response.id, function(error, response){
            console.log('HLR sent/read: ' + response.totalCount);
        });
    } else {
        console.log('Oh no, error(s) occured:');
        console.dir(error);
    }
});

console.log('Reading balance...');

messagebird.balance.read(function(error, response){
    if( !error ){
        console.log('Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment );
    } else {
        console.log('Oh no, error(s) occured:');
        console.dir(error);
    }
});

console.log('---');
