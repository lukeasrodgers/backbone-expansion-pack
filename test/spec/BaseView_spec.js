describe('BaseView', function() {
  describe('initialize', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
    });
    it('should trigger event `after:initialize`', function() {
      var ViewConstructor = BaseView.extend({
        template: 'tpl'
      });
      var spy = spyOn(ViewConstructor.prototype, 'trigger');
      var view = new ViewConstructor();
      expect(spy).toHaveBeenCalledWith('after:initialize');
    });
  });
  describe('render', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
    });
    it('should trigger render events', function() {
      var ViewConstructor = BaseView.extend({
        template: 'tpl'
      });
      var spy = spyOn(ViewConstructor.prototype, 'trigger');
      var view = new ViewConstructor();
      view.render();
      expect(spy).toHaveBeenCalledWith('before:render');
      expect(spy).toHaveBeenCalledWith('after:render');
      expect(spy).toHaveBeenCalledWith('html_ready');
    });
  });
  describe('assign', function() {
    beforeEach(function() {
      $('body').append('<div id="renderer" />');
      window.JST.footemplate = _.template('<div id="subviewtarget" />');
      window.JST.subtemplate = _.template('<li>subtemplate</li>');
    });
    afterEach(function() {
      delete window.JST.footemplate;
      this.view.remove();
      $('#renderer').remove();
    });
    it('should render a subview', function() {
      var constructor = BaseView.extend({
        template: 'footemplate',
        initialize: function() {
          this.subview = new subview_constructor({model: new Backbone.Model()});
          BaseView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
          BaseView.prototype.render.apply(this, arguments);
          this.assign(this.subview, '#subviewtarget');
          return this;
        }
      });
      var spy = spyOn(constructor.prototype, 'trigger');
      var subview_constructor = BaseView.extend({template: 'subtemplate'});
      this.view = new constructor({
        model: this.model,
        el: '#renderer'
      });
      this.view.render();
      expect($('#renderer').html()).toContain('subtemplate');
      expect(spy).toHaveBeenCalledWith('assigned_view');
    });
  });
  describe('setup_bindings', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
      var ViewConstructor = BaseView.extend({
        template: 'tpl',
        bindings: {
          'after:render': 'after_render'
        },
        after_render: function() {console.log('foo');}
      });
      this.spy = spyOn(ViewConstructor.prototype, 'after_render');
      this.view = new ViewConstructor();
    });
    afterEach(function() {});
    it('should establish the bindings declared in the view\'s `bindings`', function() {
      this.view.render();
      expect(this.spy).toHaveBeenCalled();
    });
  });
  describe('teardown_bindings', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
      var ViewConstructor = BaseView.extend({
        template: 'tpl',
        bindings: {
          'after:render': 'after_render'
        },
        after_render: function() {console.log('foo');}
      });
      this.spy = spyOn(ViewConstructor.prototype, 'after_render');
      this.view = new ViewConstructor();
    });
    afterEach(function() {});
    it('should establish the bindings declared in the view\'s `bindings`', function() {
      this.view.render();
      this.view.teardown_bindings();
      this.view.render();
      expect(this.spy.calls.length).toBe(1);
    });
  });
  describe('dispose', function() {
    beforeEach(function() {
      this.model = new Backbone.Model({id: 1, foo: 'bar'});
      this.model.somefunc = function() { return; };
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzz'}]);
      this.collection.somefunc = function() { return; };
      $('body').append('<div id="renderer" />');
      window.JST.footemplate = _.template('<a href="#" id="clicker">clicker</a>, <a href="#" id="noclicker">noclicker</a>');
    });
    afterEach(function() {
      $('#renderer').remove();
      delete window.JST.footemplate;
    });
    it('should un delegate view events', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        events: {
          'click #clicker': 'clicker',
          'click #noclicker': 'noclicker'
        },
        clicker: function() { return; },
        noclicker: function() { return; }
      });
      // first make sure delegation is working
      var clicker_spy = spyOn(constructor.prototype, 'clicker');
      var noclicker_spy = spyOn(constructor.prototype, 'noclicker');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      $('#renderer #clicker').click();
      expect(clicker_spy).toHaveBeenCalled();
      // now test undelegation
      this.view.dispose();
      $('#renderer #noclicker').click();
      expect(noclicker_spy).not.toHaveBeenCalled();
    });
    it('should unbind events from the view\'s model that have the view as context', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.model.on('change', this.model_change, this);
        },
        model_change: function() { return; }
      });
      // first make sure binding is working
      var model_change_spy = spyOn(constructor.prototype, 'model_change');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.model.set('foo', 'bazar');
      expect(model_change_spy).toHaveBeenCalled();
      expect(model_change_spy.calls.length).toEqual(1);
      // now test unbinding
      this.view.dispose();
      this.model.set('foo', 'bazar2');
      expect(model_change_spy.calls.length).toEqual(1);
    });
    it('should NOT unbind events from the view\'s model that DO NOT have the view as context', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.model.on('change', this.model_change, this);
        },
        model_change: function() { return; }
      });
      // spies
      var view_model_change_spy = spyOn(constructor.prototype, 'model_change');
      var model_change_spy = spyOn(this.model, 'somefunc');
      // bindings
      this.model.on('change', this.model.somefunc, this.model);
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.dispose();
      this.model.set('foo', 'bazar');
      expect(view_model_change_spy).not.toHaveBeenCalled();
      expect(model_change_spy).toHaveBeenCalled();
    });
    it('should unbind events from the view\'s collection that have the view as context', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.collection.on('add', this.collection_add, this);
        },
        collection_add: function() { return; }
      });
      // first make sure binding is working
      var collection_add_spy = spyOn(constructor.prototype, 'collection_add');
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      this.collection.add({id: 4, foo: 'biz'});
      expect(collection_add_spy).toHaveBeenCalled();
      expect(collection_add_spy.calls.length).toEqual(1);
      // now test unbinding
      this.view.dispose();
      this.collection.add({id: 5, foo: 'bar'});
      expect(collection_add_spy.calls.length).toEqual(1);
    });
    it('should NOT unbind events from the view\'s collection that DO NOT have the view as context', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.collection.on('add', this.collection_add, this);
        },
        collection_add: function() { return; }
      });
      // spies
      var view_coll_add_spy = spyOn(constructor.prototype, 'collection_add');
      var collection_add_spy = spyOn(this.collection, 'somefunc');
      // bindings
      this.collection.on('add', this.collection.somefunc, this.collection);
      this.view = new constructor({collection: this.collection, el: '#renderer'});
      this.view.dispose();
      this.collection.add({id: 6, foo: 'bar'});
      expect(view_coll_add_spy).not.toHaveBeenCalled();
      expect(collection_add_spy).toHaveBeenCalled();
    });
  });
});
