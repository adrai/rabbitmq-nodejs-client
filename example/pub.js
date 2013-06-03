var rabbitHub = require('../lib/hub');

var pubHub = rabbitHub.create( { task: 'pub', channel: 'myChannel' } );
pubHub.on('connection', function(hub) {

  hub.send('Hello World!');

});
pubHub.connect();