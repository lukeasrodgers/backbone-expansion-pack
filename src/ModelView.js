/**
 * @constructor
*/
ModelView = BaseView.extend({
  initialize: function() {
    if (!this.template) {
      throw new Error('No template provided');
    }
    if (!this.model) {
      throw new Error('No model provided');
    }
    this.assigned_views = [];
  },
  render: function() {
    this.$el.html(JST[this.template](_.clone(this.model.attributes)));
    return this;
  }
});
