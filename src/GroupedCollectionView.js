GroupedCollectionView = CollectionView.extend({
  initialize: function(options) {
    this.grouped_child_views = [];
    this.on('after_initialize_child_views', this.group_child_views);
    CollectionView.prototype.initialize.apply(this, arguments);
  },
  /**
   * @param {Object|string} group either a {name: string, fn: Function} object or
   * a {string} name of the group
   */
  group_child_views: function(group) {
    if (!group && !this.groups) {
      this.grouped = false;
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
    this.clear_grouping();
    this.grouped_child_views = _(this.child_views).groupBy(group.fn);
    this.grouped = true;
    this.active_group = group;
  },
  render: function() {
    if (!this.grouped) {
      return CollectionView.prototype.render.apply(this, arguments);
    }
    else {
      return this.grouped_render();
    }
  },
  toggle_grouping: function(group_name) {
    var group = this.find_group(group_name);
    if (group === this.active_group) {
      this.grouped = !this.grouped;
      if (!this.grouped) {
        this.clear_grouping();
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
  clear_grouping: function() {
    this.active_group = null;
    this.grouped_child_views.length = 0;
  },
  reset: function() {
    this.clear_grouping();
    CollectionView.prototype.reset.apply(this, arguments);
  },
  /**
   * @param {Array.<Object>} group
   * @return {string} group id css selector
   */
  append_group_header: function(group) {
    var tpl = _.template('<li class="grouped-collectionview-header"><%= name %><ul id="<%= id %>"></ul></li>');
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
   * @interface
   */
  name_for_group: function(group) {},
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
    return '#' + this.name_for_group(group).replace(/\s/g, '-').toLowerCase().replace(/[:\+\.]/g,'');
  },
  /**
   * @param {string} group_name
   */
  find_group: function(group_name) {
    return _(this.groups).detect(function(g) { return g.name === group_name; });
  }
});
