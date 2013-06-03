# Introduction

This project is inspirated by [squaremo](https://github.com/squaremo/rabbit.js).

Project goal is to provide a easy way to use rabbitMQ:

- publish/subscribe: pub sockets publish to a rendezvous point; all sub sockets connected to the rendezvous point receive the messages.
- publish/subscribe durable: pub sockets publish to a rendezvous point; all sub sockets connected to the rendezvous point receive the messages with an own queue.
- task/work: task sockets publish to a rendezvous point; all work sockets connected to the rendezvous point receive the messages with an same queue.

# Installation

    $ npm install rabbitmq-nodejs-client

# Pub/Sub usage

	var rabbitHub = require('rabbitmq-nodejs-client');

	var subHub = rabbitHub.create( { task: 'sub', channel: 'myChannel' } );
    subHub.on('connection', function(hub) {

        hub.on('message', function(msg) {
            console.log(msg);
        }.bind(this));

    });
    subHub.connect();

    var pubHub = rabbitHub.create( { task: 'pub', channel: 'myChannel' } );
    pubHub.on('connection', function(hub) {

        hub.send('Hello World!');

    });
    pubHub.connect();

# Task/Worker usage

    var rabbitHub = require('rabbitmq-nodejs-client');

    var taskHub = rabbitHub.create( { task: 'task', channel: 'myChannel' } );
    taskHub.on('connection', function(hub) {

      var i = 0;
      setInterval(function() {
        hub.send('Hello World! ' + i);
        i++;
      }, 1000);

    });
    taskHub.connect();

    //multiple instances of workers
    var rabbitHub = require('rabbitmq-nodejs-client');

    var workerHub = rabbitHub.create( { task: 'worker', channel: 'myChannel' } );
    workerHub.on('connection', function(hub) {

      hub.on('message', function(msg) {
        console.log(msg);

        setTimeout(function() {
          hub.ack();
        }, 2000);
      }.bind(this));

    });
    workerHub.connect();

## v0.1.0

- added new worker and task adapter


# License

Copyright (c) 2013 Adriano Raiano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.