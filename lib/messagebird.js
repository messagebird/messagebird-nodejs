
var assert = require('assert'),
    https = require('https'),
    querystring = require('querystring');

var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accept': 'application/json'
};

// MessageBird namespace, used to house all the functions

var MessageBird = {

    access_key: null,

    set_access_key: function( access_key ){
        // TODO Check if acces_key is a thing
        this.access_key = access_key;
        return true;
    },

    request: function(path, method, data, callback) {

    	if( typeof method === 'function' ){
    		callback = method;
    		method = 'GET';
    	}

        if( method === 'GET' ){
            path = path + '?' + querystring.stringify(data);
        }

    	var options = {
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

    create: function( path, data, options, callback ){
        var _this = this,
            data = this.process_data( data, options );

        if( typeof options === 'function' ){
            callback = options;
        }

        this.request(path, 'POST', data, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    read: function( path, id, callback ){
        var _this = this,
            data = this.process_data({
                id: id
            });

        this.request( path, 'GET', data, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    messages_create: function( originator, recipients, body, options, callback ){
        assert.equal(typeof(originator), 'string', 'Argument "originator" must be a String');
        assert.ok(recipients instanceof(Array), 'Argument "recipients" must be an Array');
        assert.equal(typeof(body), 'string', 'Argument "body" must be a String');

        this.create('/messages', {
            originator: originator,
            recipients: recipients,
            body: body
        }, options, callback);
    },

    messages_read: function( id, callback ){
        this.read('/messages', id, callback);
    },

    voice_messages_create: function( recipients, body, options, callback ){
        assert.ok(recipients instanceof(Array), 'Argument "recipients" must be an Array');
        assert.equal(typeof(body), 'string', 'Argument "body" must be a String');

        this.create('/voicemessages', {
            recipients: recipients,
            body: body
        }, options, callback);
    },

    voice_messages_read: function( id, callback ){
        this.read('/voicemessages', id, callback);
    },

    hlr_create: function( msisdn, reference, options, callback ){
        assert.equal(typeof(msisdn), 'number', 'Argument "msisdn" must be an Integer');
        assert.equal(typeof(reference), 'string', 'Argument "reference" must be a String');

        this.create('/hlr', {
            msisdn: msisdn,
            reference: reference
        }, options, callback);
    },

    hlr_read: function( id, callback ){
        this.read('/hlr', id, callback);
    },

    balance_read: function( callback ){
        var _this = this,
            data = { access_key: this.access_key };

        this.request('/balance', 'GET', data, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    process_data: function( data, options ){
        data.access_key = this.access_key;
        if( options && typeof options === 'object' ){
            data = this.merge_options( data, options );
        }
        return data;
    },

    process_callback: function( callback, error, response ){
        if( callback ){
            if( response.errors ){
                callback( response.errors, false );
                return;
            } else if( error ){
                callback( error, false );
                return;
            }
            callback( false, response );
        }
    },

    merge_options: function( data, options ){
        var merged_options = {};
        for (var attrname in data) { merged_options[attrname] = data[attrname]; }
        for (var attrname in options) { merged_options[attrname] = options[attrname]; }
        return merged_options;
    }
}

/*-------------------------------------------*/

exports.init = function( access_key ){
    return MessageBird.set_access_key( access_key );
};

exports.messages = {
    create: function( originator, recipients, body, options, callback ){
        MessageBird.messages_create( originator, recipients, body, options, callback );
    },
    read: function( id, callback ){
        MessageBird.messages_read( id, callback );
    }
};

exports.voice_messages = {
    create: function( recipients, body, options, callback ){
        MessageBird.voice_messages_create( recipients, body, options, callback );
    },
    read: function( id, callback ){
        MessageBird.voice_messages_read( id, callback );
    }
};

exports.hlr = {
    create: function( msisdn, reference, options, callback ){
        MessageBird.hlr_create( msisdn, reference, options, callback );
    },
    read: function( id, callback ){
        MessageBird.hlr_read( id, callback );
    }
};

exports.balance = {
    read: function( callback ){
        MessageBird.balance_read( callback );
    }
};
