describe('OrderedCollectionView', function() {
  beforeEach(function() {
    this.collection = new Backbone.Collection();
    this.model = new Backbone.Model({id: 1});
    this.OrderedCollectionView = OrderedCollectionView.extend({
      child_view_constructor: Backbone.View.extend({render: function() { this.$el.html('foobar'); return this; }}),
      template: 'tpl',
      list_selector: '#list',
      order_by: 'id'
    });
    $('body').append('<div id="renderer" />');
    window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
  });
  afterEach(function() {
    if (this.view) {
      this.view.remove();
    }
    $('#renderer').remove();
    delete window.JST.tpl;
  });
  describe('insert', function() {
    it('should work if there is only one thing to insert', function() {
      var view = new this.OrderedCollectionView({
        collection: this.collection
      });
      view.render();
      this.collection.add(this.model);
      expect(view.$el.html()).toContain('foobar');
    });
  });
});

