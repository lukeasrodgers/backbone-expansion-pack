/**
 * Renders a collection, based on child_view_constructor property.
 * @constructor
 */
var CollectionView = Backbone.View.extend({
  initialize : function() {
    if (!this.template) {
      throw new Error('No template provided');
    }
    if (!this.child_view_constructor) {
      throw new Error('No child view constructor provided');
    }
    if (!this.list_selector) {
      throw new Error('No list selector provided');
    }
    this.views = [];
    this.collection.bind('reset', this.reset, this);
    this.collection.bind('add', this.add, this);
    this.collection.bind('remove', this.remove, this);
  },
  reset: function() {
    _(this.views).each(function(view) {
      view.remove();
    });
    this.views = [];
    this.render();
  },
  /**
   * @param {Backbone.View} view
   * @return {Backbone.View}
   */
  append: function(view) {
    this.$(this.list_selector).append(view.render().el);
    return this;
  },
  /**
   * @param {Backbone.View} view
   * @return {Backbone.View}
   */
	prepend: function(view) {
    this.$(this.list_selector).prepend(view.render().el);
    return this;
	},
  render: function() {
    $(this.el).html(JST[this.template](this.collection));
    var view;
    this.collection.each(function(model, i) {
      view = new this.child_view_constructor({
        model: model,
        parent_view: this
      });
      this.views.push(view);
      this.append(view);
    }, this);
    this.rendered = true;
    return this;
  },
  /**
   * @param {Backbone.Model} model
   */
  add: function(model) {
    var view = new this.child_view_constructor({
      model: model,
      parent_view: this
    });
    this.views.push(view);
    if (this.rendered) {
      this.append(view);
    }
  },
  /**
   * @param {Backbone.Model} model
   */
  remove: function(model) {
    var view_to_remove = _.detect(this.views, function(v) { return v.model === model; });
    this.views = _.without(this.views, view_to_remove);
    if (this.rendered && view_to_remove) {
      view_to_remove.remove();
    }
  }
});
