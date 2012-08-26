/**
 * `change` event of elements with `change-aware` class will
 * automatically set value on model. Default is to do silent set,
 * which can be overridden using data-silent-set="false" attribute.
 * @constructor
 */
var ModelEditView = ModelView.extend({
  events: {
    'change .change-aware': 'model_change'
  },
	initialize: function() {
    if (!this.template) {
        throw new Error('No template provided');
    }
    if (!this.model) {
        throw new Error('No model provided');
    }
	},
  /**
   * @param {Event} e
   */
  model_change: function(e) {
		var $el = $(e.target),
			name = $el.attr('name'),
			value = $el.val(),
			is_silent_set = $el.attr('data-silent-set'),
			options = {silent: true},
			obj = {};
		if (is_silent_set === 'false') { // do silent set by default
			options.silent = false;
		}
		obj[name] = value;
		this.model.set(obj, options);
	}
});
