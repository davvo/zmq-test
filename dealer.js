var zmq = require('zmq'),
    cluster = require('cluster'),

    Broker = require('./lib/broker'),
    ReqPool = require('./lib/req-pool'),

    routerEndpoint = 'inproc://router',
    dealerEndpoint = 'tcp://127.0.0.1:3001';

function ping() {
    req = zmq.socket('req').connect(routerEndpoint);
    req.on('message', function (msg) {
        console.log("Got message: ", msg.toString());
        req.close();
    });
    req.send('ping?');
}

if (cluster.isMaster) {

    var broker = new Broker(routerEndpoint, dealerEndpoint);

    // Fork workers.
    var numCPUs = require('os').cpus().length;
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    setTimeout(function () {
        
    }, 1000);

} else {
    
    console.log('worker %s started', process.pid);

    var rep = zmq.socket('rep').connect(dealerEndpoint);
    console.log('Worker %s connect to ', process.pid, dealerEndpoint);

    rep.on('message', function (msg) {
        console.log('Worker %s got message: %s', process.pid, msg.toString());
        setTimeout(function () {
            rep.send('pong!')
        }, 1000);
    });
}