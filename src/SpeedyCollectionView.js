SpeedyCollectionView = CollectionView.extend({

  reset: function() {
    this.child_views.length = 0;
    this.initialize_child_views();
    this.render();
  },

  append: function(view) {
    this.$(this.list_selector).append(view.template_html());
  },

	prepend: function(view) {
    this.$(this.list_selector).prepend(view.template_html());
  },

  render: function() {
    $(this.el).html(JST[this.template](this.collection));
    var html = _.reduce(this.child_views, function(acc, child_view) {
      return acc + child_view.view.template_html();
    }, '', this);
    this.$(this.list_selector).html(html);
    this.rendered = true;
    return this;
  },

  reverse_render: function(reverser) {
    $(this.el).html(JST[this.template](this.collection));
    var html = _.reduceRight(this.child_views, function(child_view, index) {
      return child_view.view.template_html();
    });
    this.$(this.list_selector).html(html);
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
  },

  view_by_id: function(id) {
    return _(this.child_views).detect(function(child_view) {
      return child_view.view.id === id;
    });
  },

  view_for_event: function(e) {
    var id = $(e.currentTarget).closest('.speedy-model-view').get(0).id;
    var child_view = this.view_by_id(id);
    return child_view.view;
  },

  proxy_to_model: function(e) {
    var view = this.view_for_event(e);
    var target_class_name = e.target.className;
    var event_name = e.type + '_' + e.target.localName + '.' + target_class_name;
    console.log('proxy', event_name, e);
    view.trigger(event_name, e);
  }

});
