var Adapter;

if (typeof module.exports !== 'undefined') {
    Adapter = module.exports;
}

Adapter.VERSION = '0.0.1';

Adapter.create = function(hub, callback) {
    new SubAdapter(hub, callback);
};

var SubAdapter = function(hub, callback) {
    this.hub = hub;
    this._init(callback);
};

// Inherit prototyp and extend it.
(function(S) {

    var P = S.prototype;
    
    P._init = function(callback) {
        
        var self = this;

        var handle = function(exchange) {
            self._openCallback(exchange);
            callback(null, self);
        };

        if (!this.hub.options.channel){
            this.hub.connection.exchange('amq.fanout', {passive: true}, handle);
        } else {
            this.hub.connection.exchange(this.hub.options.channel, {type: 'fanout'}, handle);
        }

    };

    P._openCallback = function(exchange) {
        
        var q = hub.connection.queue('', {durable:false}, function() {

            queue.subscribe(function(msg) {
                hub.send(msg.data.toString());
            });

            queue.bind(exchange.name, '');

        });

        hub.on('close', function() {
            q.destroy();
        });

    };
    
})(SubAdapter);