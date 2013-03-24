CollectionView = BaseView.extend({
  initialize: function(options) {
    BaseView.prototype.initialize.apply(this, arguments);
    if (!this.child_view_constructor) {
      throw "no child view constructor provided: " + this.template;
    }
    if (!this.list_selector) {
      throw "no list selector provided"; 
    }

    this.initialize_child_views();
    this.collection.bind('reset', this.reset, this);
    this.collection.bind('add', this.add_child, this);
    this.collection.bind('remove', this.remove_child, this);
  },

  initialize_child_views: function() {
    this.child_views = this.collection.map(function(model) {
      return this.new_child_view(model);
    }, this);
    this.trigger('after:initialize_child_views');
  },

  new_child_view: function(model) {
    var view = new this.child_view_constructor({
      model: model,
      parentView: this
    });
    var entry = { view: view, rendered: false };
    return entry;
  },

  reset: function() {
    _(this.child_views).each(function(child_view) {
      child_view.view.remove();
    });
    this.child_views.length = 0;
    this.initialize_child_views();
    this.render();
  },

  append: function(view) {
    view.delegateEvents();
    this.$(this.list_selector).append(view.render().el);
  },

  prepend: function(view) {
    this.$(this.list_selector).prepend(view.render().el);
  },

  find_view: function(model) {
    return _.detect(this.child_views, function(child_view) { return child_view.view.model === model; });
  },

  render: function() {
    $(this.el).html(JST[this.template](this.collection));

    _.each(this.child_views, function(child_view, index) {
      this.append(child_view.view);
      child_view.rendered = true;
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
  },

  addNew: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.collection.add();
  },

  dispose: function() {
    _(this.child_views).each(function(child_view) {
      child_view.view.remove();
    });
    this.child_views = [];
    ModelView.prototype.dispose.call(this);
  },

  assign: function() {
    BaseView.prototype.assign.apply(this, arguments);
  }

});
