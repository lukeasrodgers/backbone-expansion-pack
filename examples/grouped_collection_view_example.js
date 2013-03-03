(function(exports) {

  var collection = new Backbone.Collection([
    {
      id: 0,
      name: 'ghost',
      scariness: 'really',
      real: true
    },
    {
      id: 1,
      name: 'vampire',
      scariness: 'sorta',
      real: false
    },
    {
      id: 2,
      name: 'mummy',
      scariness: 'not so much',
      real: true
    },
    {
      id: 3,
      name: 'frank einstein',
      scariness: 'sorta',
      real: false
    },
    {
      id: 4,
      name: 'werewolf',
      scariness: 'pretty',
      real: true
    },
    {
      id: 5,
      name: 'president palin',
      scariness: 'really',
      real: true
    }
  ]);
  JST = {};
  JST.child_tpl = _.template('<%= name %>: <%= scariness %> scary, <% if (real) { %> and <% } else { %> but not <% } %> real.');
  var MyModelView = ModelView.extend({
    tagName: 'li',
    template: 'child_tpl'
  });

  JST.coll_tpl = _.template('<ul id="list"></ul>');
  var MyColView = GroupedCollectionView.extend({
    template: 'coll_tpl',
    list_selector: '#list',
    child_view_constructor: MyModelView,
    groups: [
      {
        name: 'scariness',
        update_grouping: function(changes) {
          return changes.scariness;
        },
        fn: function(child_view) {
          return child_view.view.model.get('scariness');
        },
        active: false
      },
      {
        name: 'reality',
        update_grouping: function(changes) {
          return changes.real;
        },
        fn: function(child_view) {
          return child_view.view.model.get('real');
        },
        active: false
      }
    ]
  });

  JST.grouper_tpl = _.template([
     '<ul>',
       '<li class="<%= scariness_group_active %>"><a href="#" class="group" data-group-name="scariness">Scariness</a></li>',
       '<li class="<%= reality_group_active %>"><a href="#" class="group" data-group-name="reality">Is it real?</a></li>',
     '</ul>'
  ].join(''));

  var MyGrouperView = GrouperView.extend({
    template: 'grouper_tpl'
  });

  var init = function() {
    var coll_view = new MyColView({
      collection: collection,
      el: '#grouped'
    });
    coll_view.render();
    var grouper_view = new MyGrouperView({
      grouped_view: coll_view,
      el: '#grouper'
    });
    grouper_view.render();
  };


  exports.init = init;

}(window));

$(document).ready(function() {
  window.init();
});
