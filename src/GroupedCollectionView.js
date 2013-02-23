GroupedCollectionView = CollectionView.extend({
  initialize: function() {
    CollectionView.prototype.initialize.apply(this, arguments);
    this.grouped_child_views = [];
    this.on('after_initialize_child_views', this.group_child_views);
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
      $(this.el).html(JST[this.template](this.collection));
      _.each(this.grouped_child_views, function(group, index) {
        console.log('group', group);
        // this.append(child_view.view);
      }, this);
      this.rendered = true;
      return this;
    }
  },
  reset: function() {
    this.grouped_child_views.length = 0;
    CollectionView.prototype.reset.apply(this, arguments);
  }
});
