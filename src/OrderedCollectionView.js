/**
 * Requires an `order_by` property that is a string, which will be
 * used to ensure views are rendered in right sport vis-a-vis other
 * views. `order_by` would commonly just be `id` or `position`, etc.
 * @constructor
 */
var OrderedCollectionView = CollectionView.extend({
  initialize: function() {
    CollectionView.prototype.initialize.apply(this, arguments);
    if (!this.order_by || typeof this.order_by !== 'string') {
      throw new Error('no order_by provided for OrderedCollectionView, or not string');
    }
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
      this.insert(view, model.get(this.order_by));
    }
  },
  /**
   * If `after` is undefined, just prepend view, cuz it is the first.
   * TODO make this algorithm faster.
   * @param {Backbone.View} view_to_insert
   * @param {number} ordered_position
   */
  insert: function(view_to_insert, ordered_position) {
    var order_by = this.order_by;
    var after = _.chain(this.views).
      select(function(view) {
        return view.model.get(order_by) < ordered_position;
      }, this).
      max(function(view) {
        return view.model.get(order_by);
      }).value();
    if (after) {
      after.$el.after(view_to_insert.render().el);
    }
    else {
      this.prepend(view_to_insert);
    }
  }
});
