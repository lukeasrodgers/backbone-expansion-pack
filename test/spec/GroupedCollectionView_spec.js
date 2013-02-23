describe('GroupedCollectionView', function() {
  describe('initialize', function() {
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
    it('should throw an error if no template', function() {
      var constructor = GroupedCollectionView.extend({
        child_view_constructor: Backbone.View
      });
      expect(function() { new constructor({collection: this.collection}); }).toThrow('no template provided');
    });
    it('should throw an error if no child view constructor', function() {
      var constructor = GroupedCollectionView.extend({
        template: 'tpl'
      });
      expect(function() { new constructor({collection: this.collection}); }).toThrow('no child view constructor provided: tpl');
    });
    it('should throw an error if no list selector', function() {
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View
      });
      expect(function() { new constructor({collection: this.collection}); }).toThrow('no list selector provided');
    });
    it('should initialize an array of unrendered child views for each model in the collection', function() {
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(this.collection.length);
      expect(_(this.view.child_views).all(function(child_view) { return child_view.rendered === false; })).toBe(true);
    });
    it('should bind collection#reset to view#reset', function() {
      var reset_spy = spyOn(GroupedCollectionView.prototype, 'reset');
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      this.collection.reset();
      expect(reset_spy).toHaveBeenCalled();
    });
    it('should bind collection#add to view#add', function() {
      var add_spy = spyOn(GroupedCollectionView.prototype, 'add_child');
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      this.collection.add({id: 10});
      expect(add_spy).toHaveBeenCalled();
    });
    it('should bind collection#remove to view#remove', function() {
      var remove_spy = spyOn(GroupedCollectionView.prototype, 'remove_child');
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      this.collection.remove(this.collection.at(0));
      expect(remove_spy).toHaveBeenCalled();
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
      var constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      var trigger_spy = spyOn(constructor.prototype, 'trigger');
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      expect(trigger_spy).toHaveBeenCalledWith('after_initialize_child_views');
    });
  });
  describe('new_child_view', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzz'}]);
      this.child_view_constructor = Backbone.View.extend({
        tagName: 'li',
        template: 'child_view_tpl'
      });
      this.constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: this.child_view_constructor,
        list_selector: '#list'
      });
      $('body').append('<div id="renderer" />');
      window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
      window.JST.child_view_tpl = _.template('child view template');
    });
    afterEach(function() {
      this.view.remove();
      $('#renderer').remove();
      delete window.JST.tpl;
    });
    it('should return a new, unrendered child view, with the collection view passed to child view options', function() {
      this.view = new this.constructor({collection: this.collection, el: '#renderer'});
      var new_model = new Backbone.Model({id: 1, foo: 'bar'});
      var new_child_view = this.view.new_child_view(new_model);
      expect(new_child_view.rendered).toBe(false);
      expect(new_child_view.view instanceof this.child_view_constructor).toBe(true);
      expect(new_child_view.view.options.parentView).toBe(this.view);
      expect(new_child_view.view.$el.get(0).offsetParent).toBe(null); // not in DOM
    });
  });
  describe('reset', function() {
    beforeEach(function() {
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzz'}]);
      this.constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: Backbone.View,
        list_selector: '#list'
      });
      $('body').append('<div id="renderer" />');
      window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
    });
    afterEach(function() {
      this.view.remove();
      $('#renderer').remove();
      delete window.JST.tpl;
    });
    it('should clear the array of child_views', function() {
      this.view = new this.constructor({collection: this.collection, el: '#renderer'});
      expect(this.view.child_views.length).toBe(this.collection.length);
      this.view.reset();
      expect(this.view.child_views.length).toBe(this.collection.length);
    });
    it('should call `remove` on child views', function() {
      this.view = new this.constructor({collection: this.collection, el: '#renderer'});
      var remove_spy = spyOn(this.view.child_views[0].view, 'remove');
      this.view.reset();
      expect(remove_spy).toHaveBeenCalled();
    });
    it('should re-render', function() {
      this.view = new this.constructor({collection: this.collection, el: '#renderer'});
      var render_spy = spyOn(this.view, 'render');
      this.view.reset();
      expect(render_spy).toHaveBeenCalled();
    });
  });
  describe('rendering methods', function() {
    beforeEach(function() {
      // group render-related methods here since they share so much setup and teardown
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzzard'}]);
      this.child_view_constructor = Backbone.View.extend({
        tagName: 'li',
        events: { 'click .clicker': 'click' },
        dispose: function() { return; },
        template: 'child_view_tpl',
        click: function() { return; },
        render: function() { this.$el.html(JST[this.template](this.model.toJSON())); return this; }
      });
      this.constructor = GroupedCollectionView.extend({
        template: 'tpl',
        child_view_constructor: this.child_view_constructor,
        list_selector: '#list'
      });
      $('body').append('<div id="renderer" />');
      window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
      window.JST.child_view_tpl = _.template('<a href="#" class="clicker">click <%= fiz %></a>');
    });
    afterEach(function() {
      this.view.remove();
      $('#renderer').remove();
      delete window.JST.tpl;
    });
    describe('grouped rendering', function() {
      beforeEach(function() {
        this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz', other_id: 1}, {id: 3, fiz: 'buzz', other_id: 1}, {id: 4, fiz: 'buzz', other_id: 2}, {id: 5, fiz: 'buzz', other_id: 2}, {id: 6, fiz: 'buzz', other_id: 2}]);
        this.constructor = GroupedCollectionView.extend({
          template: 'tpl',
          child_view_constructor: this.child_view_constructor,
          list_selector: '#list',
          groups: [{
            name: 'some_group',
            fn: function(child_view) {
              return child_view.view.model.get('other_id');
            }
          }],
          name_for_group: function(group) {
            var model = _(group).first().view.model;
            return "Other id: " + model.get('other_id');
          }
        });
      });
      it('should group childviews', function() {
        var clicker_spy = spyOn(this.child_view_constructor.prototype, 'click');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        expect(this.view.$('#list li').length).toBe(7);
        expect(this.view.$('#list li:first').html()).toContain('Other id: 1');
        expect(this.view.$('#list li:nth-of-type(2)').html()).toContain('buzz');
        this.view.$('#list li:nth-of-type(2) .clicker').click();
        expect(clicker_spy).toHaveBeenCalled();
      });
      describe('toggle_group', function() {
        it('should toggle grouping', function() {
          this.view = new this.constructor({collection: this.collection, el: '#renderer'});
          this.view.render();
          expect(this.view.$('#list li').length).toBe(7);
          this.view.toggle_group('some_group');
          expect(this.view.$('#list li').length).toBe(5);
          this.view.toggle_group('some_group');
          expect(this.view.$('#list li').length).toBe(7);
        });
      });
    });
    describe('render', function() {
      it('should append child view elements to the node specified by list selector, with events bound', function() {
        var clicker_spy = spyOn(this.child_view_constructor.prototype, 'click');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        expect(this.view.$('#list li').length).toBe(2);
        expect(this.view.$('#list li:first').html()).toContain('buzz');
        this.view.$('#list li:first .clicker').click();
        expect(clicker_spy).toHaveBeenCalled();
      });
    });
    describe('append', function() {
      it('should append a view and bind events', function() {
        var clicker_spy = spyOn(this.child_view_constructor.prototype, 'click');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        this.view.append(new this.child_view_constructor({model: new Backbone.Model({id: 4, fiz: 'yabbadabba'})}));
        expect(this.view.$('#list li').length).toBe(3);
        expect(this.view.$('#list li:eq(2)').html()).toContain('yabbadabba');
        this.view.$('#list li:eq(2) .clicker').click();
        expect(clicker_spy).toHaveBeenCalled();
      });
    });
    describe('prepend', function() {
      it('should prepend a view and bind events', function() {
        var clicker_spy = spyOn(this.child_view_constructor.prototype, 'click');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        this.view.prepend(new this.child_view_constructor({model: new Backbone.Model({id: 4, fiz: 'yabbadabba'})}));
        expect(this.view.$('#list li').length).toBe(3);
        expect(this.view.$('#list li:eq(0)').html()).toContain('yabbadabba');
        this.view.$('#list li:eq(0) .clicker').click();
        expect(clicker_spy).toHaveBeenCalled();
      });
    });
    describe('find_view', function() {
      it('should vind a view by its model', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        var child_view = this.view.find_view(this.collection.get(3));
        expect(child_view.view.$el.html()).toContain('buzzard');
      });
    });
    describe('reverse_render', function() {
      it('should render subview in reverse order', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.reverse_render(function(model) { return model.get('id'); });
        expect(this.view.$('#list li').length).toBe(2);
        expect(this.view.$('#list li:first').html()).toContain('buzzard');
      });
    });
    describe('add_child', function() {
      it('should do nothing if model _destroy attribute is truthy', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        expect(this.view.child_views.length).toBe(2);
        this.view.add_child(new Backbone.Model({_destroy: true}));
        expect(this.view.child_views.length).toBe(2);
      });
      it('should append a new child view to view.child_views if model _destroy is NOT truthy', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.add_child(new Backbone.Model());
        expect(this.view.child_views.length).toBe(3);
      });
      it('should append the new child_view if this collection view is rendered', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        this.view.add_child(new Backbone.Model({fiz: 'fuzz'}));
        expect(this.view.$('li:last').html()).toContain('fuzz');
      });
    });
    describe('remove_child', function() {
      it('should remove a child view by matching its model', function() {
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        this.view.remove_child(this.collection.get(3));
        expect(this.view.child_views.length).toBe(1);
        expect(this.view.$el.html()).not.toContain('buzzard');
      });
    });
    describe('remove', function() {
      it('should call `remove` on child views', function() {
        var child_remove_spy = spyOn(this.child_view_constructor.prototype, 'remove');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        this.view.remove();
        expect(child_remove_spy.calls.length).toBe(2);
      });
      it('should unbind events bound to this view\'s collection with this view as context, and leave other events bound to the collection', function() {
        var view_add_spy = jasmine.createSpy('view_add_spy');
        var add_spy = jasmine.createSpy('add_spy');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.collection.on('add', view_add_spy, this.view);
        this.collection.on('add', add_spy);
        this.collection.add({id: 5, fiz: 'whammo'});
        this.view.dispose();
        this.collection.add({id: 6, fiz: 'blammo'});
        expect(view_add_spy.calls.length).toBe(1);
        expect(add_spy.calls.length).toBe(2);
      });
      it('should unbind events bound to this view\'s model (if it has one) with this view as context, and leave other events bound to the model', function() {
        var view_change_spy = jasmine.createSpy('view_add_spy');
        var change_spy = jasmine.createSpy('add_spy');
        var model = new Backbone.Model();
        this.view = new this.constructor({collection: this.collection, el: '#renderer', model: model});
        model.on('change', view_change_spy, this.view);
        model.on('change', change_spy);
        model.set('foo', 'bar');
        this.view.dispose();
        model.set('baz', 1);
        expect(view_change_spy.calls.length).toBe(1);
        expect(change_spy.calls.length).toBe(2);
      });
    });
  });
});
