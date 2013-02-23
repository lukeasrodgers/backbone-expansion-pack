GroupedCollectionView = CollectionView.extend({
  initialize: function(options) {
    this.grouped_child_views = [];
    this.on('after_initialize_child_views', this.group_child_views);
    CollectionView.prototype.initialize.apply(this, arguments);
  },
  group_child_views: function() {
    if (!this.group_fn) {
      this.grouped = false;
      return;
    }
    this.grouped_child_views.length = 0;
    this.grouped_child_views = _(this.child_views).groupBy(this.group_fn);
    this.grouped = true;
  },
  render: function() {
    if (!this.grouped) {
      return CollectionView.prototype.render.apply(this, arguments);
    }
    else {
      return this.grouped_render();
    }
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
  reset: function() {
    this.grouped_child_views.length = 0;
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
   * @param {Array.<Object>}
   */
  css_id_selector_for_group: function(group) {
    return '#' + this.name_for_group(group).replace(/\s/g, '-').toLowerCase().replace(/[:\+\.]/g,'');
  }
});
