(function(exports) {

  var collection = new Backbone.Collection(window.data);
  JST = {};
  JST.child_tpl = _.template('<h3>id: <%= id %></h3><div>name: <%= name %></div><form class="foo"><input name="name" /><input class="submit_form" type="submit" /></form>');
  var MyModelView = SpeedyCollectionModelView.extend({
    template: 'child_tpl',
    initialize: function() {
      SpeedyCollectionModelView.prototype.initialize.call(this);
      // TODO this won't work
      this.model.on('change', this.render, this);
    },
    proxied_events: {
      'click input.submit_form': 'click_submit',
      'click h3': 'click_input'
    },
    click_submit: function(e) {
      e.preventDefault();
      console.log('submitted', e);
    },
    click_input: function() {
      console.log('click h3');
    }
  });

  JST.coll_tpl = _.template('<ul id="list"></ul>');
  var MyColView = SpeedyCollectionView.extend({
    template: 'coll_tpl',
    list_selector: '#list',
    child_view_constructor: MyModelView,
    initialize: function() {
      SpeedyCollectionView.prototype.initialize.apply(this, arguments);
      var model_events = _.reduce(this.child_view_constructor.prototype.proxied_events, function(acc, v, k) {
        acc[k] = 'proxy_to_model';
        return acc;
      }, {});
      this.events = this.events || {};
      this.events = _.extend(this.events, model_events);
      console.log(this.events);
    }
  });

  var init = function() {
    var coll_view = new MyColView({
      collection: collection,
      el: '#coll_view'
    });
    coll_view.render();
  };


  exports.init = init;

}(window));

$(document).ready(function() {
  window.init();
});
