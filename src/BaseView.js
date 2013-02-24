/**
 * `assign` inspired by http://ianstormtaylor.com/rendering-views-in-backbonejs-isnt-always-simple/
 * to meet these requirements:
 *   `render` should be idempotent
 *   the order of the DOM should be declared in templates, not javascript
 *   rendering twice shouldn’t trash views just to re-construct them again
 * Views that inherit from this should initialize sub views in `initialize`,
 * then call `assign` in `render`.
 * @constructor
 */
var BaseView = Backbone.View.extend({
  initialize: function() {
    if (!this.template) {
      throw new Error('No template provided');
    }
    this.assigned_views = [];
    this.setup_bindings();
    this.trigger('after:initialize');
  },
  /**
   * @return {Backbone.View}
   */
  render: function() {
    this.trigger('before:render');
		this.$el.html(JST[this.template]());
    this.trigger('html_ready');
    this.trigger('after:render');
    return this;
  },
  /**
   * @param {Backbone.View} view subview of this view
   * @param {string} selector
   * @param {Object=} options
   * @return {Backbone.View}
   */
  assign: function(view, selector, options) {
    view.setElement(this.$(selector)).render(options);
    if (!this.assigned_views) {
      this.assigned_views = [];
    }
    this.assigned_views.push(view);
    this.trigger('assigned_view');
    return this;
  },
  remove: function() {
    if (!this.trigger('before:remove')) {
      return;
    }
    this.dispose();
    _(this.assigned_views).each(function(assigned_view) {
      assigned_view.remove();
    });
    this.assigned_views.length = 0;
    this.$el.remove();
    this.trigger('after:remove');
    return this;
  },
  dispose: function() {
    this.undelegateEvents();
    this.teardown_bindings();
    if (this.model) this.model.off(null, null, this);
    if (this.collection) this.collection.off(null, null, this);
    return this;
  },
  /**
   * process bindings, e.g.:
   * bindings: { 'after:initialize': 'some_method'}
   */
  setup_bindings: function() {
    if (!this.bindings) {
      return;
    }
    var bindings = _.result(this, 'bindings');
    for (var binding in bindings) {
      if (bindings.hasOwnProperty(binding)) {
        this.on(binding, this[bindings[binding]], this);
      }
    }
  },
  teardown_bindings: function() {
    if (!this.bindings) {
      return;
    }
    var bindings = _.result(this, 'bindings');
    for (var binding in bindings) {
      if (bindings.hasOwnProperty(binding)) {
        this.off(binding, this[bindings[binding]], this);
      }
    }
  }
});
