describe('ModelEditView', function() {
  describe('modelChange', function() {
    beforeEach(function() {
      this.modelconstructor = Backbone.Model.extend({
        validate: function() { return; }
      });
      this.model = new this.modelconstructor({id: 1, foo: 'bar'});
      $('body').append('<div id="renderer" />');
    });
    afterEach(function() {
      delete window.JST.tpl;
      this.view.remove();
    });
    it('should set a value from a form element on the view\'s model', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" name="foo" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_set_spy = spyOn(this.model, 'set');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('baz').trigger('change');
      expect(model_set_spy).toHaveBeenCalled();
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: 'baz'});
    });
    it('should do silent set by default', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" name="foo" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_validation_spy = spyOn(this.model, 'validate');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('baz').trigger('change');
      expect(model_validation_spy).not.toHaveBeenCalled();
    });
    it('should NOT do silent set by if is-silent-set="false"', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" name="foo" data-silent-set="false" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_validation_spy = spyOn(this.modelconstructor.prototype, 'validate');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('baz').trigger('change');
      expect(model_validation_spy).toHaveBeenCalled();
    });
    it('should strip id or cid attributes from the element\'s name if data-strip-id="true"', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" name="foo_<%= id %>" data-strip-id="true" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_set_spy = spyOn(this.model, 'set');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('biz').trigger('change');
      expect(model_set_spy).toHaveBeenCalled();
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: 'biz'});
    });
    it('should parse a number from the currency string if data-is-currency="true"', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" name="foo" data-is-currency="true" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_set_spy = spyOn(this.model, 'set');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('$34.99').trigger('change');
      expect(model_set_spy).toHaveBeenCalled();
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: 34.99});
    });
    it('should parse a number from the value string if data-is-number', function() {
      window.JST.tpl = _.template('<form><input class="change-aware" data-is-number="true" name="foo" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_set_spy = spyOn(this.model, 'set');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').val('34.99').trigger('change');
      expect(model_set_spy).toHaveBeenCalled();
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: 34.99});
    });
    it('should update a model attribute in a boolean fashion if a checkbox has data-set-value="boolean"', function() {
      window.JST.tpl = _.template('<form><input type="checkbox" class="change-aware" data-set-value="boolean" name="foo" /></form>');
      var constructor = ModelEditView.extend({template: 'tpl'});
      var model_set_spy = spyOn(this.model, 'set');
      this.view = new constructor({model: this.model, el: '#renderer'});
      this.view.render();
      this.view.$el.find('input').attr('checked', 'checked').trigger('change');
      expect(model_set_spy).toHaveBeenCalled();
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: true});
      this.view.$el.find('input').removeAttr('checked').trigger('change');
      expect(model_set_spy.mostRecentCall.args[0]).toEqual({foo: false});
    });
  });
});
