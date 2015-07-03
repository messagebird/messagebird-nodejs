var messagebird = require('./lib/messagebird');

// test_WyB2x1bFsXypeab533ToUj0ql
// live_kqnckmyT61aVkpgObVUN4cNcD
messagebird.init('test_WyB2x1bFsXypeab533ToUj0ql');

/*
// Send an SMS
messagebird.messages.create('Joey', [ 31610948431 ], 'This is a test message', {}, function(error, response){
    console.log(response);
});
*/

/*
// Read an SMS
messagebird.messages.read('4ba78930655970b77b9c673b97155895', function(error, response){
    console.log(response);
});
*/


// Send a voice message
messagebird.voice_messages.create([ 31610948431 ], 'This is a test message', {}, function(error, response){
    console.log(response);
});


/*
// Read a voice message
messagebird.voice_messages.read('d85384a0355970d6f495032a58211748', function(error, response){
    console.log(response);
}); // No is working yet
*/

/*
// Create HLR
messagebird.hlr.create(31610948431, 'The ref', {}, function(error, response){
    console.log(response);
});
*/

/*
// Read HLR
messagebird.hlr.read('dce24d60655970ed6ef9620h64451942', function(error, response){
    console.log(response);
});
*/

/*
messagebird.balance.read(function(error, response){
    console.log(response);
});
*/
