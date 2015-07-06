var messagebird = require('./lib/messagebird')
    colors = require('colors');

console.log('MessageBird Node.js Library test run');
console.log('---'.blue);

var live = false;
if( live ){
    messagebird.init('<LIVE_ACCESS_KEY>');
    console.log('Using LIVE access key...');
} else{
    messagebird.init('<TEST_ACCESS_KEY>', false);
    console.log('Using TEST access key...');
}
console.log('---'.blue);

var now = microtime();

console.log('Sending message(s)...');

// Send an SMS
messagebird.messages.create(
    'Joey',
    [ 31610948431 ],
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
            console.log((microtime() + 's: ').green + 'Messages sent' + (' - ' + response.id).grey);

            // Read an SMS
            messagebird.messages.read(response.id, function(error, response){
                console.log((microtime() + 's: ').green + 'Messages sent/read: ' + response.totalCount);
            });
        } else {
            for( var i = 0; i < error.length; i++ ){
                console.log('ERR: '.red + 'Messages: ' + error[i].description);
            }
        }
    });

console.log('Sending voice message(s)...');

// Send a voice message
messagebird.voice_messages.create(
    [ 31610948431 ],
    'Hey Henri Winkel! You can also send automated messages with Messagebird.',
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
            console.log((microtime() + 's: ').green + 'Voice messages sent' + (' - ' + response.id).grey);

            // Read an SMS
            messagebird.voice_messages.read(response.id, function(error, response){
                console.log((microtime() + 's: ').green + 'Voice messages sent/read: ' + response.totalCount);
            });
        } else {
            for( var i = 0; i < error.length; i++ ){
                console.log('ERR: '.red + 'Voice messages: ' + error[i].description);
            }
        }
    });

console.log('Creating HLR...');

// Create HLR
messagebird.hlr.create(
    31610948431,
    'The ref',
    function(error, response){
        if( !error ){
            console.log((microtime() + 's: ').green + 'HLR sent' + (' - ' + response.id).grey);

            // Read an SMS
            messagebird.hlr.read(response.id, function(error, response){
                console.log((microtime() + 's: ').green + 'HLR sent/read: ' + response.totalCount);
            });
        } else {
            for( var i = 0; i < error.length; i++ ){
                console.log('ERR: '.red + 'HLR: ' + error[i].description);
            }
        }
    });

console.log('Reading balance...');

messagebird.balance.read(function(error, response){
    if( !error ){
        console.log((microtime() + 's: ').green + 'Your balance: ' + response.amount + ', ' + response.type + ', ' + response.payment );
    } else {
        for( var i = 0; i < error.length; i++ ){
            console.log('ERR: '.red + 'Balance: ' + error[i].description);
        }
    }
});

console.log('---'.blue);

function microtime() {
    if( now ){
        return (parseFloat(new Date().getTime() / 1000) - now).toFixed(3);
    }
    return parseFloat(new Date().getTime() / 1000);
}
