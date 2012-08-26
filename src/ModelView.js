/**
 * @constructor
 */
var ModelView = BaseView.extend({
	initialize: function() {
    BaseView.prototype.initialize.apply(this, arguments);
    if (!this.model) {
      throw new Error('No model provided');
    }
	},
  /**
   * @return {Backbone.View}
   */
	render: function() {
		this.$el.html(JST[this.template](this.model.toJSON()));
		return this;
	}
});
