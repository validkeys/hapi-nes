var Hapi  = require('hapi');
var Nes   = require('nes');
var _ = require('lodash');

var server = new Hapi.Server();
server.connection({
  port: 3000,
  routes: {
    cors: true
  }
});

var DB = {
  messages: [
    { text: "first message", teamId: 1, id: _.uniqueId() }
  ]
};

server.register({
  register: Nes,
  options: {
    auth: false
  }
},function(err) {

  server.subscription('/teams/{teamId}/messages');

  server.route({
    method: "GET",
    path:   "/teams/{teamId}/messages",
    config: {
      handler: function(request, reply) {
        console.log(DB.messages);
        reply({
          messages: _.filter(DB.messages, function(message) {
            return parseInt(message.teamId) === parseInt(request.params.teamId);
          })
        });
      }
    }
  });


  server.route({
    method: "POST",
    path:   "/teams/{teamId}/messages",
    config: {
      handler: function(request, reply) {

        var payload = request.payload.message;
        payload.id = _.uniqueId();
        DB.messages.push(payload);
        server.publish("/teams/" + payload.teamId + "/messages", payload);
        reply({
          message: payload
        });
      }
    }
  });

  server.start(function(err) {
    console.log("Server Started......");
    server.broadcast('Real time server started!');
  });

});
