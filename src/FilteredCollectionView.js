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
   * TODO this is really slow. Does a bunch of stuff for each
   * model that actually only needs to happen once per filter.
   * @param {Backbone.Model}
   * @param {Object} grouped_active_filters
   * @param {Function} logical_filter_relation
   */
  filter: function(model, grouped_active_filters, logical_filter_relation) {
    var fn;
    return _.reduce(grouped_active_filters, function(acc, filter_group) {
      return acc && logical_filter_relation(filter_group, function(filter) {
        fn = _.isFunction(filter) ? filter : filter.fn;
        return fn(model);
      });
    }, true);
  },
  grouped_active_filters: function() {
    return _.chain(this.filters).
      select(function(filter) {
        return (_.isFunction(filter)) ? filter : filter.active;
      }).
      groupBy('group_name').value();
  },
  /**
   * @param {Object=} opts
   */
  clear_filters: function(opts) {
    // if we can, just deactivate the filter
    _(this.filters).each(function(filter) {
      if (!_.isFunction(filter)) {
        if (!opts || (opts && filter.name !== opts.except)) {
          filter.active = false;
        }
      }
    });
    // if it's a function, remove it
    this.filters = _(this.filters).reject(function(filter) { return _.isFunction(filter); });
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
      if (_.isFunction(f)) {
        return (_.isFunction(filter)) ? f === filter : f === filter.fn;
      }
      else {
        return (_.isFunction(filter)) ? f.fn === filter : f.name === filter;
      }
    });
  }
});
