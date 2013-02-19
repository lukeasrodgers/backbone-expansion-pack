describe('ModelView', function() {
  describe('initialize', function() {
    it('should throw an error if no template', function() {
      var constructor = ModelView.extend();
      spyOn(constructor.prototype, 'render');
      expect(function() { new constructor({model: new Backbone.Model() }); }).toThrow('No template provided');
    });
    it('should throw an error if no model', function() {
      var constructor = ModelView.extend({template: 'some template' });
      spyOn(constructor.prototype, 'render');
      expect(function() { new constructor(); }).toThrow('No model provided');
    });
  });
  describe('render', function() {
    beforeEach(function() {
      this.model = new Backbone.Model({id: 1, foo: 'bar'});
      $('body').append('<div id="renderer" />');
      window.JST.footemplate = _.template('My id is <%= id %> and my name is <%= foo %>');
    });
    afterEach(function() {
      delete window.JST.footemplate;
      this.view.remove();
    });
    it('should pass the model JSON to the template and render it in the views element', function() {
      var constructor = ModelView.extend({template: 'footemplate'});
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      expect($('#renderer').html()).toContain('My id is 1 and my name is bar');
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
  describe('remove', function() {
    beforeEach(function() {
      this.model = new Backbone.Model({id: 1, foo: 'bar'});
      $('body').append('<div id="renderer" />');
      window.JST.footemplate = _.template('my html');
    });
    afterEach(function() {
      delete window.JST.footemplate;
    });
    it('should call dispose', function() {
      var constructor = ModelView.extend({template: 'footemplate'});
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      expect($('#renderer').html()).toContain('my html');
      var dispose_spy = spyOn(this.view, 'dispose');
      this.view.remove();
      expect(dispose_spy).toHaveBeenCalled();
      expect($('#renderer').length).toBe(0);
    });
  });
  describe('assign', function() {
    beforeEach(function() {
      this.model = new Backbone.Model({id: 1, foo: 'bar'});
      $('body').append('<div id="renderer" />');
      window.JST.footemplate = _.template('<div id="subviewtarget" />');
      window.JST.subtemplate = _.template('<li>subtemplate</li>');
    });
    afterEach(function() {
      delete window.JST.footemplate;
      this.view.remove();
    });
    it('should render a subview', function() {
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.subview = new subview_constructor({model: new Backbone.Model()});
          ModelView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
          ModelView.prototype.render.apply(this, arguments);
          this.assign(this.subview, '#subviewtarget');
        }
      });
      var subview_constructor = ModelView.extend({template: 'subtemplate'});
      this.view = new constructor({
        model: this.model,
        el: '#renderer'
      });
      this.view.render();
      expect($('#renderer').html()).toContain('subtemplate');
    });
    it('should render a subview even if the view is NOT in the DOM', function() {
      var subview_constructor = ModelView.extend({template: 'subtemplate'});
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.subview = new subview_constructor({model: new Backbone.Model()});
        },
        render: function() {
          ModelView.prototype.render.apply(this, arguments);
          this.assign(this.subview, '#subviewtarget');
        }
      });
      this.view = new constructor({
        model: this.model
      });
      this.view.render();
      expect($('#renderer').html()).toBe('');
      expect(this.view.$el.find('#subviewtarget').html()).toContain('subtemplate');
    });
    it('should not result in duplicate child view elements when render is called multiple times', function() {
      var subview_constructor = ModelView.extend({template: 'subtemplate', tagName: 'li', className: 'foobar'});
      var constructor = ModelView.extend({
        template: 'footemplate',
        initialize: function() {
          this.subview = new subview_constructor({model: new Backbone.Model()});
        },
        render: function() {
          ModelView.prototype.render.apply(this, arguments);
          this.assign(this.subview, '#subviewtarget');
        }
      });
      this.view = new constructor({
        model: this.model,
        el: '#renderer'
      });
      this.view.render();
      expect(this.view.$('li').length).toBe(1);
      this.view.render();
      expect(this.view.$('li').length).toBe(1);
    });
    describe('assigning collection views', function() {
      beforeEach(function() {
        window.JST.coll_view_tpl = _.template('<h3>list</h3><ul id="list"></ul>');
        window.JST.model_view_tpl = _.template('some tpl stuff <%= name %>');
        var that = this;
        this.child_view_constructor = ModelView.extend({
          initialize: function() {
            this.model.on('change', this.model_change, this);
            ModelView.prototype.initialize.call(this);
          },
          template: 'model_view_tpl',
          tagName: 'li',
          model_change: function() { return; }
        });
        this.coll_view_constructor = CollectionView.extend({
          template: 'coll_view_tpl',
          list_selector: '#list',
          child_view_constructor: this.child_view_constructor
        });
        this.view_constructor = ModelView.extend({
          template: 'footemplate',
          initialize: function() {
            this.coll_view = new that.coll_view_constructor({collection: new Backbone.Collection([{id: 1, name: 'foo'}, {id: 2, name: 'Jim'}])});
          },
          render: function() {
            this.$el.html(JST[this.template]());
            this.assign(this.coll_view, '#subviewtarget');
          }
        });
      });
      it('should be able to correctly render an assigned collection view', function() {
        this.view = new this.view_constructor({
          el: '#renderer'
        });
        this.view.render();
        expect(this.view.$('#list li').length).toBe(2);
      });
      it('should not duplicate child elements in an assigned collection view if render is called multiple times', function() {
        this.view = new this.view_constructor({
          el: '#renderer'
        });
        this.view.render();
        expect(this.view.$('#list li').length).toBe(2);
        this.view.render();
        expect(this.view.$('#list li').length).toBe(2);
      });
      it('should effectively remove child views from assigned collection views when `remove` is called', function() {
        // if child view constructor implements dispose (as modelview does), this test will pass
        var model_change_spy = spyOn(this.child_view_constructor.prototype, 'model_change');
        var coll_view_remove_spy = spyOn(CollectionView.prototype, 'remove').andCallThrough();
        this.view = new this.view_constructor({
          el: '#renderer'
        });
        this.view.render();
        this.view.coll_view.collection.at(1).set('name', 'Jimbo');
        expect(model_change_spy).toHaveBeenCalled();
        this.view.remove();
        expect(coll_view_remove_spy).toHaveBeenCalled();
        this.view.coll_view.collection.at(1).set('name', 'Jimbo Jones');
        expect(model_change_spy.calls.length).toBe(1);
      });
    });
  });
});
