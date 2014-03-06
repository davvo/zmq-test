var zmq = require('zmq');

module.exports = function (routerEndpoint, dealerEndpoint) {
    var router = zmq.socket('router').bindSync(routerEndpoint);
    var dealer = zmq.socket('dealer').bindSync(dealerEndpoint);

    router.on('message', function () {
        var argl = arguments.length,
            envelopes = Array.prototype.slice.call(arguments, 0, argl - 1),
            payload = arguments[argl - 1];
        console.log("Incoming ", payload.toString());
        dealer.send([envelopes, payload]);
    });

    dealer.on('message', function () {
        var argl = arguments.length,
            envelopes = Array.prototype.slice.call(arguments, 0, argl - 1),
            payload = arguments[argl - 1];
        router.send([envelopes, payload]);
    });
}