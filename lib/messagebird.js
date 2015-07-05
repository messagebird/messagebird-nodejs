
/*---------------------*/
/** Some Dependencies **/
/*---------------------*/

var assert = require('assert'),
    https = require('https'),
    querystring = require('querystring');

/*----------------------*/
/** MessageBird Module **/
/*----------------------*/

var MessageBird = {

    debug_mode: false,

    access_key: null,

    set_access_key: function( access_key ){
        'use strict';
        this.access_key = access_key;
        return true;
    },

    request: function(path, method, data, callback) {
        'use strict';

        if( method === 'GET' ){
            path = path + '?' + querystring.stringify(data);
        }

        var headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'AccessKey ' + this.access_key
            },
            options = {
        		host: 'rest.messagebird.com',
        		port: 443,
        		path: path,
        		method: method,
        		headers: headers
        	},
            response_return = '',
            request = https.request(options);

        if( method === 'POST' ){
            request.write(querystring.stringify(data));
        }

    	request.end();

    	request.on('response',function(response){
    		response.on('data',function(chunk){
            	response_return += chunk;
    		});
    		response.on('end',function(){
    			if (callback) {
    				var json = response_return,
                        error = null;
    				try {
                        json = JSON.parse(response_return);
                    } catch ( parser_error ){
                        error = parser_error;
                    }
    				callback( error, json );
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
        'use strict';

        var _this = this;

        data = this.process_data( data, options );

        if( typeof options === 'function' ){
            callback = options;
        }

        this.request(path, 'POST', data, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    read: function( path, id, callback ){
        'use strict';

        var _this = this,
            data = this.process_data({
                id: id
            });

        this.request( path, 'GET', data, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    messages_create: function( originator, recipients, body, options, callback ){
        'use strict';

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
        'use strict';
        this.read('/messages', id, callback);
    },

    voice_messages_create: function( recipients, body, options, callback ){
        'use strict';

        assert.ok(recipients instanceof(Array), 'Argument "recipients" must be an Array');
        assert.equal(typeof(body), 'string', 'Argument "body" must be a String');

        this.create('/voicemessages', {
            recipients: recipients,
            body: body
        }, options, callback);
    },

    voice_messages_read: function( id, callback ){
        'use strict';
        this.read('/voicemessages', id, callback);
    },

    hlr_create: function( msisdn, reference, callback ){
        'use strict';

        assert.equal(typeof(msisdn), 'number', 'Argument "msisdn" must be an Integer');
        assert.equal(typeof(reference), 'string', 'Argument "reference" must be a String');

        this.create('/hlr', {
            msisdn: msisdn,
            reference: reference
        }, {}, callback);
    },

    hlr_read: function( id, callback ){
        'use strict';
        this.read('/hlr', id, callback);
    },

    balance_read: function( callback ){
        'use strict';

        var _this = this;

        this.request('/balance', 'GET', {}, function( error, response ){
            _this.process_callback( callback, error, response );
		});
    },

    process_data: function( data, options ){
        'use strict';

        //data.access_key = this.access_key;
        if( options && typeof options === 'object' ){
            data = this.merge_options( data, options );
        }
        return data;
    },

    process_callback: function( callback, error, response ){
        'use strict';

        if( callback ){
            if( response.errors ){
                this.log(response.errors);
                callback( response.errors, false );
                return;
            } else if( error ){
                this.log(error);
                callback( error, false );
                return;
            }
            callback( false, response );
        }
    },

    merge_options: function( data, options ){
        'use strict';

        var merged_options = {};
        for (var data_attr in data) {
            if( data.hasOwnProperty(data_attr) )
            merged_options[data_attr] = data[data_attr];
        }
        for (var options_attr in options) {
            if( data.hasOwnProperty(options_attr) )
            merged_options[options_attr] = options[options_attr];
        }
        return merged_options;
    },

    log: function( message ){
        'use strict';

        if( this.debug_mode ){
            console.log( message );
        }
    }
};

/*-----------------------------*/
/** Export MessageBird Module **/
/*-----------------------------*/

exports.init = function( access_key, debug_mode ){
    'use strict';
    MessageBird.debug_mode = (debug_mode) ? debug_mode : false;
    return MessageBird.set_access_key( access_key );
};

exports.messages = {
    create: function( originator, recipients, body, options, callback ){
        'use strict';
        MessageBird.messages_create( originator, recipients, body, options, callback );
    },
    read: function( id, callback ){
        'use strict';
        MessageBird.messages_read( id, callback );
    }
};

exports.voice_messages = {
    create: function( recipients, body, options, callback ){
        'use strict';
        MessageBird.voice_messages_create( recipients, body, options, callback );
    },
    read: function( id, callback ){
        'use strict';
        MessageBird.voice_messages_read( id, callback );
    }
};

exports.hlr = {
    create: function( msisdn, reference, options, callback ){
        'use strict';
        MessageBird.hlr_create( msisdn, reference, options, callback );
    },
    read: function( id, callback ){
        'use strict';
        MessageBird.hlr_read( id, callback );
    }
};

exports.balance = {
    read: function( callback ){
        'use strict';
        MessageBird.balance_read( callback );
    }
};
