Filterer = BaseView.extend({
  initialize: function(options) {
    if (this.filtered_view || !options.filtered_view) {
      throw new Error('Filterer view requires view to filter');
    }
    this.filtered_view = options.filtered_view;
    this.assigned_views = [];
    // default to single filtering
    this.single_filter = options.single_filter || true;
    this.on('after_filter', this.render);
    this.render();
  },
  events: {
    'click .filter': 'toggle_filter'
  },
  render: function() {
    var attrs = _(this.filtered_view.filters).reduce(function(acc, filter) {
      if (!_.isFunction(filter)) {
        acc[filter.name + '_filter_active'] = (filter.active) ? 'active' : '';
        return acc;
      }
    }, {});
    attrs.clear_filter_active = (!this.any_filters_active()) ? 'active' : '';
    this.$el.html(JST[this.template](attrs));
    return this;
  },
  toggle_filter: function(e) {
    e.preventDefault();
    var filter_name = $(e.target).data('filter');
    if (filter_name === 'clear') {
      this.clear_filters(filter_name);
      this.trigger('after_filter');
      return;
    }
    if (this.filter_active(filter_name)) {
      this.deactivate_filter(filter_name);
      this.trigger('after_filter');
      return;
    }
    else if (this.should_clear_filters(filter_name)) {
      this.clear_filters(filter_name);
    }
    this.activate_filter(filter_name);
    this.trigger('after_filter');
  },
  /**
   * @param {Function|string} filter filter function or name
   */
  find_filter: function(filter) {
    return this.filtered_view.find_filter(filter);
  },
  filter_active: function(filter) {
    filter = this.find_filter(filter);
    if (filter) {
      return filter.active;
    }
    else {
      return false;
    }
  },
  activate_filter: function(filter_name) {
    this.filtered_view.activate_filter(filter_name);
  },
  deactivate_filter: function(filter_name) {
    this.filtered_view.deactivate_filter(filter_name);
  },
  /**
   * Default behaviour is just to ignore filter_name and clear
   * @param {string} filter_name
   */
  clear_filters: function() {
    this.filtered_view.clear_filters();
  },
  any_filters_active: function() {
    return _(this.filtered_view.filters).any(function(filter) {
      return (_.isFunction(filter)) ? true : filter.active;
    });
  },
  /**
   * Override this method to get fancier filtering criteria.
   * @param {string} filter_name
   */
  should_clear_filters: function(filter_name) {
    return this.single_filter && this.any_filters_active();
  }
});