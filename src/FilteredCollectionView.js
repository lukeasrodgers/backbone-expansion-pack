FilteredCollectionView = CollectionView.extend({
  initialize_child_views: function() {
    var that = this;
    this.child_views = this.collection.select(function(model) { return that.filter(model); }).map(function(model) {
      return this.new_child_view(model);
    }, this);
  },
  /**
   * @parm {Backbone.Model}
   */
  filter: function(model) {
    var fn;
    if (!this.filters || !this.filters.length) {
      return true;
    }
    else {
      return _.reduce(this.filters, function(acc, filter) {
        fn = _.isFunction(filter) ? filter : (filter.active) ? filter.fn : function() { return true; };
        return acc && fn(model);
      }, true);
    }
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
