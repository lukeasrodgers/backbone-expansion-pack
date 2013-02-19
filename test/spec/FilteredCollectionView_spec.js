describe('FilteredCollectionView', function() {
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
  describe('filtering', function() {
    it('should initialize all views if there are no filters', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(2);
    });
    it('should filter out views that do not match a single filter', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          function(model) { return false; }
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(0);
    });
    it('should filter out views that do not match any of multiple filters', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          function(model) { return model.get('id') !== 2; },
          function(model) { return model.get('fiz') === 'buzz'}
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(1);
    });
    it('should be able to handle an array of filters that are include filter names', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          {
            name: 'id',
            fn: function(model) { return model.get('id') !== 2; },
            active: true
          }
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(1);
    });
  });
  describe('clear_filters', function() {
    it('should clear all filtering', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          function(model) {return false},
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(0);
      this.view.clear_filters();
      expect(this.view.child_views.length).toBe(2);
    });
    it('should leave filters intact, but disable them if possible', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          {
            name: 'foo',
            fn: function(model) {return false},
            active: true
          }
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(0);
      this.view.clear_filters();
      expect(this.view.child_views.length).toBe(2);
      expect(this.view.filters.length).toBe(1);
    });
    it('should entirely destroy filters if they cannot be disabled, i.e. if they are just functions', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          function(model) {return false}
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(0);
      this.view.clear_filters();
      expect(this.view.child_views.length).toBe(2);
      expect(this.view.filters.length).toBe(0);
    });
    it('should should leave a filter active if it is passed the right args', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          {
            name: 'foo',
            fn: function(model) {return false},
            active: true
          }
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(0);
      this.view.clear_filters({except: 'foo'});
      expect(this.view.child_views.length).toBe(0);
    });
  });
  describe('add_filter', function() {
    it('should add a filter', function() {
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(2);
      this.view.add_filter(function(model) { return model.get('fiz') !== 'buzz';});
      expect(this.view.child_views.length).toBe(0);
    });
  });
  describe('remove_filter', function() {
    it('should be able to remove a filter by name', function() {
      var filter = {
        name: 'id',
        fn: function(model) { return model.get('id') !== 2; },
        active: true
      };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(1);
      this.view.remove_filter('id');
      expect(this.view.child_views.length).toBe(2);
    });
    it('should be able to remove a filter by name', function() {
      var filter = function(model) { return model.get('id') !== 2; };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(1);
      this.view.remove_filter(filter);
      expect(this.view.child_views.length).toBe(2);
    });
  });
  describe('find_filter', function() {
    it('should be able to find a filter by name', function() {
      var filter = {
        name: 'id',
        fn: function(model) { return model.get('id') !== 2; },
        active: true
      };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.find_filter('id')).toBe(filter);
    });
    it('should be able to find a filter by function comparison', function() {
      var filter = function(model) { return model.get('id') !== 2; };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.find_filter(filter)).toBe(filter);
    });
  });
  describe('activate_filter', function() {
    it('should activate an inactive filter', function() {
      var filter = {
        name: 'id',
        fn: function(model) { return model.get('id') !== 2; },
        active: false
      };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(2);
      this.view.activate_filter('id');
      expect(this.view.child_views.length).toBe(1);
    });
  });
  describe('deactivate_filter', function() {
    it('should activate an inactive filter', function() {
      var filter = {
        name: 'id',
        fn: function(model) { return model.get('id') !== 2; },
        active: true
      };
      var constructor = FilteredCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list',
        filters: [
          filter
        ]
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(1);
      this.view.deactivate_filter('id');
      expect(this.view.child_views.length).toBe(2);
      expect(this.view.filters.length).toBe(1);
    });
  });
});
