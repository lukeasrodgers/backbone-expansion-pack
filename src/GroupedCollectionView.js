GroupedCollectionView = CollectionView.extend({
  group_header_template: '<li class="grouped-collectionview-header"><%= name %><ul id="<%= id %>"></ul></li>',
  initialize: function(options) {
    this.grouped_child_views = [];
    this.on('after:initialize_child_views', this.group_if_active, this);
    this.collection.on('change', this.maybe_adjust_grouping, this);
    this.grouped_view_map = {};
    CollectionView.prototype.initialize.apply(this, arguments);
  },
  group_if_active: function() {
    if (this.grouping_active()) {
      this.group_child_views();
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
    this.clear_grouping(group);
    this.grouped_child_views = _(this.child_views).groupBy(group.fn);
    group.active = true;
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
  toggle_group: function(group_name) {
    var group = this.find_group(group_name);
    if (group === this.active_group()) {
      this.clear_grouping(group);
    }
    else {
      this.group_child_views(group);
    }
    this.render();
  },
  grouped_render: function() {
    $(this.el).html(JST[this.template](this.collection));
    _.each(this.grouped_child_views, function(group, key) {
      var group_css_id_selector = this.append_group_header(group, key);
      _.each(group, function(child_view) {
        this.append_to_group(group_css_id_selector, child_view.view);
      }, this);
    }, this);
    this.rendered = true;
    return this;
  },
  clear_grouping: function(group) {
    this.grouped_child_views.length = 0;
    if (group) {
      group.active = false;
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
  append_group_header: function(group, key) {
    var tpl = _.template(this.group_header_template);
    var group_css_id_selector = this.generate_css_id_selector_for_group(group, key);
    this.$(this.list_selector).append(tpl({
      name: this.name_for_group(group),
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
   * @return {string}
   */
  name_for_group: function(group) {
    var active_group = this.active_group();
    var model = _(group).first().view.model;
    return active_group.name + '('+ group.length +')';
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
  generate_css_id_selector_for_group: function(group, key) {
    var id = '#' + _.uniqueId(this.name_for_group(group).replace(/\s/g, '-').toLowerCase().replace(/[():\+\.]/g,'') + '-');
    this.grouped_view_map[key] = id;
    return id;
  },
  get_css_id_selector_for_group: function(key) {
    return this.grouped_view_map[key];
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
      var target_group_key = this.determine_group_for_view(view);
      var group_css_id_selector = this.get_css_id_selector_for_group(target_group_key);
      this.append_to_group(group_css_id_selector, view);
    }
  },
  /**
   * Returns the result of applying grouping function to this view.
   * This is effectively the key of the appropriate group, which we can use
   * to retrieve its CSS selector. Note that this returns the group the view
   * *should* be in, not necessarily the one it currently *is* in.
   * @param {Backbone.View} view
   */
  determine_group_for_view: function(view) {
    return this.active_group().fn({view:view});
  },
  maybe_adjust_grouping: function(model, options) {
    if (!this.grouping_active()) {
      return;
    }
    var active_group = this.active_group();
    var changes = options.changes;
    if (active_group.update_grouping && active_group.update_grouping(changes)) {
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
    var grouped_child_view,
        containing_group_key;
    _(this.grouped_child_views).each(function(group, key) {
      var contains = _(group).detect(function(child_view) {
        return child_view.view.model === model;
      });
      if (contains) {
        containing_group_key = +key;
        grouped_child_view = contains;
      }
      return contains;
    });
    return {child_view: grouped_child_view, group_key: containing_group_key};
  },
  move_grouped_view: function(model) {
    // figure out what group model is in
    var current_grouping = this.find_grouping_for(model);
    var current_group_key = current_grouping.group_key;
    var grouped_view = current_grouping.child_view;
    // figure out what group it should be in
    var target_group_key = this.determine_group_for_view(grouped_view.view);
    // if they are not the same, move it
    if (current_group_key !== target_group_key) {
      this.grouped_child_views[current_group_key] = _(this.grouped_child_views[current_group_key]).without(grouped_view);
      this.grouped_child_views[target_group_key].push(grouped_view);
      var css_selector = this.get_css_id_selector_for_group(target_group_key);
      this.swap_to_group(css_selector, grouped_view.view);
    }
  }
});
