GroupedCollectionView = CollectionView.extend({
  group_header_template: '<li class="grouped-collectionview-header"><%= name %><ul id="<%= id %>"></ul></li>',
  initialize: function(options) {
    this.grouped_child_views = [];
    this.on('after_initialize_child_views', this.group_if_active, this);
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
      if (this.grouping_active()) {
        this.clear_grouping(group);
      }
      else {
        this.group_child_views(group);
      }
    }
    else {
      this.group_child_views(group);
    }
    this.render();
  },
  grouped_render: function() {
    $(this.el).html(JST[this.template](this.collection));
    _.each(this.grouped_child_views, function(group) {
      var group_css_id_selector = this.append_group_header(group);
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
    this.clear_grouping(active_group);
    CollectionView.prototype.reset.apply(this, arguments);
  },
  /**
   * @param {Array.<Object>} group
   * @return {string} group id css selector
   */
  append_group_header: function(group) {
    var tpl = _.template(this.group_header_template);
    var group_css_id_selector = this.css_id_selector_for_group(group);
    this.$(this.list_selector).append(tpl({
      name: this.name_for_group(group),
      id: group_css_id_selector.substr(1)
    }));
    return group_css_id_selector;
  },
  append_to_group: function(group_css_id_selector, view) {
    this.$(group_css_id_selector).append(view.render().el);
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
  css_id_selector_for_group: function(group) {
    return '#' + _.uniqueId(this.name_for_group(group).replace(/\s/g, '-').toLowerCase().replace(/[():\+\.]/g,'') + '-');
  },
  /**
   * @param {string} group_name
   */
  find_group: function(group_name) {
    return _(this.groups).detect(function(g) { return g.name === group_name; });
  }
});
