var messagebird = require('./lib/messagebird');

console.log('MessageBird Node.js Library test run');
console.log('---');

var live = false;
if( live ){
    messagebird.init('live_kqnckmyT61aVkpgObVUN4cNcD');
} else{
    messagebird.init('test_WyB2x1bFsXypeab533ToUj0ql', true);
}

var now = microtime(true);

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
            console.log((microtime(true) - now).toFixed(3) + 's: Messages sent - ' + response.id);

            // Read an SMS
            messagebird.messages.read(response.id, function(error, response){
                console.log((microtime(true) - now).toFixed(3) + 's: Messages sent/read: ' + response.totalCount);
            });
        }
    });

console.log('Sending voice message(s)...');

// Send a voice message
messagebird.voice_messages.create(
    [ 31610948431 ],
    'Hey Henri Winkel! You can also send automated messages with Messagebird. Cecil is sooo dumb.',
    {
        reference: 'A client reference',
        language: 'en-gb',
        voice: 'female',
        repeat: 1,
        ifMachine: 'continue',
        scheduledDatetime: '2015-07-03T19:40:03+00:00'
    },
    function(error, response){
        if( !error ){
            console.log((microtime(true) - now).toFixed(3) + 's: Voice messages sent - ' + response.id);

            // Read an SMS
            messagebird.voice_messages.read(response.id, function(error, response){
                console.log((microtime(true) - now).toFixed(3) + 's: Voice messages sent/read: ' + response.totalCount);
            });
        }
    });

console.log('Creating HLR...');

// Create HLR
messagebird.hlr.create(
    31610948431,
    'The ref',
    function(error, response){
        if( !error ){
            console.log((microtime(true) - now).toFixed(3) + 's: HLR sent - ' + response.id);

            // Read an SMS
            messagebird.hlr.read(response.id, function(error, response){
                console.log((microtime(true) - now).toFixed(3) + 's: HLR sent/read: ' + response.totalCount);
            });
        }
    });

console.log('Reading balance...');

messagebird.balance.read(function(error, response){
    if( !error ){
        console.log((microtime(true) - now).toFixed(3) + 's: Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment );
    }
});

console.log('---');

function microtime() {
    return parseFloat(new Date().getTime() / 1000);
}
