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
    this.bind_proxied_events();
  },
  template_html: function() {
    return '<' + this.tagName + ' class="speedy-model-view" id="'+ this.id +'">' + JST[this.template](_.clone(this.model.attributes)) + '</' + this.tagName + '>';
  },
  bind_proxied_events: function() {
    _.each(this.proxied_events, function(event, key) {
      key = key.replace(/\s/g, '_');
      this.on(key, function(e) {
        console.log('handle', arguments, 'event:', event, 'key:', key);
        this[event](e);
      }, this);
    }, this);
  }
});
