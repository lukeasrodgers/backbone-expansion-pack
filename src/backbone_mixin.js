/**
 * Allows for code to be mixed into Backbone components in cases
 * where using inheritance would be awkward or suboptimal.
 * Inspired by http://open.bekk.no/mixins-in-backbone/
 * `view_mixin` goes beyond normal `mixin` by copying over `events`
 * and wrapping view#render.
 *
 * Use thus:
 * var MyModel = Backbone.Model.extend({
 *   ...
 * });
 * var MyMixin = {
 *   some_method: function() {}
 * };
 * MyModel.mixin(MyMixin);
 * Now can call `some_method` on instantiated MyModels.
 */
(function() {
  var Utils = {},
      slice = Array.prototype.slice;

  Utils.mixin = function(from) {
    var to = this.prototype;
    _.defaults(to, from);
    Utils.extend_method(to, from, 'initialize');
    return to;
  };

  Utils.view_mixin = _.wrap(Utils.mixin, function(func, from) {
    var to = func(from);
    _.defaults(to.events, from.events);
    Utils.extend_method(to, from, 'render');
    return to;
  });

  // Helper method to extend an already existing method
  Utils.extend_method = function(to, from, method_name) {
    if (!_.isUndefined(from[method_name])) {
      var old = to[method_name];
      to[method_name] = _.wrap(old, function(func) {
        var args = slice.call(arguments, 1),
            old_return = func.apply(this, args);
        from[method_name].apply(this, args);
        return old_return;
      }, this);
    }
  };
  Backbone.View.mixin = Utils.view_mixin;
  Backbone.Model.mixin = Utils.mixin;
  Backbone.Collection.mixin = Utils.mixin;
}());
