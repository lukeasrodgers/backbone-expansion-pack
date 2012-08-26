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
  },
  /**
   * @return {Backbone.View}
   */
  render: function() {
		this.$el.html(JST[this.template]());
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
    return this;
  }
});
