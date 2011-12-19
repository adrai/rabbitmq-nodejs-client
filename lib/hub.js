var amqp = require('amqp')
  , EventEmitter = require('events').EventEmitter;
  
var Hub;

if (typeof module.exports !== 'undefined') {
    Hub = module.exports;
}

Hub.VERSION = '0.0.1';

Hub.create = function(options) {
    return new RabbitHub(options);
};

// This class represents a hub for RabbitMQ.
var RabbitHub = function(options) {
    
    // Call super class.
    EventEmitter.call(this);
    
    // Set options and load defaults if needed.
    this.options = options || {};
    
    this.host = this.options.host || 'localhost';
    this.port = this.options.port || 5672;
    this.protocol = this.options.protocol || 'amqp';
    this.login = this.options.login;
    this.password = this.options.password;
    this.vhost = this.options.vhost;
    this.task = this.options.task;

    this.url = this.protocol + '://';
    if (this.login && this.password) {
        this.url += this.login + ':' + this.password + '@';
    }
    this.url += this.host;
    if (this.port) {
        this.url += ':' + this.port;
    }
    if (this.vhost) {
        this.url += this.vhost;
    }

};

// Inherit prototyp and extend it.
(function(S) {
    var P = S.prototype = new EventEmitter();
    
    P.connect = function() {

        var self = this;

        this.connection = amqp.createConnection({url: this.url});

        this.connection.on('ready', function () {

            var destroyQueue = function(callback) {
                var q = self.connection.queue(queueName, {durable:true, 'autoDelete': false}, function(queue) {
                    queue.destroy();
                    if (callback) callback();
                });
            }

            var startAdapter = function() {
                var adapter = require('./adapters/' + self.task);
                adapter.create(self, function(err) {
                    if (err) {
                        
                    } else {
                        self.emit('connection', self);
                    }
                });
            };

            if (self.options.clean) {
                destroyQueue(startAdapter);
            } else {
                startAdapter();
            }

        });

    };

    P.send = function(msg, routingKey) {

        this.emit('message', msg, routingKey);

    };
    
    P.end = function(callback) {

        this.connection.end();
        this.connection = null;
        this.emit('close');

    };
    
})(RabbitHub);
