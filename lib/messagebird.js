
// MessageBird namespace, used to house all the functions

var MessageBird = {

    api_url: 'https://rest.messagebird.com',
    access_key: null,

    set_access_key: function( access_key ){
        // TODO: Add sanitation
        this.access_key = access_key;
    },

    balance: function(){

    }
}

/*-------------------------------------------*/

exports.init = function( access_key ){
    MessageBird.set_access_key( access_key );
};

exports.balance = function( ){
    MessageBird.balance();
};
