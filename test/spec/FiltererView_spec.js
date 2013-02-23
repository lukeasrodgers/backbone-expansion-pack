describe('Filterer', function() {
  beforeEach(function() {
    this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzz'}]);
    window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
    window.JST.filterer_tpl = _.template('<a href="#" class="filter" data-filter="id">Id filter</a><a href="#" class="filter" data-filter="buzz">Buzz Filter</a>');
    var constructor = FilteredCollectionView.extend({
      template: 'tpl',
      child_view_constructor: Backbone.View,
      list_selector: '#list',
      filters: [
        {
          name: 'id',
          fn: function(model) { return model.get('id') !== 2; },
          active: true
        },
        {
          name: 'buzz',
          fn: function(model) { return model.get('id') !== 3; },
          active: false
        }
      ]
    });
    $('body').append('<div id="renderer"><div id="filterer"></div></div>');
    this.filtered_view = new constructor({collection: this.collection});
    var filterer_constructor = Filterer.extend({
      el: '#filterer',
      template: 'filterer_tpl'
    });
    this.view = new filterer_constructor({
      filtered_view: this.filtered_view
    });
  });
  afterEach(function() {
    delete window.JST.tpl;
    delete window.JST.filterer_tpl;
    this.filtered_view.remove();
    this.view.remove();
    $('#renderer').remove();
  });
  describe('toggle_filter', function() {
    it('should deactivate an active filter', function() {
      expect(this.filtered_view.child_views.length).toBe(1);
      this.view.$('a:first').click();
      expect(this.filtered_view.child_views.length).toBe(2);
    });
    it('should activate a deactivated filter', function() {
      expect(this.filtered_view.child_views.length).toBe(1);
      this.view.$('a:first').click();
      expect(this.filtered_view.child_views.length).toBe(2);
      this.view.$('a:first').click();
      expect(this.filtered_view.child_views.length).toBe(1);
    });
    it('should clear filters if single_filter is true', function() {
      expect(this.filtered_view.child_views.length).toBe(1);
      this.view.$('a:last').click();
      expect(this.filtered_view.child_views.length).toBe(1);
    });
    it('should leave filters in place if single_filter is false', function() {
      this.view.single_filter = false;
      expect(this.filtered_view.child_views.length).toBe(1);
      this.view.$('a:last').click();
      expect(this.filtered_view.child_views.length).toBe(0);
    });
  });
  describe('initialize_child_views', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzz'}]);
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
    it('should trigger `after_initialize_child_views` event when done', function() {
      var constructor = CollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      var trigger_spy = spyOn(constructor.prototype, 'trigger');
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(trigger_spy).toHaveBeenCalledWith('after_initialize_child_views');
    });
  });
  describe('filter_active', function() {
    it('should be true if any filters are active', function() {
      expect(this.view.any_filters_active()).toBe(true);
    });
    it('should be false if all filters are inactive', function() {
      this.view.$('a:first').click();
      expect(this.view.any_filters_active()).toBe(false);
    });
  });
});
