GrouperView = BaseView.extend({
  initialize: function(options) {
    options = options || {};
    if (this.grouped_view || !options.grouped_view) {
      throw new Error('Grouper view requires view to group');
    }
    this.grouped_view = options.grouped_view;
    this.on('after_toggle_group', this.render, this);
    BaseView.prototype.initialize.apply(this, arguments);
  },
  events: {
    'click .group': 'toggle_group'
  },
  render: function() {
    var attrs = _(this.grouped_view.groups).reduce(function(acc, group) {
      acc[group.name + '_group_active'] = (group.active) ? 'active' : '';
      return acc;
    }, {});
    this.$el.html(JST[this.template](attrs));
    return this;
  },
  toggle_group: function(e) {
    e.preventDefault();
    var group_name = $(e.currentTarget).data('groupName');
    this.grouped_view.toggle_group(group_name);
    this.trigger('after_toggle_group');
  }
});
