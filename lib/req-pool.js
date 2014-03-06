var zmq = require('zmq'),
    poolModule = require('generic-pool');

module.exports = function (endpoint) {
    var pool = poolModule.Pool({
        name     : 'req',
        create   : function(callback) {
            var req = zmq.socket('req').bind(endpoint);

            // parameter order: err, resource
            // new in 1.0.6
            callback(null, req);
        },
        destroy  : function(req) { 
            req.close(); 
        },
        max      : 10,
        // optional. if you set this, make sure to drain() (see step 3)
        min      : 2, 
        // specifies how long a resource can stay idle in pool before being removed
        idleTimeoutMillis : 30000,
         // if true, logs via console.log - can also be a function
        log : true
    });
}