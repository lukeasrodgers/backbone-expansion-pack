(function(exports) {

  var collection = new Backbone.Collection([
    {
      id: 0,
      name: 'ghost',
      scariness: 'really',
      real: 'yes',
      killable: false
    },
    {
      id: 1,
      name: 'vampire',
      scariness: 'sorta',
      real: 'no',
      killable: true
    },
    {
      id: 2,
      name: 'mummy',
      scariness: 'not so much',
      real: 'yes',
      killable: true
    },
    {
      id: 3,
      name: 'frank einstein',
      scariness: 'sorta',
      real: 'no',
      killable: false
    },
    {
      id: 4,
      name: 'werewolf',
      scariness: 'pretty',
      real: 'yes',
      killable: true
    },
    {
      id: 5,
      name: 'godzilla',
      scariness: 'not so much',
      real: 'no',
      killable: false
    },
    {
      id: 6,
      name: 'zombie',
      scariness: 'pretty',
      real: 'yes',
      killabel: true
    }
  ]);
  JST = {};
  JST.child_tpl = _.template('<%= name %>: <%= scariness %> scary, <% if (real === "yes") { %> and <% } else { %> but not <% } %> real. <a href="#" class="toggle_reality">toggle reality</a>');
  var MyModelView = ModelView.extend({
    tagName: 'li',
    template: 'child_tpl',
    initialize: function() {
      ModelView.prototype.initialize.call(this);
      this.model.on('change', this.render, this);
    },
    events: {
      'click .toggle_reality': 'toggle_reality'
    },
    toggle_reality: function(e) {
      e.preventDefault();
      var real = this.model.get('real');
      real = (real === 'yes') ? 'no' : 'yes';
      this.model.set('real', real);
    }
  });

  JST.coll_tpl = _.template('<ul id="list"></ul>');
  var MyColView = FilteredCollectionView.extend({
    template: 'coll_tpl',
    list_selector: '#list',
    child_view_constructor: MyModelView,
    filters: [
      {
        name: 'really_scary',
        group_name: 'scariness',
        fn: function(model) {
          return model.get('scariness') === 'really';
        },
        active: false
      },
      {
        name: 'pretty_scary',
        group_name: 'scariness',
        fn: function(model) {
          return model.get('scariness') === 'pretty';
        },
        active: false
      },
      {
        name: 'sorta_scary',
        group_name: 'scariness',
        fn: function(model) {
          return model.get('scariness') === 'sorta';
        },
        active: false
      },
      {
        name: 'not_so_scary',
        group_name: 'scariness',
        fn: function(model) {
          return model.get('scariness') === 'not so much';
        },
        active: false
      },
      {
        name: 'real',
        group_name: 'reality',
        fn: function(model) {
          return model.get('real') === 'yes';
        },
        active: false
      },
      {
        name: 'not_real',
        group_name: 'reality',
        fn: function(model) {
          return model.get('real') === 'no';
        },
        active: false
      }
    ]
  });

  JST.filterer_tpl = _.template([
     '<ul>',
       '<li class="<%= really_scary_filter_active %>"><a href="#" class="filter" data-filter-name="really_scary">Really Scary</a></li>',
       '<li class="<%= pretty_scary_filter_active %>"><a href="#" class="filter" data-filter-name="pretty_scary">Pretty Scary</a></li>',
       '<li class="<%= sorta_scary_filter_active %>"><a href="#" class="filter" data-filter-name="sorta_scary">Sorta Scary</a></li>',
       '<li class="<%= not_so_scary_filter_active %>"><a href="#" class="filter" data-filter-name="not_so_scary">Not So Scary</a></li>',
     '</ul>',
     '<ul>',
       '<li class="<%= real_filter_active %>"><a href="#" class="filter" data-filter-name="real">Real</a></li>',
       '<li class="<%= not_real_filter_active %>"><a href="#" class="filter" data-filter-name="not_real">Not Real</a></li>',
     '</ul>'
  ].join(''));

  var MyFiltererView = Filterer.extend({
    template: 'filterer_tpl'
  });

  var init = function() {
    var coll_view = new MyColView({
      collection: collection,
      el: '#filtered'
    });
    coll_view.render();
    var filterer_view = new MyFiltererView({
      filtered_view: coll_view,
      el: '#filterer'
    });
    filterer_view.render();
  };


  exports.init = init;

}(window));

$(document).ready(function() {
  window.init();
});
