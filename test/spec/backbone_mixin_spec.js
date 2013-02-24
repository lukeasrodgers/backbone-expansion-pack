describe('backbone_mixin', function() {
  describe('Utils.mixin', function() {
    beforeEach(function() {
      this.counter = 0;
      this.ModelConstructor = Backbone.Model.extend({});
    });
    it('should mix methods into another "class"', function() {
      var mixin = {
        mixed_in_method: function() {}
      };
      this.ModelConstructor.mixin(mixin);
      var model = new this.ModelConstructor();
      expect(model.mixed_in_method).not.toBeUndefined();
    });
    it('should wrap the mixed-in class\'s `initialize`', function() {
      var that = this;
      this.ModelConstructor.prototype.initialize = function() {
        that.counter++;
      };
      var MixinModel = Backbone.Model.extend({
        initialize: function() {
          that.counter++;
        }
      });
      this.ModelConstructor.mixin(MixinModel.prototype);
      var model = new this.ModelConstructor();
      expect(this.counter).toEqual(2);
    });
    it('should not wrap the mixed-in- class\'s `initialize` if it is the same as that of the mixing-in class ', function() {
      var that = this;
      this.ModelConstructor.prototype.initialize = function() {
        that.counter++;
      };
      var MixinModel = this.ModelConstructor.extend({
        other_method: function() {}
      });
      this.ModelConstructor.mixin(MixinModel.prototype);
      var model = new this.ModelConstructor();
      expect(this.counter).toEqual(1);
      expect(model.other_method).not.toBe(undefined);
    });
  });
  describe('Utils.view_mixin', function() {
    beforeEach(function() {
      this.counter = 0;
      this.ViewConstructor = Backbone.View.extend({});
    });
    it('should wrap the mixed-in view\'s `initialize`', function() {
      var that = this;
      this.ViewConstructor.prototype.initialize = function() {
        that.counter++;
      };
      var MixinView = Backbone.View.extend({
        initialize: function() {
          that.counter++;
        }
      });
      this.ViewConstructor.mixin(MixinView.prototype);
      var view = new this.ViewConstructor();
      expect(this.counter).toEqual(2);
    });
    it('should wrap the mixed-in view\'s `render`', function() {
      var that = this;
      this.ViewConstructor.prototype.render = function() {
        that.counter++;
      };
      var MixinView = Backbone.View.extend({
        render: function() {
          that.counter++;
        }
      });
      this.ViewConstructor.mixin(MixinView.prototype);
      var view = new this.ViewConstructor();
      view.render();
      expect(this.counter).toEqual(2);
    });
    describe('events', function() {
      it('should mixin events', function() {
        var call1 = 0, call2 = 0;
        var ViewConstructor = Backbone.View.extend({
          template: _.template('<a id="some_el">some el</a><a id="other_el">other el</a>'),
          events: {
            'click #some_el': 'click'
          },
          click: function(e) {
            e.preventDefault();
            call1 = 1;
          },
          render: function() {
            this.$el.html(this.template());
            return this;
          }
        });
        var MixinView = Backbone.View.extend({
          events: {
            'click #other_el': 'my_click'
          },
          my_click: function(e) {
            e.preventDefault();
            call2 = 1;
          }
        });
        ViewConstructor.mixin(MixinView.prototype);
        var view = new ViewConstructor();
        view.render();
        view.$('#some_el').click();
        view.$('#other_el').click();
        expect(call1).toEqual(1);
        expect(call2).toEqual(1);
      });
      it('should non-destructively overwrite the mixed-in view\'s `events` with those of the mixing-in view', function() {
        var that = this;
        var ViewConstructor = Backbone.View.extend({
          template: _.template('<a id="some_el">some el</a>'),
          events: {
            'click #some_el': 'click'
          },
          click: function(e) {
            e.preventDefault();
            that.counter = 5;
          },
          render: function() {
            this.$el.html(this.template());
            return this;
          }
        });
        var MixinView = Backbone.View.extend({
          events: {
            'click #some_el': 'my_click'
          },
          my_click: function(e) {
            e.preventDefault();
            that.counter = 4;
          }
        });
        ViewConstructor.mixin(MixinView.prototype);
        var view = new ViewConstructor();
        view.render();
        view.$('#some_el').click();
        expect(this.counter).toEqual(5);
      });
      it('should not affect events hash up the prototype chain', function() {
        var that = this;
        var ParentViewConstructor = Backbone.View.extend({
          template: _.template('<a id="some_el">some el</a>'),
          events: {
            'click #some_el': 'click'
          },
          click: function(e) {
            e.preventDefault();
            that.counter = 5;
          },
          render: function() {
            this.$el.html(this.template());
            return this;
          }
        });
        var ViewConstructor = ParentViewConstructor.extend({});
        var MixinView = Backbone.View.extend({
          events: {
            'click #other_el': 'my_click'
          },
          my_click: function(e) {
            e.preventDefault();
            that.counter = 4;
          }
        });
        ViewConstructor.mixin(MixinView.prototype);
        expect(ViewConstructor.prototype.events['click #other_el']).not.toBe(undefined);
        expect(ParentViewConstructor.prototype.events['click #other_el']).toBe(undefined);
      });
    });
  });
});
