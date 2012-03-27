//     lib/adapters/sub.js v0.0.2
//     (c) 2012 Adriano Raiano (adrai); under MIT License

// This adapter acts as subscriber for a pub/sub topology.

var Adapter;

if (typeof module.exports !== 'undefined') {
    Adapter = module.exports;
}

Adapter.VERSION = '0.0.1';

// Create new instance of the adapter.
Adapter.create = function(hub, callback) {
    new SubAdapter(hub, callback);
};

// ## SubAdapter
//
// - __hub:__ the hub
// - __callback:__ `function(err, adapter){}`
var SubAdapter = function(hub, callback) {
    this.hub = hub;
    this._init(callback);
};

// Inherit prototyp and extend it.
(function(S) {

    var P = S.prototype;
    
    // __init:__ initializes the adapter.
    // 
    // `this._init(callback)`
    //
    // - __callback:__ `function(err, adapter){}`
    P._init = function(callback) {
        
        var self = this;

        var handle = function(exchange) {
            self._openCallback(exchange);
            callback(null, self);
        };

        if (!this.hub.options.channel){
            this.hub.connection.exchange('amq.fanout', {passive: true}, handle);
        } else {
            this.hub.connection.exchange(this.hub.options.channel, {type: 'fanout', autoDelete: true}, handle);
        }

    };

    // __openCallback:__ this is the callback for the exchange open.
    // 
    // `this._openCallback(exchange)`
    //
    // - __exchange:__ the exchange object coming from connection.exchange();
    P._openCallback = function(exchange) {
        
        var self = this;

        var ackSettings = self.hub.options.ack ? { ack: self.hub.options.ack } : {};

        var q = this.hub.connection.queue('', {durable:false}, function(queue) {

            queue.subscribe(ackSettings, function(msg) {
                self.hub.send(msg.data.toString());
            });

            var routingKeys = self.hub.options.routingKeys || ['#'];
            for(var i in routingKeys) {
                var routingKey = routingKeys[i];
                queue.bind(exchange.name, routingKey);
            }

        });

        this.hub.on('ack', function() {
            q.shift();
        });

        this.hub.on('close', function() {
            q.destroy();
        });

    };
    
})(SubAdapter);