/**
 * @constructor
*/
SpeedyCollectionModelView = BaseView.extend({
  tagName: 'li',
  initialize: function() {
    if (!this.template) {
      throw new Error('No template provided');
    }
    if (!this.model) {
      throw new Error('No model provided');
    }
    this.assigned_views = [];
    this.id = _.uniqueId('speedy_view_');
  },
  template_html: function() {
    return '<' + this.tagName + ' class="speedy-model-view" id="'+ this.id +'">' + JST[this.template](_.clone(this.model.attributes)) + '</' + this.tagName + '>';
  }
});
