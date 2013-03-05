GroupedCollectionView = CollectionView.extend({
  group_header_template: '<li class="grouped-collectionview-header"><%= name %><ul id="<%= id %>"></ul></li>',
  initialize: function(options) {
    this.grouped_child_views = {};
    this.on('after:initialize_child_views', this.group_if_active, this);
    this.collection.on('change', this.maybe_adjust_grouping, this);
    this.grouped_view_map = {};
    this.applied_groups = [];
    this.multi_grouping = options.multi_grouping || this.multi_grouping || true;
    CollectionView.prototype.initialize.apply(this, arguments);
  },
  group_if_active: function() {
    if (this.grouping_active()) {
      this.applied_groups.length = 0;
      _.each(this.active_groups(), function(group) {
        this.grouped_child_views = this.apply_grouping(group, this.child_views);
      }, this);
    }
  },
  /**
   * @param {Object|string} group either a {name: string, fn: Function} object or
   * a {string} name of the group
   */
  group_child_views: function(group) {
    if (!group && !this.groups) {
      return;
    }
    else {
      if (typeof group === 'string') {
        group = this.find_group(group);
      }
      else {
        group = this.groups[0];
      }
    }
    if (!this.multi_grouping) {
      this.clear_grouping(group);
    }

    if (_.keys(this.grouped_child_views).length) {
      this.grouped_child_views = this.apply_grouping(group, this.grouped_child_views);
    }
    else {
      this.grouped_child_views = this.apply_grouping(group, this.child_views);
    }
    group.active = true;
  },
  apply_grouping: function(group, child_views) {
    if (this.already_grouped(child_views)) {
      return _.reduce(child_views, function(acc, sub_child, key) {
        acc[key] = this.apply_grouping(group, sub_child);
        return acc;
      }, {}, this);
    }
    else {
      if (!_(this.applied_groups).any(function(g) { return g.name === group.name; })) {
        this.applied_groups.push(group);
      }
      return _(child_views).groupBy(group.fn);
    }
  },
  already_grouped: function(x) {
    return _.isArray(_(x).values()[0]);
  },
  grouping_active: function() {
    if (!this.groups || !this.groups.length) {
      return false;
    }
    else {
      return _(this.groups).any(function(group) {
        return group.active;
      });
    }
  },
  render: function() {
    if (!this.grouping_active()) {
      return CollectionView.prototype.render.apply(this, arguments);
    }
    else {
      return this.grouped_render();
    }
  },
  active_group: function() {
    return _(this.groups).detect(function(group) {
      return group.active;
    });
  },
  active_groups: function() {
    return _(this.groups).select(function(group) {
      return group.active;
    });
  },
  toggle_group: function(group_name) {
    var group = this.find_group(group_name);
    if (group.active) {
      this.applied_groups = _(this.applied_groups).without(group);
      this.clear_grouping(group);
    }
    else {
      this.group_child_views(group_name);
    }
    this.render();
  },
  grouped_render: function() {
    $(this.el).html(JST[this.template](this.collection));
    _.each(this.grouped_child_views, function(group, key) {
      this.recursive_grouped_rendering(group, [key]);
    }, this);
    this.rendered = true;
    return this;
  },
  recursive_grouped_rendering: function(group, key, parent_group_css_id_selector) {
    if (this.already_grouped(group)) {
      _.each(group, function(subgroup, subkey) {
        var new_keys = key.concat(subkey);
        var group_css_id_selector = this.append_group_header(group, new_keys, parent_group_css_id_selector);
        this.recursive_grouped_rendering(subgroup, new_keys, group_css_id_selector);
      }, this);
    }
    else {
      var group_css_id_selector = this.append_group_header(group, key, parent_group_css_id_selector);
      _.each(group, function(child_view) {
        this.append_to_group(group_css_id_selector, child_view.view);
      }, this);
    }
  },
  clear_grouping: function(group) {
    if (group) {
      group.active = false;
    }
    this.grouped_child_views = {};
    if (this.grouping_active()) {
      this.applied_groups.lengh = 0;
      _.each(this.applied_groups, function(group) {
        this.grouped_child_views = this.apply_grouping(group, this.child_views);
      }, this);
    }
  },
  reset: function() {
    var active_group = this.active_group();
    this.grouped_view_map = {};
    this.clear_grouping(active_group);
    CollectionView.prototype.reset.apply(this, arguments);
  },
  /**
   * @param {Array.<Object>} group
   * @return {string} group id css selector
   */
  append_group_header: function(group, keys, parent_group_css_id_selector) {
    var tpl = _.template(this.group_header_template);
    var group_css_id_selector = this.generate_css_id_selector_for_group(group, keys, parent_group_css_id_selector);
    var selector = (parent_group_css_id_selector) ? parent_group_css_id_selector : this.list_selector;
    this.$(selector).append(tpl({
      name: this.name_for_group(group, keys, parent_group_css_id_selector),
      id: group_css_id_selector.substr(1)
    }));
    return group_css_id_selector;
  },
  append_to_group: function(group_css_id_selector, view) {
    view.delegateEvents();
    this.$(group_css_id_selector).append(view.render().el);
  },
  swap_to_group: function(group_css_id_selector, view) {
    var $el = view.$el.detach();
    this.$(group_css_id_selector).append($el);
  },
  /**
   * Provides a sane default, but you will probably want to override
   * this method.
   * @param {Object} group
   * @param {Array} keys
   * @return {string}
   */
  name_for_group: function(group, keys, parent_group_css_id_selector) {
    var len = (group.length !== undefined) ? group.length : _.keys(group).length;
    return keys.join('_') + '('+ len +')';
  },
  /**
   * css id selector to target a group
   * some simple transformations:
   * switch whitespace to hyphen, remove some punctuation, toLowerCase()
   * e.g 'namE for group: id' => 'name-for-group-1'
   * override at will, just make sure it returns a string of form '#...'
   * @param {Array.<Object>}
   * @return {string}
   */
  generate_css_id_selector_for_group: function(group, keys, parent_g) {
    var id = '#' + _.uniqueId(this.name_for_group(group, keys, parent_g).replace(/\s/g, '-').toLowerCase().replace(/[():\+\.]/g,'') + '-');
    this.grouped_view_map[keys.join('_')] = id;
    return id;
  },
  get_css_id_selector_for_group: function(keys) {
    return this.grouped_view_map[keys.join('_')];
  },
  /**
   * @param {string} group_name
   */
  find_group: function(group_name) {
    return _(this.groups).detect(function(g) { return g.name === group_name; });
  },
  append: function(view) {
    if (!this.grouping_active()) {
      CollectionView.prototype.append.apply(this, arguments);
    }
    else {
      var target_group_keys = this.determine_groups_for_view(view);
      var group_css_id_selector = this.get_css_id_selector_for_group(target_group_keys);
      this.append_to_group(group_css_id_selector, view);
    }
  },
  /**
   * Returns the result of applying active grouping function to this view.
   * This is effectively the keys of the appropriate groups, which we can use
   * to retrieve the right CSS selector. Note that this returns the groups the view
   * *should* be in, not necessarily the ones it currently *is* in.
   * @param {Backbone.View} view
   * @return {Array}
   */
  determine_groups_for_view: function(view) {
    return _(this.applied_groups).reduce(function(acc, group) {
      return acc.concat(group.fn({view:view}));
    }, [], this);
  },
  /**
   * @param {Backbone.Model}
   * @param {Object} options
   */
  maybe_adjust_grouping: function(model, options) {
    if (!this.grouping_active()) {
      return;
    }
    var changes = options.changes;
    var should_move = _(this.applied_groups).any(function(active_group) {
      return active_group.update_grouping && active_group.update_grouping(changes);
    });
    if (should_move) {
      this.move_grouped_view(model);
    }
  },
  /**
   * Will return the child_view and current containing group
   * for a given model. Note that this returns the group the view
   * is *actually* in, not necessarily the group it *should* be in.
   * TODO make this faster
   * @param {Backbone.Moel}
   */
  find_grouping_for: function(model) {
    var grouped_child_view;
    _(this.grouped_child_views).each(function(group, key) {
      var contains = this.recursive_group_finding(model, group, [key]);
      if (contains) {
        containing_group_keys = contains.group_keys;
        grouped_child_view = contains.child_view;
      }
      return contains;
    }, this);
    return {child_view: grouped_child_view, group_keys: containing_group_keys};
  },
  /**
   * TODO this use of _.reduce is inefficient
   * @param {Backbone.Model} model
   * @param {Object} group
   * @param {Array} keys
   * @return {{child_view: Object, group_keys: Array}}
   */
  recursive_group_finding: function(model, group, keys) {
    if (this.already_grouped(group)) {
      return _(group).reduce(function(acc, sub_group, k) {
        var tracked_keys = keys.concat(k);
        var found = this.recursive_group_finding(model, sub_group, tracked_keys);
        if (found) {
          return found;
        }
        else {
          return acc;
        }
      }, undefined, this);
    }
    else {
      var contains = _(group).detect(function(child_view) {
        return child_view.view.model === model;
      });
      if (contains) {
        return {
          child_view: contains,
          group_keys: keys
        };
      }
    }
  },
  /**
   * @param {Backbone.Model} model
   */
  move_grouped_view: function(model) {
    // figure out what groups view for this model model is in
    var current_grouping = this.find_grouping_for(model),
        current_group_keys = current_grouping.group_keys,
        grouped_view = current_grouping.child_view;
    // figure out what groups it should be in
    var target_group_keys = this.determine_groups_for_view(grouped_view.view);
    // if they are not the same, move it
    if (!_.isEqual(current_group_keys, target_group_keys)) {
      this.remove_view_from_current_grouping(grouped_view, current_group_keys);
      this.add_view_to_new_grouping(grouped_view, target_group_keys);
      var css_selector = this.get_css_id_selector_for_group(target_group_keys);
      this.swap_to_group(css_selector, grouped_view.view);
    }
  },
  /**
   * Generic method for descending through an object given
   * an array of correctly ordered for that object.
   * @param {Object} groups
   * @param {Array} keys
   * @return {Object}
   */
  find_by_keys: function(groups, keys) {
    var obj = groups;
    for (var k in keys) {
      obj = obj[keys[k]];
    }
    return obj;
  },
  remove_view_from_current_grouping: function(grouped_view, group_keys) {
    var group = this.find_by_keys(this.grouped_child_views, group_keys);
    var index = _(group).indexOf(grouped_view);
    group.splice(index, 1);
  },
  add_view_to_new_grouping: function(grouped_view, group_keys) {
    var new_child_view_group = this.find_by_keys(this.grouped_child_views, group_keys);
    new_child_view_group.push(grouped_view);
  }
});
