var fs = require('fs'),
    zmq = require('zmq'),
    cluster = require('cluster');

if (cluster.isMaster) {

    var work = zmq.socket('push').bindSync('tcp://127.0.0.1:3000'),
        result = zmq.socket('pull').bindSync('tcp://127.0.0.1:3001');

    var numWorkers = 5;
    setTimeout(function () {
        for (var i = 0; i < numWorkers; ++i) {
            cluster.fork();
        }
    }, 1000);

    var count = 0;
    var inProgress = {};

    setInterval(function () {
        if (Object.keys(inProgress).length < numWorkers) {
            var task = 'work ' + (++count);
            inProgress[task] = 1;
            work.send(task);
        }
    }, 100);

    result.on('message', function (msg) {
        var task = msg.toString()
        console.log("Got result: ", task);
        delete inProgress[task];
        console.log("In progress: ", Object.keys(inProgress));
    });

} else {

    var work = zmq.socket('pull'),
        result = zmq.socket('push');

    work.connect('tcp://127.0.0.1:3000'),
    result.connect('tcp://127.0.0.1:3001');

    work.on('message', function (msg) {
        for (var i = 0; i < 10; i++) {
            fs.readFileSync('./file.test');            
        }
        result.send(msg);
    });
}