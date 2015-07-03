
var assert = require('assert'),
    https = require('https'),
    querystring = require('querystring');

var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accept': 'application/json'
};

// MessageBird namespace, used to house all the functions

var MessageBird = {

    endpoint: 'https://rest.messagebird.com',
    access_key: null,

    set_access_key: function( access_key ){
        // TODO: Add sanitation
        this.access_key = access_key;
    },

    request: function(path, method, data, callback) {

    	if (typeof method == 'function') {
    		callback = method;
    		method='GET';
    	}

        if( method === 'GET' ){
            path = path + '?' + querystring.stringify(data);
        }

    	options = {
    		host: 'rest.messagebird.com',
    		port: 443,
    		path: path,
    		method: method,
    		headers: headers
    	};

    	var request = https.request(options);

        if( method === 'POST' ){
            request.write(querystring.stringify(data));
        }

    	request.end();

        var responseReturn = '';

    	request.on('response',function(response){

    		response.on('data',function(chunk){
            	responseReturn += chunk;
    		});

    		response.on('end',function(){
    			if (callback) {
    				var retJson = responseReturn;
    				var error = null;
    				try {
                        retJson = JSON.parse(responseReturn);
                    } catch ( parser_error ){
                        error = parser_error;
                    }
    				callback( error, retJson );
    			}
    		});

    		response.on('close', function(e) {
    			callback(e);
    		});
    	});

    	request.on('error', function(e) {
    		callback(e);
    	});
    },

    messages: {
        create: function( originator, recipients, body, options, callback ){
            assert.equal(typeof(originator), 'string', 'Argument "originator" must be a String');
            assert.ok(recipients instanceof(Array), 'Argument "recipients" must be an Array');
            assert.equal(typeof(body), 'string', 'Argument "body" must be a String');

            if( typeof options === 'function' ){
                callback = options;
            }

            var data = {
                access_key: MessageBird.access_key,
                originator: originator,
                recipients: recipients,
                body: body
            };

            MessageBird.request('/messages', 'POST', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        },
        read: function( id, callback ){
            var data = {
                access_key: MessageBird.access_key,
                id: id
            };

            MessageBird.request('/messages', 'GET', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        }
    },

    voice_messages: {
        create: function( recipients, body, options, callback ){

            if( typeof options === 'function' ){
                callback = options;
            }

            var data = {
                access_key: MessageBird.access_key,
                recipients: recipients,
                body: body
            };

            MessageBird.request('/voicemessages', 'POST', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        },
        read: function( id, callback ){
            var data = {
                access_key: MessageBird.access_key,
                id: id
            };

            MessageBird.request('/voicemessages', 'GET', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        }
    },

    hlr: {
        create: function( msisdn, reference, options, callback ){

            if( typeof options === 'function' ){
                callback = options;
            }

            var data = {
                access_key: MessageBird.access_key,
                msisdn: msisdn,
                reference: reference
            };

            MessageBird.request('/hlr', 'POST', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        },
        read: function( id, callback ){
            var data = {
                access_key: MessageBird.access_key,
                id: id
            };

            MessageBird.request('/hlr', 'GET', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        }
    },

    balance: {
        read: function( callback ){
            var data = { access_key: MessageBird.access_key };

            MessageBird.request('/balance', 'GET', data, function( error, response ){
                if( callback ){
                    callback( error, response );
                }
    		});
        }
    },

    error: function( callback, error, response ){
        if (callback) {
    		callback( error, response );
    	} else {
    		throw error;
    	}
    }
}

/*-------------------------------------------*/

exports.init = function( access_key ){
    MessageBird.set_access_key( access_key );
};

exports.messages = {
    create: function( originator, recipients, body, options, callback ){
        MessageBird.messages.create( originator, recipients, body, options, callback );
    },
    read: function( id, callback ){
        MessageBird.messages.read( id, callback );
    }
};

exports.voice_messages = {
    create: function( recipients, body, options, callback ){
        MessageBird.voice_messages.create( recipients, body, options, callback );
    },
    read: function( id, callback ){
        MessageBird.voice_messages.read( id, callback );
    }
};

exports.hlr = {
    create: function( msisdn, reference, options, callback ){
        MessageBird.hlr.create( msisdn, reference, options, callback );
    },
    read: function( id, callback ){
        MessageBird.hlr.read( id, callback );
    }
};

exports.balance = {
    read: function( callback ){
        MessageBird.balance.read( callback );
    }
};
