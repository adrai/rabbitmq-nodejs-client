var rabbitHub = require('../lib/hub');

var subHub = rabbitHub.create( { task: 'sub', channel: 'myChannel' } );
subHub.on('connection', function(hub) {

  hub.on('message', function(msg) {
    console.log(msg);
  }.bind(this));

});
subHub.connect();