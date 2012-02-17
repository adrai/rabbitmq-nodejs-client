//     lib/adapters/subDurableChannel.js v0.0.2
//     (c) 2012 Adriano Raiano (adrai); under MIT License

// This adapter acts as durable subscriber for a pub/sub topology with durable messages.

var Adapter;

if (typeof module.exports !== 'undefined') {
    Adapter = module.exports;
}

Adapter.VERSION = '0.0.1';

// Create new instance of the adapter.
Adapter.create = function(hub, callback) {
    new SubDurableAdapter(hub, callback);
};

// ## SubDurableAdapter
//
// - __hub:__ the hub
// - __callback:__ `function(err, adapter){}`
var SubDurableAdapter = function(hub, callback) {
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
            this.hub.connection.exchange(this.hub.options.channel, {type: 'topic', durable: true}, handle);
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

        var q = this.hub.connection.queue(this.hub.options.queueName || '', {durable: false, autoDelete: true}, function(queue) {

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

    };
    
})(SubDurableAdapter);