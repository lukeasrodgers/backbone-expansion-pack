FilteredCollectionView = CollectionView.extend({
  initialize_child_views: function() {
    if (!this.filters || !this.filters.length) {
      CollectionView.prototype.initialize_child_views.call(this);
    }
    else {
      var grouped_active_filters = this.grouped_active_filters();
      var any_groups = _.keys(grouped_active_filters).length > 1 || !grouped_active_filters['undefined'];
      var logical_filter_relation;
      if (any_groups) {
        logical_filter_relation = _.any;
      }
      else {
        logical_filter_relation = _.all;
      }
      this.child_views = this.collection.
        select(function(model) {
          return this.filter(model, grouped_active_filters, logical_filter_relation);
        }, this).
        map(function(model) {
          return this.new_child_view(model);
        }, this);
      this.trigger('after:initialize_child_views');
    }
  },
  /**
   * This is still pretty slow.
   * @param {Backbone.Model}
   * @param {Object} grouped_active_filters
   * @param {Function} logical_filter_relation
   */
  filter: function(model, grouped_active_filters, logical_filter_relation) {
    return _.reduce(grouped_active_filters, function(acc, filter_group) {
      return acc && logical_filter_relation(filter_group, function(filter) {
        return filter.fn(model);
      });
    }, true);
  },
  grouped_active_filters: function() {
    return _.chain(this.filters).
      select(function(filter) {
        return filter.active;
      }).
      groupBy('group_name').value();
  },
  /**
   * @param {Object=} opts
   */
  clear_filters: function(opts) {
    // deactivate the filter
    _(this.filters).each(function(filter) {
      if (!opts || (opts && filter.name !== opts.except)) {
        filter.active = false;
      }
    });
    this.reset();
  },
  /**
   * @param {string|Function} filter name of filter, or filter function
   */
  activate_filter: function(filter) {
    filter = this.find_filter(filter);
    filter.active = true;
    this.reset();
  },
  /**
   * @param {string|Function} filter name of filter, or filter function
   */
  deactivate_filter: function(filter) {
    filter = this.find_filter(filter);
    filter.active = false;
    this.reset();
  },
  /**
   * @param {string|Function} filter name of filter, or filter function
   */
  add_filter: function(filter) {
    this.filters.push(filter);
    this.reset();
  },
  /**
   * @param {string|Function} filter name of filter, or filter function
   */
  remove_filter: function(filter) {
    filter = this.find_filter(filter);
    this.filters = _(this.filters).without(filter);
    this.reset();
  },
  /**
   * @param {Function|string} filter name of filter, or filter function
   */
  find_filter: function(filter) {
    return _(this.filters).detect(function(f) {
      return (_.isFunction(filter)) ? f.fn === filter : f.name === filter;
    });
  }
});
