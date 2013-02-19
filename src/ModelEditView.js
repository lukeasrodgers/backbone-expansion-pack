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
  /**
   * @param {Event} e
   */
  model_change: function(e) {
		var $el = $(e.target),
			name = $el.attr('name'),
			value = $el.val(),
			isSilentSet = $el.attr('data-silent-set'),
      isCurrency = $el.attr('data-is-currency'),
			isNumber = $el.attr('data-is-number'),
			setValue = $el.attr('data-set-value'),
			shouldStripIdFromName = $el.attr('data-strip-id'),
			options = {silent: true},
			obj = {};

		if (isSilentSet === 'false' || this.silent_set === false) { // do silent set by default
			options.silent = false;
		}

		if (shouldStripIdFromName === 'true') { // will also strip cid
			name = name.replace(/_c?\d*/, '');
    }

    if (isCurrency === 'true') {
      value = Number(value.replace(/[\$,]/g, ''));
    }

    if (isNumber === 'true') {
      value = Number(value);
    }

    obj[name] = value;

    if (setValue) {
      if (setValue === 'boolean') {
        if ($el.is('input[type="checkbox"]')) {
					if ($el.get(0).checked) {
						obj[name] = true;
					}
					else {
						obj[name] = false;
					}
				}
			}
      else if (setValue === 'numerical_on_off') {
				if ($el.is('input[type="checkbox"]')) {
					if ($el.get(0).checked) {
            obj[name] = 1;
          }
          else {
            obj[name] = 0;
          }
        }
      }
			else {
				obj.value = value;
			}
		}

		this.model.set(obj, options);
	}
});
