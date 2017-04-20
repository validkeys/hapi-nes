import Ember from 'ember';
import Nes from 'npm:nes/client';

export default Ember.Route.extend({

  model() {
    return Ember.$.getJSON('http://localhost:3000/teams/1/messages')
      .then(({messages}) => {
        return Ember.A(messages);
      });
  },

  activate() {
    var client = new Nes.Client('ws://localhost:3000');
    var self = this;
    client.connect(function(err) {
      if (err) {
        console.log("connection error", err);
      }
      function handler(msg) {
        console.info("RECEIVED", ...arguments);
        self.get('currentModel').pushObject(msg);
      }
      client.subscribe("/teams/1/messages", handler, function(err) {
        if (err) {
          console.log('error subscribing', err);
        }
      });
    });
  },

  actions: {
    newMessage() {
      const val = this.controller.get('newMessage');
      var self = this;
      return Ember.$.ajax({
        type: "POST",
        url: "http://localhost:3000/teams/1/messages",
        dataType: "json",
        contentType : 'application/json',
        data: JSON.stringify({message:{teamId: 1, text: val}}),
        success: function() {
          self.controller.set('newMessage','');
        }
      });
    }
  }


});
