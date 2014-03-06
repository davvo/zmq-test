var zmq = require('zmq'),
    cluster = require('cluster'),
    Majordomo = require('./lib/majordomo');

//var routerEndpoint = 'tcp://127.0.0.1:3000',
var routerEndpoint = 'inproc://router',
    dealerEndpoint = 'tcp://127.0.0.1:3001';

if (cluster.isMaster) {

    var count = 0;

    var majordomo = new Majordomo(routerEndpoint, dealerEndpoint);

    var req = zmq.socket('req').connect(routerEndpoint);
    console.log('req bound to %s', routerEndpoint);

    // Fork workers.
    var numCPUs = require('os').cpus().length;
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    req.on('message', function (msg) {
        --count;
        console.log("Server got food: %s. Need %d more", msg, count);
    });

    var messageId = 0;
    setInterval(function(){
        console.log('sending work ' + messageId);
        req.send('feed me ' + messageId);
        messageId++;
        count++;
    }, 500);

} else {
    
    console.log('worker %s started', process.pid);

    var rep = zmq.socket('rep').connect(dealerEndpoint);
    console.log('Worker %s connected to ', process.pid, dealerEndpoint);

    rep.on('message', function (msg) {
        console.log('Worker %s got message: %s', process.pid, msg.toString());
        setTimeout(function () {
            rep.send('food');            
        }, 1000)
    });
}