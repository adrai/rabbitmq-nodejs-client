var rabbitHub = require('../lib/hub');

var taskHub = rabbitHub.create( { task: 'task', channel: 'myChannel' } );
taskHub.on('connection', function(hub) {

  var i = 0;
  setInterval(function() {
    hub.send('Hello World! ' + i);
    i++;
  }, 1000);

});
taskHub.connect();