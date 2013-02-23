SpeedyCollectionView = CollectionView.extend({

  reset: function() {
    _(this.child_views).each(function(child_view) {
      child_view.view.remove();
    });
    this.child_views.length = 0;
    this.initialize_child_views();
    this.render();
  },

  append: function(view) {
    // not sure this call to delegateEvents is necessary
    view.delegateEvents();
    this.$(this.list_selector).append(view.render().el);
  },

	prepend: function(view) {
    this.$(this.list_selector).prepend(view.render().el);
  },

  render: function() {
    $(this.el).html(JST[this.template](this.collection));
    var html = _.reduce(this.child_views, function(child_view, index) {
      
    });
    var html = '';
    _.each(this.child_views, function(child_view, index) {
      this.append(child_view.view);
    }, this);

    this.rendered = true;
    return this;
  },

  reverse_render: function(reverser) {
    $(this.el).html(JST[this.template](this.collection));
    _.each(this.child_views, function(child_view, index) {
      this.prepend(child_view.view);
    }, this);
    this.rendered = true;
    return this;
  },

  add_child: function(model) {
    var destroyed = model.get('_destroy');
    if(destroyed) {
      return;
    }
    var child_view = this.new_child_view(model);
    this.child_views.push(child_view);
    if (this.rendered) {
      this.append(child_view.view);
    }
  },

  remove_child: function(model) {
    var viewToRemove = this.find_view(model);
    this.child_views = _.without(this.child_views, viewToRemove);
    if (this.rendered && viewToRemove) {
      viewToRemove.view.remove();
    }
  }

});
